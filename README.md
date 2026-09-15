# NayMos GameShop

ร้านเติมเกมออนไลน์ — Next.js + TypeScript + Tailwind + Supabase

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

- ลูกค้า: http://localhost:3000
- Admin: http://localhost:3000/admin

## สถานะระบบ

| ส่วน | สถานะ |
|------|--------|
| เว็บลูกค้า + Admin | พร้อม |
| ออเดอร์ / ชำระ mock / สลิป / Wallet | พร้อม |
| Provider mock + HTTP จริง (เมื่อตั้ง env) | พร้อม |
| Webhook ชำระ / Provider | พร้อม |
| อีเมล Resend / Line (เมื่อตั้ง env) | พร้อม |
| Deploy | ดู `docs/PRODUCTION.md` |

SQL ที่อาจยังไม่รัน: **018 → 019 → 020**

## Env production

- `SUPABASE_SERVICE_ROLE_KEY` — webhook
- `PROVIDER_API_URL` + `PROVIDER_API_KEY` — เติมจริง
- `PAYMENT_WEBHOOK_SECRET` — รับแจ้งชำระ
- `RESEND_API_KEY` — อีเมล
