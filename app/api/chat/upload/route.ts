import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const rand = Math.random().toString(36).substring(2, 8);
    const filename = `${user.id}/${Date.now()}-${rand}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    const { error: uploadErr } = await admin.storage
      .from('chat-media')
      .upload(filename, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = admin.storage.from('chat-media').getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
