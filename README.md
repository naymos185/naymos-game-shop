# NayMos GameShop

ร้านเติมเกมออนไลน์ — Next.js + TypeScript + Tailwind + Supabase

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Customer: http://localhost:3000
- Admin: http://localhost:3000/admin

## สถานะ

ระบบในแอป **ครบแล้ว** (ชำระ/เติมแบบ mock + ยืนยันด้วยมือ)

ประวัติออเดอร์: `/account/orders`  
ติดตามออเดอร์: `/order-tracking`  
(ไม่แยก timeline ซ้ำ — ยกเลิก 021 แล้ว)

### SQL ตอนเทส (ถ้ายังไม่รัน)

`018` → `019` → `020` เท่านั้น

## งานที่เหลือ (บริการภายนอก)

| เฟส | งาน | โครงในโค้ด |
|-----|-----|------------|
| P1 | ชำระ/สลิปอัตโนมัติ | `POST /api/webhooks/payment` |
| P2 | Provider เติมจริง | `POST /api/webhooks/provider` |
| P3 | Line / อีเมล | รอ API key |
| P4 | Deploy | Vercel + env |
