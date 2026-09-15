# Production checklist — NayMos GameShop

## 1. Supabase

- รัน migrations 001–020 (อย่ารัน 021)
- ตั้ง `profiles.role = 'admin'` ให้บัญชีเจ้าของ
- ใส่ `SUPABASE_SERVICE_ROLE_KEY` เฉพาะ server

## 2. Env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_WEBHOOK_SECRET=
PROVIDER_API_URL=
PROVIDER_API_KEY=
PROVIDER_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM=NayMos <noreply@yourdomain.com>
```

## 3. Webhooks

- Payment: POST /api/webhooks/payment + header x-webhook-secret
- Provider: POST /api/webhooks/provider + header x-webhook-secret

## 4. Deploy Vercel

Import repo → ใส่ env → Deploy → ผูก domain

## 5. ทดสอบ

สั่งซื้อ → ชำระ/webhook → เติม → ดูประวัติ
