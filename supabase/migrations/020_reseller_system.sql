-- 020_reseller_system.sql
-- เพิ่มบทบาท reseller (ตัวแทนจำหน่าย) ใน profiles และเพิ่มฟิลด์ reseller_price ใน products

-- 1. ปรับ Check constraint ของ role ใน profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'reseller', 'admin', 'super_admin'));

-- 2. เพิ่มคอลัมน์ reseller_price ใน products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reseller_price NUMERIC(10, 2) DEFAULT NULL;

-- 3. ฟังก์ชันตรวจสอบสิทธิ์ตัวแทนจำหน่าย
CREATE OR REPLACE FUNCTION public.is_reseller()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('reseller', 'admin', 'super_admin')
  );
$$;

COMMENT ON COLUMN public.products.reseller_price IS 'ราคาส่งสำหรับตัวแทนจำหน่าย (บาท)';
