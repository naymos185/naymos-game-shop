import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/notifications/external';

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

export async function notifyUserAndEmail(
  userId: string,
  email: string | null | undefined,
  title: string,
  body?: string,
  link?: string
): Promise<void> {
  await notifyUser(userId, title, body, link, 'success');
  if (email && email.includes('@')) {
    await sendEmail({
      to: email,
      subject: title,
      html: `<p>${body ?? title}</p>${link ? `<p><a href="${link}">เปิดดูออเดอร์</a></p>` : ''}`,
    });
  }
}
