export type TopupStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

export interface ValidatePlayerResult {
  valid: boolean;
  playerName?: string;
  message?: string;
}

export interface TopupResult {
  success: boolean;
  transactionId?: string;
  status: TopupStatus;
  message?: string;
  raw?: unknown;
}

export interface TopupStatusResult {
  transactionId: string;
  status: TopupStatus;
  message?: string;
  completedAt?: string;
}
