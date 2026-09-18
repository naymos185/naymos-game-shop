export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  QUEUED: 'รอคิวการเติม',
  PAID: 'รอคิวการเติม',
  PROCESSING: 'กำลังดำเนินการเติม',
  SUCCESS: 'เติมสำเร็จ',
  COMPLETED: 'เติมสำเร็จ',
  FAILED: 'ล้มเหลว',
  REFUND_PENDING: 'รอคืนเงิน',
  REFUNDED: 'คืนเงินแล้ว',
  CANCELLED: 'ยกเลิก',
  pending: 'รอชำระเงิน',
  awaiting_payment: 'รอชำระเงิน',
  paid: 'รอคิวการเติม',
  processing: 'กำลังดำเนินการเติม',
  completed: 'เติมสำเร็จ',
  failed: 'ล้มเหลว',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงินแล้ว',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

export function orderStatusColor(status: string): string {
  switch (status) {
    case 'SUCCESS':
    case 'COMPLETED':
    case 'completed':
      return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    case 'PENDING_PAYMENT':
    case 'pending':
    case 'awaiting_payment':
      return 'text-amber-700 bg-amber-50 border border-amber-200';
    case 'QUEUED':
    case 'PAID':
    case 'paid':
      return 'text-sky-700 bg-sky-50 border border-sky-200';
    case 'PROCESSING':
    case 'processing':
      return 'text-blue-700 bg-blue-50 border border-blue-200 animate-pulse';
    case 'FAILED':
    case 'failed':
    case 'CANCELLED':
    case 'cancelled':
      return 'text-rose-700 bg-rose-50 border border-rose-200';
    default:
      return 'text-slate-700 bg-slate-100 border border-slate-200';
  }
}
