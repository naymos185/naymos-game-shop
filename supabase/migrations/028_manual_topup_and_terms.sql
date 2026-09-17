-- Migration 028: Manual Top-up enhancements and Terms of Service settings
-- Safe, additive-only migration

-- Ensure default terms_of_service in system_settings if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'store') THEN
    INSERT INTO public.system_settings (key, value, updated_at)
    VALUES (
      'store',
      jsonb_build_object(
        'name', 'NayMos GameShop',
        'promptpay_id', '0988251064',
        'bank_name', 'พร้อมเพย์',
        'account_name', 'ศักดาวิชญ์ คำใจ',
        'terms_of_service', '1. ลูกค้าต้องตรวจสอบ UID / Player ID / ข้อมูลเกมให้ถูกต้องครบถ้วนก่อนกดยืนยันสั่งซื้อ
2. หากกรอกข้อมูลไอดีผิด ร้านอาจไม่สามารถแก้ไขหรือดึงเงินคืนได้หลังจากเติมเงินแล้ว
3. หลังชำระเงินและอัปโหลดสลิปแล้ว เจ้าหน้าที่จะดำเนินการเติมให้ตามลำดับคิว
4. ร้านจะดำเนินการเติมเงินตามข้อมูลที่ลูกค้ากรอกเข้ามาในระบบเท่านั้น
5. การสั่งซื้อถือว่าลูกค้ายอมรับเงื่อนไขการให้บริการของร้านทุกประการ'
      ),
      NOW()
    );
  END IF;
END $$;
