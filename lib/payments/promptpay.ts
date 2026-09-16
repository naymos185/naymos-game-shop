/**
 * PromptPay EMVCo QR Payload Generator
 * Supports Mobile (10 digits) and National ID (13 digits).
 */
export function generatePromptPayPayload(target: string, amount?: number | null): string {
  const sanitized = target.replace(/[^0-9]/g, '');
  
  let ppType = '01'; // 01 for mobile, 02 for national ID
  let value = sanitized;

  if (sanitized.length === 10 && sanitized.startsWith('0')) {
    ppType = '01';
    value = '0066' + sanitized.substring(1);
  } else if (sanitized.length === 9) {
    ppType = '01';
    value = '0066' + sanitized;
  } else if (sanitized.length === 13) {
    ppType = '02';
    value = sanitized;
  } else {
    // Fallback if not standard mobile or national ID
    return target;
  }

  const f00 = '000201'; // Format Indicator
  const f01 = amount && amount > 0 ? '010212' : '010211'; // 12 = dynamic, 11 = static
  
  // Tag 29: Merchant Account Information
  const aid = '0016A000000677010111';
  const subTag = `${ppType}${String(value.length).padStart(2, '0')}${value}`;
  const tag29Val = aid + subTag;
  const f29 = `29${String(tag29Val.length).padStart(2, '0')}${tag29Val}`;

  const f53 = '5303764'; // THB currency
  let f54 = '';
  if (amount && amount > 0) {
    const amtStr = amount.toFixed(2);
    f54 = `54${String(amtStr.length).padStart(2, '0')}${amtStr}`;
  }

  const f58 = '5802TH'; // Country TH

  const raw = f00 + f01 + f29 + f53 + f54 + f58 + '6304';

  // CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF)
  let crc = 0xFFFF;
  for (let i = 0; i < raw.length; i++) {
    crc ^= (raw.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return raw + crc.toString(16).toUpperCase().padStart(4, '0');
}
