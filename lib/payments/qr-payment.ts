import type { PaymentProvider } from './payment.interface';
import type { Payment, PaymentStatus } from '@/types/payment';

/**
 * Standard PromptPay Payment Provider.
 * Generates official PromptPay payment reference and QR URL/payload.
 */
export class PromptPayPayment implements PaymentProvider {
  readonly id = 'promptpay';
  readonly name = 'PromptPay QR';

  constructor(private defaultPromptPayId?: string) {}

  async createPayment(data: {
    orderId: string;
    amount: number;
    orderNumber: string;
    expiresInMinutes?: number;
    promptpayId?: string;
  }): Promise<{
    payment: Partial<Payment>;
    qrData?: string;
    paymentUrl?: string;
  }> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresInMinutes ?? 30));

    const targetAccount = (data.promptpayId || this.defaultPromptPayId || process.env.NEXT_PUBLIC_PROMPTPAY_ID || '').trim();
    const qrData = targetAccount
      ? `https://promptpay.io/${encodeURIComponent(targetAccount)}/${data.amount}.png`
      : `PROMPTPAY|${data.orderNumber}|${data.amount}`;

    return {
      payment: {
        order_id: data.orderId,
        provider: this.id,
        payment_reference: `PP-${data.orderNumber}`,
        amount: data.amount,
        status: 'PENDING' as PaymentStatus,
        qr_data: qrData,
        expires_at: expiresAt.toISOString(),
      },
      qrData,
      paymentUrl: qrData.startsWith('https://') ? qrData : undefined,
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

/**
 * Isolated Mock QR payment for local development / testing only.
 * Must NOT be used in production.
 */
export class MockQrPayment implements PaymentProvider {
  readonly id = 'mock-qr';
  readonly name = 'Mock PromptPay QR (Dev Only)';

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
    expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresInMinutes ?? 15));

    const qrData = `MOCK|PROMPTPAY|${data.orderNumber}|${data.amount}|${expiresAt.toISOString()}`;

    return {
      payment: {
        order_id: data.orderId,
        provider: this.id,
        payment_reference: `DEV-${data.orderNumber}`,
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
