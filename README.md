# NayMos GameShop

ร้านเติมเกมออนไลน์ — Next.js 16 + TypeScript + Tailwind + Supabase

## Quick start

```bash
npm install
cp .env.example .env.local
# ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

- Customer: http://localhost:3000
- Admin: http://localhost:3000/admin

## Phase 1

- เว็บลูกค้า: Homepage, เกม, ฟอร์มสั่งซื้อ (Mock), FAQ, วิธีเติม
- หลังบ้าน: Dashboard, เมนูครบ, ตารางเกม
- Architecture: Provider / Payment interfaces + Mock
- DB migration: `supabase/migrations/001_foundation.sql`
