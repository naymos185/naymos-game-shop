# NayMos GameShop

ร้านเติมเกมออนไลน์ — Next.js App Router + TypeScript + Tailwind + Supabase

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Customer: http://localhost:3000
- Admin: http://localhost:3000/admin

## สถานะระบบ (ปัจจุบัน)

ระบบหลักในโค้ด **ครบแล้ว** (mock ชำระ/เติม):

- ลูกค้า: เกม, สั่งซื้อ, ชำระ, สลิป, Wallet, คูปอง, คะแนน, ติดตาม, ยกเลิก
- Admin: ออเดอร์, เกม/แพ็ก, ชำระ, สลิป, ลูกค้า, โปร/แบนเนอร์, รายงาน, Support
- SQL: `001`–`020` ใน `supabase/migrations/`

### ตอนเทสรอบใหญ่ รัน SQL ใหม่แค่

`018_payment_slip.sql` → `019_saved_players.sql` → `020_cancel_order.sql`

(ถ้าเคยรัน 001–017 แล้ว ไม่ต้องรันซ้ำ)

---

## เฟสที่เหลือ (Production)

| เฟส | งาน | ต้องมี |
|-----|-----|--------|
| **P1** | ชำระเงินจริง / ตรวจสลิปอัตโนมัติ | Gateway หรือ SlipOK + webhook |
| **P2** | Provider เติมเกมจริง | API ร้านเติม + key |
| **P3** | แจ้งเตือนภายนอก | Line OA / อีเมล (Resend ฯลฯ) |
| **P4** | Deploy production | Vercel (หรืออื่น) + domain + env |

**รวมเหลือประมาณ 4 เฟส** — ไม่ใช่ทำระบบในแอปซ้ำ แต่เชื่อมบริการภายนอก

โครง webhook พร้อมที่:

- `POST /api/webhooks/payment`
- `POST /api/webhooks/provider`

---

## Stack

Next.js · TypeScript · Tailwind · Supabase Auth/DB/RLS · React Hook Form · Zod
