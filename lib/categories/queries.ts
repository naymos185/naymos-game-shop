import { createClient } from '@/lib/supabase/server';
import type { ProductCategory } from '@/types/game';

export async function getActiveProductCategories(): Promise<ProductCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data as ProductCategory[];
  } catch {
    return [];
  }
}

export async function getAllProductCategoriesAdmin(): Promise<ProductCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data as ProductCategory[];
  } catch {
    return [];
  }
}
