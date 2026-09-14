import { createClient } from '@/lib/supabase/server';

export type SupportTicket = {
  id: string;
  user_id: string | null;
  email: string | null;
  subject: string;
  message: string;
  status: string;
  admin_note: string | null;
  created_at: string;
};

export async function listTicketsAdmin(limit = 50): Promise<SupportTicket[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((t) => ({
      id: t.id,
      user_id: t.user_id,
      email: t.email,
      subject: t.subject,
      message: t.message,
      status: t.status,
      admin_note: t.admin_note,
      created_at: t.created_at,
    }));
  } catch {
    return [];
  }
}
