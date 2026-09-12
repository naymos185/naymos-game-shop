export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  game_id: string;
  product_id: string;
  amount: number;
  status: OrderStatus;
  player_data: Record<string, string>;
  created_at: string;
  updated_at: string;
}
