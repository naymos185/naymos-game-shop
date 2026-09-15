import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: true, items: [], loggedIn: false });
    }

    let q = supabase
      .from('saved_players')
      .select('id, game_id, label, player_data, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (gameId) q = q.eq('game_id', gameId);

    const { data, error } = await q;
    if (error) {
      return NextResponse.json({ success: true, items: [], loggedIn: true });
    }
    return NextResponse.json({ success: true, items: data ?? [], loggedIn: true });
  } catch {
    return NextResponse.json({ success: true, items: [], loggedIn: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const gameId = String(body.game_id ?? '');
    const label = String(body.label ?? 'บัญชีหลัก').trim() || 'บัญชีหลัก';
    const playerData = (body.player_data ?? {}) as Record<string, string>;

    if (!gameId) {
      return NextResponse.json({ success: false, message: 'ไม่มีเกม' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'ต้องล็อกอิน' }, { status: 401 });
    }

    const { error } = await supabase.from('saved_players').upsert(
      {
        user_id: user.id,
        game_id: gameId,
        label,
        player_data: playerData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,game_id,label' }
    );

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ไม่มี id' }, { status: 400 });
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'ต้องล็อกอิน' }, { status: 401 });
    }
    await supabase.from('saved_players').delete().eq('id', id).eq('user_id', user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
