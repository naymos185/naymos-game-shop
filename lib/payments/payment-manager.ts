import type { PaymentProvider } from './payment.interface';
import { MockQrPayment } from './qr-payment';

/**
 * PaymentManager registers and resolves payment providers.
 * Phase 1 uses Mock QR only.
 */
class PaymentManager {
  private providers = new Map<string, PaymentProvider>();

  constructor() {
    this.register(new MockQrPayment());
  }

  register(provider: PaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  get(id: string): PaymentProvider | undefined {
    return this.providers.get(id);
  }

  getDefault(): PaymentProvider {
    const mock = this.providers.get('mock-qr');
    if (mock) return mock;
    const first = this.providers.values().next().value;
    if (!first) {
      throw new Error('No payment providers registered');
    }
    return first;
  }
}

export const paymentManager = new PaymentManager();
