export type GameFieldType = 'text' | 'number' | 'password' | 'select';

export interface GameField {
  id: string;
  game_id: string;
  key: string; // unique key like 'uid', 'zone_id', 'riot_id'
  label: string;
  type: GameFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for 'select' type
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

// Preset field configurations for quick setup
export const FIELD_PRESETS = {
  uid: { key: 'uid', label: 'UID / Player ID', type: 'text' as const, placeholder: 'กรอก UID' },
  zone_id: { key: 'zone_id', label: 'Zone ID', type: 'number' as const, placeholder: 'กรอก Zone ID' },
  open_id: { key: 'open_id', label: 'Open ID', type: 'text' as const, placeholder: 'กรอก Open ID' },
  riot_id: { key: 'riot_id', label: 'Riot ID', type: 'text' as const, placeholder: 'ชื่อผู้เล่น' },
  tagline: { key: 'tagline', label: 'Tagline', type: 'text' as const, placeholder: 'เช่น TH1' },
  region: { key: 'region', label: 'Region', type: 'text' as const, placeholder: 'AP / EU / NA' },
  server: { key: 'server', label: 'Server', type: 'text' as const, placeholder: 'Asia / Europe / America' },
  id: { key: 'id', label: 'ID / Username', type: 'text' as const, placeholder: 'กรอก ID' },
  password: { key: 'password', label: 'Password', type: 'password' as const, placeholder: 'กรอก Password' },
} as const;

export const FIELD_PRESET_GROUPS = {
  uid_only: [FIELD_PRESETS.uid],
  id_password: [FIELD_PRESETS.id, FIELD_PRESETS.password],
  uid_zone: [FIELD_PRESETS.uid, FIELD_PRESETS.zone_id],
  open_id: [FIELD_PRESETS.open_id],
  valorant: [FIELD_PRESETS.riot_id, FIELD_PRESETS.tagline, FIELD_PRESETS.region],
  genshin: [FIELD_PRESETS.uid, FIELD_PRESETS.server],
} as const;
