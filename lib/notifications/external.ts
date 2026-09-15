/** P3 — External notifications (no-op if env missing) */

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; message?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, message: 'RESEND_API_KEY not set' };

  const from = process.env.EMAIL_FROM ?? 'NayMos <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, message: t.slice(0, 200) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'email error' };
  }
}

export async function sendLinePush(opts: {
  userId: string;
  text: string;
}): Promise<{ ok: boolean; message?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return { ok: false, message: 'LINE_CHANNEL_ACCESS_TOKEN not set' };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: opts.userId,
        messages: [{ type: 'text', text: opts.text.slice(0, 4000) }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, message: t.slice(0, 200) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'line error' };
  }
}
