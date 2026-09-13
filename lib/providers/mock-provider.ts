import type { GameProvider } from './provider.interface';
import type {
  TopupResult,
  TopupStatusResult,
  ValidatePlayerResult,
} from '@/types/provider';

/**
 * Mock provider for development and testing.
 * NEVER use this in production with real money.
 */
export class MockProvider implements GameProvider {
  readonly id = 'mock';
  readonly name = 'Mock Provider';

  async validatePlayer(
    data: Record<string, string | number>
  ): Promise<ValidatePlayerResult> {
    const hasValue = Object.values(data).some(
      (v) => v !== undefined && v !== null && String(v).trim() !== ''
    );

    if (!hasValue) {
      return {
        valid: false,
        message: 'กรุณากรอกข้อมูลผู้เล่นให้ครบถ้วน',
      };
    }

    return {
      valid: true,
      player_name: `Player_${Object.values(data)[0]}`,
      message: 'ตรวจสอบข้อมูลสำเร็จ (Mock)',
    };
  }

  async createTopup(data: {
    productId: string;
    playerData: Record<string, string | number>;
    orderId: string;
    amount?: number;
  }): Promise<TopupResult> {
    await new Promise((r) => setTimeout(r, 600));

    const transactionId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      success: true,
      transaction_id: transactionId,
      status: 'SUCCESS',
      message: 'เติมเกมสำเร็จ (Mock Provider)',
      raw: {
        mock: true,
        orderId: data.orderId,
        productId: data.productId,
        playerData: data.playerData,
      },
    };
  }

  async getTopupStatus(transactionId: string): Promise<TopupStatusResult> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      status: transactionId.startsWith('MOCK-') ? 'SUCCESS' : 'UNKNOWN',
      transaction_id: transactionId,
      message: 'Mock status',
    };
  }

  async getBalance(): Promise<{ balance: number; currency?: string }> {
    return { balance: 99999, currency: 'THB' };
  }
}
