/**
 * Public ID generator for Orders, Payments, and Invoices
 * Formats:
 * - ORD-YYMMDD-XXXX
 * - PAY-YYMMDD-XXXX
 * - INV-YYMMDD-XXXX
 */

function getYYMMDD(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function getRandomHexOrDigits(length = 4): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateOrderId(): string {
  return `ORD-${getYYMMDD()}-${getRandomHexOrDigits(4)}`;
}

export function generatePaymentId(): string {
  return `PAY-${getYYMMDD()}-${getRandomHexOrDigits(4)}`;
}

export function generateInvoiceId(): string {
  return `INV-${getYYMMDD()}-${getRandomHexOrDigits(4)}`;
}
