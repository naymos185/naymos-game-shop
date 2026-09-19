import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isAccountRoute = pathname.startsWith('/account');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // Check if request has any Supabase auth cookies
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
  );

  // If visitor has no auth cookies at all:
  // - Admin & Account routes require login immediately without remote getUser() call
  // - Public routes skip remote getUser() completely, eliminating latency
  if (!hasAuthCookie) {
    if (isAdminRoute || isAccountRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // For public routes (/ , /games, /promotions, /how-to, /faq, /order-tracking, etc.):
  // Skip remote Supabase Auth network call in middleware completely!
  // This removes 150-300ms round-trip latency on every customer navigation.
  if (!isAdminRoute && !isAccountRoute && !isAuthRoute) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role ?? 'customer';
    if (role !== 'admin' && role !== 'super_admin') {
      const home = request.nextUrl.clone();
      home.pathname = '/';
      home.searchParams.set('error', 'admin_only');
      return NextResponse.redirect(home);
    }
  }

  if (isAccountRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    const next = request.nextUrl.searchParams.get('next') || '/account';
    const dest = request.nextUrl.clone();
    dest.pathname = next.startsWith('/') ? next : '/account';
    dest.search = '';
    return NextResponse.redirect(dest);
  }

  return supabaseResponse;
}
