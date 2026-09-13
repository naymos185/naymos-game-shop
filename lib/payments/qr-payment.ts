import type { PaymentProvider } from './payment.interface';
import type { Payment, PaymentStatus } from '@/types/payment';

/**
 * Mock QR / PromptPay payment for Phase 1.
 * Later replace with real PromptPay / payment gateway SDK.
 */
export class MockQrPayment implements PaymentProvider {
  readonly id = 'mock-qr';
  readonly name = 'Mock PromptPay QR';

  async createPayment(data: {
    orderId: string;
    amount: number;
    orderNumber: string;
    expiresInMinutes?: number;
  }): Promise<{
    payment: Partial<Payment>;
    qrData?: string;
    paymentUrl?: string;
  }> {
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + (data.expiresInMinutes ?? 15)
    );

    const qrData = `MOCK|PROMPTPAY|${data.orderNumber}|${data.amount}|${expiresAt.toISOString()}`;

    return {
      payment: {
        order_id: data.orderId,
        provider: this.id,
        payment_reference: `QR-${data.orderNumber}`,
        amount: data.amount,
        status: 'PENDING' as PaymentStatus,
        qr_data: qrData,
        expires_at: expiresAt.toISOString(),
      },
      qrData,
    };
  }

  async getPaymentStatus(
    paymentReference: string
  ): Promise<{ status: PaymentStatus; paidAt?: string }> {
    if (paymentReference.includes('PAID')) {
      return {
        status: 'PAID',
        paidAt: new Date().toISOString(),
      };
    }
    return { status: 'PENDING' };
  }
}
