import { createClient } from '@/lib/supabase/server';

export type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export async function listMyNotifications(limit = 30): Promise<NotificationRow[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, type, link, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as NotificationRow[];
  } catch {
    return [];
  }
}

export async function notifyUser(
  userId: string,
  title: string,
  body?: string,
  link?: string,
  type = 'info'
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_title: title,
      p_body: body ?? null,
      p_type: type,
      p_link: link ?? null,
    });
  } catch {
    /* best-effort */
  }
}
