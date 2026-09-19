export type ProviderStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRY_NEEDED';

export interface ProviderTopupRequest {
  orderNumber: string;
  gameId: string;
  productId: string;
  providerProductId?: string | null;
  playerData: Record<string, unknown>;
  idempotencyKey: string;
}

export interface ProviderTopupResponse {
  success: boolean;
  status: ProviderStatus;
  providerTransactionId?: string;
  message?: string;
  rawResponse?: unknown;
}

export interface GameTopupProvider {
  name: string;
  processTopup(req: ProviderTopupRequest): Promise<ProviderTopupResponse>;
  checkStatus?(providerTransactionId: string): Promise<ProviderTopupResponse>;
  refund?(providerTransactionId: string, reason?: string): Promise<{ success: boolean; message?: string }>;
}
