export interface Provider {
  id: string;
  name: string;
  base_url?: string | null;
  is_active: boolean;
  priority: number;
  timeout: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderProduct {
  id: string;
  provider_id: string;
  game_id: string;
  product_id: string;
  provider_product_id: string;
  provider_price?: number | null;
  is_active: boolean;
}

export interface ProviderTransaction {
  id: string;
  order_id: string;
  provider_id: string;
  external_transaction_id?: string | null;
  request_payload?: Record<string, unknown> | null;
  response_payload?: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ValidatePlayerResult {
  valid: boolean;
  player_name?: string;
  message?: string;
}

export interface TopupResult {
  success: boolean;
  transaction_id?: string;
  status: string;
  message?: string;
  raw?: unknown;
}

export interface TopupStatusResult {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'UNKNOWN';
  transaction_id: string;
  message?: string;
  raw?: unknown;
}
