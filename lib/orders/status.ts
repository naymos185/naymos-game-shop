export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  PAID: 'ชำระแล้ว',
  PROCESSING: 'กำลังเติม',
  SUCCESS: 'สำเร็จ',
  FAILED: 'ล้มเหลว',
  REFUND_PENDING: 'รอคืนเงิน',
  REFUNDED: 'คืนเงินแล้ว',
  CANCELLED: 'ยกเลิก',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

export function orderStatusColor(status: string): string {
  switch (status) {
    case 'SUCCESS':
      return 'text-emerald-400 bg-emerald-500/15';
    case 'PENDING_PAYMENT':
      return 'text-amber-400 bg-amber-500/15';
    case 'PAID':
    case 'PROCESSING':
      return 'text-blue-400 bg-blue-500/15';
    case 'FAILED':
    case 'CANCELLED':
      return 'text-red-400 bg-red-500/15';
    default:
      return 'text-zinc-400 bg-zinc-700';
  }
}
