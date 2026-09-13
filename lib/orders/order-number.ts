/** Generate order number: NM-YYYYMMDD-XXXX */
export function generateOrderNumber(): string {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NM-${date}-${rand}`;
}
