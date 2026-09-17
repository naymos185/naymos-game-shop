import { createClient } from '@/lib/supabase/server';

export type StoreSettings = {
  name: string;
  promptpay_id: string;
  bank_name: string;
  account_name: string;
  terms_of_service?: string;
};

const DEFAULT_TERMS = `1. ลูกค้าต้องตรวจสอบ UID / Player ID / ข้อมูลเกมให้ถูกต้องครบถ้วนก่อนกดยืนยันสั่งซื้อ
2. หากกรอกข้อมูลไอดีผิด ร้านอาจไม่สามารถแก้ไข ดึงเงินคืน หรือโอนย้ายไปยังไอดีอื่นได้หลังจากเติมเงินแล้ว
3. หลังจากชำระเงินและอัปโหลดสลิปแล้ว เจ้าหน้าที่จะตรวจสอบสลิปและดำเนินการเติมเงินให้ตามลำดับคิว
4. ร้านจะดำเนินการเติมเงินตามข้อมูลที่ลูกค้ากรอกเข้ามาในระบบเท่านั้น หากเกิดข้อผิดพลาดจากข้อมูลที่ไม่ถูกต้องของลูกค้า ทางร้านขอสงวนสิทธิ์ไม่รับผิดชอบความเสียหายที่เกิดขึ้น
5. กรณีเกิดปัญหาจากระบบเกม เช่น ปิดปรับปรุงเซิร์ฟเวอร์ หรือสินค้าหมด ทางร้านจะติดต่อประสานงานช่วยเหลือหรือคืนเงินตามนโยบายของร้าน
6. การสั่งซื้อถือว่าลูกค้ายอมรับข้อกำหนดและเงื่อนไขการให้บริการของ NayMos GameShop ทุกประการ`;

const DEFAULTS: StoreSettings = {
  name: 'NayMos GameShop',
  promptpay_id: '0988251064',
  bank_name: 'พร้อมเพย์',
  account_name: 'ศักดาวิชญ์ คำใจ',
  terms_of_service: DEFAULT_TERMS,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'store')
      .maybeSingle();

    if (!data?.value || typeof data.value !== 'object') return DEFAULTS;
    const v = data.value as Record<string, unknown>;
    return {
      name: String(v.name ?? DEFAULTS.name),
      promptpay_id: String(v.promptpay_id ?? DEFAULTS.promptpay_id),
      bank_name: String(v.bank_name ?? DEFAULTS.bank_name),
      account_name: String(v.account_name ?? DEFAULTS.account_name),
      terms_of_service: String(v.terms_of_service ?? DEFAULT_TERMS),
    };
  } catch {
    return DEFAULTS;
  }
}

export async function saveStoreSettings(
  settings: StoreSettings
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('system_settings').upsert({
    key: 'store',
    value: settings,
    updated_at: new Date().toISOString(),
  });

  if (error) return { success: false, message: error.message };
  return { success: true };
}
