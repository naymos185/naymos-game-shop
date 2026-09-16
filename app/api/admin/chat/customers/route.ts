import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    const admin = createAdminClient();

    let dbQuery = admin
      .from('profiles')
      .select('id, email, full_name, role, avatar_url, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(30);

    if (query) {
      // Check if query is a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
      if (isUuid) {
        dbQuery = dbQuery.eq('id', query);
      } else {
        dbQuery = dbQuery.or(`email.ilike.%${query}%,full_name.ilike.%${query}%,phone.ilike.%${query}%`);
      }
    }

    const { data: customers, error } = await dbQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customers: customers ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
