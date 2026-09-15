import type { GameProvider } from './provider.interface';
import type {
  TopupResult,
  TopupStatusResult,
  ValidatePlayerResult,
} from '@/types/provider';

/**
 * Real HTTP top-up provider.
 * Env: PROVIDER_API_URL, PROVIDER_API_KEY
 * POST {url}/topup — body: product_id, player_data, order_id, amount
 */
export class HttpProvider implements GameProvider {
  readonly id = 'http';
  readonly name = 'HTTP Provider';

  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'X-Api-Key': this.apiKey,
    };
  }

  async validatePlayer(
    data: Record<string, string | number>
  ): Promise<ValidatePlayerResult> {
    const hasValue = Object.values(data).some(
      (v) => v !== undefined && v !== null && String(v).trim() !== ''
    );
    if (!hasValue) {
      return { valid: false, message: 'กรุณากรอกข้อมูลผู้เล่น' };
    }
    try {
      const res = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ player_data: data }),
      });
      if (!res.ok) {
        return { valid: true, message: 'ข้าม validate (API ไม่รองรับ)' };
      }
      return (await res.json()) as ValidatePlayerResult;
    } catch {
      return { valid: true, message: 'ข้าม validate (เชื่อมต่อไม่ได้)' };
    }
  }

  async createTopup(data: {
    productId: string;
    playerData: Record<string, string | number>;
    orderId: string;
    amount?: number;
  }): Promise<TopupResult> {
    const res = await fetch(`${this.baseUrl}/topup`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        product_id: data.productId,
        player_data: data.playerData,
        order_id: data.orderId,
        amount: data.amount,
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      transaction_id?: string;
      status?: string;
      message?: string;
    };

    if (!res.ok || !json.success) {
      return {
        success: false,
        status: 'FAILED',
        message: json.message ?? `Provider HTTP ${res.status}`,
        transaction_id: json.transaction_id,
        raw: json,
      };
    }

    return {
      success: true,
      transaction_id: json.transaction_id,
      status: (json.status as TopupResult['status']) ?? 'SUCCESS',
      message: json.message ?? 'ส่งคำสั่งเติมแล้ว',
      raw: json,
    };
  }

  async getTopupStatus(transactionId: string): Promise<TopupStatusResult> {
    const res = await fetch(
      `${this.baseUrl}/topup/${encodeURIComponent(transactionId)}`,
      { headers: this.headers() }
    );
    const json = (await res.json().catch(() => ({}))) as TopupStatusResult;
    return {
      status: json.status ?? 'UNKNOWN',
      transaction_id: transactionId,
      message: json.message,
    };
  }

  async getBalance(): Promise<{ balance: number; currency?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/balance`, { headers: this.headers() });
      const json = (await res.json()) as { balance?: number; currency?: string };
      return { balance: Number(json.balance ?? 0), currency: json.currency ?? 'THB' };
    } catch {
      return { balance: 0, currency: 'THB' };
    }
  }
}
