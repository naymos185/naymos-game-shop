import type { PaymentProvider } from './payment.interface';
import { PromptPayPayment, MockQrPayment } from './qr-payment';

/**
 * PaymentManager registers and resolves payment providers.
 * PromptPay is the primary architecture. Mock is strictly isolated to development.
 */
class PaymentManager {
  private providers = new Map<string, PaymentProvider>();

  constructor() {
    // Primary production provider
    this.register(new PromptPayPayment());

    // Only allow mock provider in non-production environments
    if (process.env.NODE_ENV === 'development') {
      this.register(new MockQrPayment());
    }
  }

  register(provider: PaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  get(id: string): PaymentProvider | undefined {
    return this.providers.get(id);
  }

  getDefault(): PaymentProvider {
    const promptpay = this.providers.get('promptpay');
    if (promptpay) return promptpay;

    // Fallback if promptpay wasn't registered
    const first = this.providers.values().next().value;
    if (!first) {
      throw new Error('No payment providers registered');
    }
    return first;
  }
}

export const paymentManager = new PaymentManager();
