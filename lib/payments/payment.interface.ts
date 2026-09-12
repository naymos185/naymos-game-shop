import type { Payment, PaymentStatus } from '@/types/payment';

/**
 * Abstract payment provider interface.
 * Never trust frontend claims that payment is completed.
 */
export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  createPayment(data: {
    orderId: string;
    amount: number;
    orderNumber: string;
    expiresInMinutes?: number;
  }): Promise<{
    payment: Partial<Payment>;
    qrData?: string;
    paymentUrl?: string;
  }>;
  verifyWebhook?(
    payload: unknown,
    headers: Record<string, string>
  ): Promise<{
    valid: boolean;
    paymentReference?: string;
    amount?: number;
    status?: PaymentStatus;
    eventId?: string;
  }>;
  getPaymentStatus?(paymentReference: string): Promise<{
    status: PaymentStatus;
    paidAt?: string;
  }>;
}
