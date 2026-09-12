export type PaymentStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  method?: string;
  provider?: string;
  payment_reference?: string;
  qr_data?: string;
  paid_at?: string;
  expires_at?: string;
  created_at: string;
}
