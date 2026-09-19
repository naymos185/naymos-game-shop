export type CanonicalOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'QUEUED'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'CANCELLED';

export const ORDER_TRANSITIONS: Record<CanonicalOrderStatus, CanonicalOrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'QUEUED', 'CANCELLED'],
  PAID: ['QUEUED', 'PROCESSING', 'REFUND_PENDING', 'REFUNDED'],
  QUEUED: ['PROCESSING', 'CANCELLED', 'REFUND_PENDING'],
  PROCESSING: ['SUCCESS', 'FAILED', 'REFUND_PENDING'],
  SUCCESS: ['REFUND_PENDING'],
  FAILED: ['REFUND_PENDING', 'REFUNDED'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: [],
  CANCELLED: [],
};

export function isValidOrderTransition(
  currentStatus: string,
  targetStatus: CanonicalOrderStatus
): boolean {
  const normCurrent = currentStatus.toUpperCase() as CanonicalOrderStatus;
  const allowed = ORDER_TRANSITIONS[normCurrent];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
}
