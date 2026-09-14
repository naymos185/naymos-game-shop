import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: true, balance: null, loggedIn: false });
    }
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    return NextResponse.json({
      success: true,
      loggedIn: true,
      balance: Number(data?.balance ?? 0),
    });
  } catch {
    return NextResponse.json({ success: true, balance: null, loggedIn: false });
  }
}
