import { createClient } from '@/lib/supabase/server';

export type StoreSettings = {
  name: string;
  promptpay_id: string;
  bank_name: string;
  account_name: string;
};

const DEFAULTS: StoreSettings = {
  name: 'NayMos GameShop',
  promptpay_id: '',
  bank_name: 'พร้อมเพย์',
  account_name: 'NayMos GameShop',
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
      promptpay_id: String(v.promptpay_id ?? ''),
      bank_name: String(v.bank_name ?? DEFAULTS.bank_name),
      account_name: String(v.account_name ?? DEFAULTS.account_name),
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
