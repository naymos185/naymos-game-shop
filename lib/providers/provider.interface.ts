import type {
  TopupResult,
  TopupStatusResult,
  ValidatePlayerResult,
} from '@/types/provider';

/**
 * Abstract interface for all game top-up providers.
 * Never call provider APIs from the browser.
 */
export interface GameProvider {
  readonly id: string;
  readonly name: string;
  getProducts?(): Promise<unknown>;
  validatePlayer(data: Record<string, string | number>): Promise<ValidatePlayerResult>;
  createTopup(data: {
    productId: string;
    playerData: Record<string, string | number>;
    orderId: string;
    amount?: number;
  }): Promise<TopupResult>;
  getTopupStatus(transactionId: string): Promise<TopupStatusResult>;
  cancelTopup?(transactionId: string): Promise<{ success: boolean; message?: string }>;
  getBalance?(): Promise<{ balance: number; currency?: string }>;
}
