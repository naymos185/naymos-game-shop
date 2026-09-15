function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function normalizePromptPayId(id: string): string {
  const digits = id.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `66${digits.slice(1)}`;
  }
  if (digits.length === 13) return digits;
  if (digits.length === 15) return digits;
  return digits;
}

export function buildPromptPayPayload(
  promptpayId: string,
  amount?: number
): string {
  const target = normalizePromptPayId(promptpayId);
  if (!target) return '';

  const merchantInfo =
    tlv('00', 'A000000677010111') + tlv('01', target);

  let payload =
    tlv('00', '01') +
    tlv('01', amount && amount > 0 ? '12' : '11') +
    tlv('29', merchantInfo) +
    tlv('53', '764') +
    tlv('58', 'TH');

  if (amount && amount > 0) {
    payload += tlv('54', amount.toFixed(2));
  }

  payload += '6304';
  payload += crc16(payload);
  return payload;
}
