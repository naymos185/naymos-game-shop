export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'QUEUED'
  | 'PAID'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
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
  /** ยอดที่ต้องชำระจริง (หลังส่วนลด) */
  total: number;
  subtotal?: number;
  discount?: number;
  status: OrderStatus;
  player_data: Record<string, any>;
  payment_confirmed_at?: string | null;
  processing_started_at?: string | null;
  completed_at?: string | null;
  processing_admin_id?: string | null;
  completed_admin_id?: string | null;
  created_at: string;
  updated_at: string;
}
