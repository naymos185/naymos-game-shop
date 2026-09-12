export type GameFieldType = 'text' | 'number' | 'select';

export interface GameField {
  id: string;
  game_id: string;
  name: string;
  label: string;
  type: GameFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  sort_order: number;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  banner?: string | null;
  category?: string | null;
  is_active: boolean;
  sort_order: number;
  game_fields?: GameField[];
}

export interface Product {
  id: string;
  game_id: string;
  name: string;
  description?: string | null;
  amount?: number | null;
  currency: string;
  price: number;
  cost: number;
  provider_product_id?: string | null;
  is_active: boolean;
  sort_order: number;
}
