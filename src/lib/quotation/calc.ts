/**
 * Money maths and formatting for repair quotations. Pure — no I/O, no React,
 * so both the browser form and the PDF route compute identical figures.
 */
import type { QuotationInput, QuotationTotals } from './types';

/** Indian digit grouping: 12,34,56,789. */
export function inr(value: number): string {
  const n = Math.round(value);
  const sign = n < 0 ? '-' : '';
  const s = String(Math.abs(n));
  if (s.length <= 3) return sign + s;
  const tail = s.slice(-3);
  let head = s.slice(0, -3);
  const parts: string[] = [];
  while (head.length > 2) {
    parts.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  parts.unshift(head);
  return `${sign + parts.join(',')},${tail}`;
}

const ONES = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
  'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
  'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty',
  'Ninety',
];

function under100(n: number): string {
  if (n < 20) return ONES[n] ?? '';
  const t = TENS[Math.floor(n / 10)] ?? '';
  return n % 10 ? `${t} ${ONES[n % 10] ?? ''}` : t;
}

function under1000(n: number): string {
  if (n < 100) return under100(n);
  const h = `${ONES[Math.floor(n / 100)] ?? ''} Hundred`;
  return n % 100 ? `${h} and ${under100(n % 100)}` : h;
}

/** Indian-system amount in words, e.g. 25960 -> "Twenty Five Thousand Nine Hundred and Sixty". */
export function amountInWords(value: number): string {
  let n = Math.round(Math.abs(value));
  if (n === 0) return 'Zero';
  const out: string[] = [];
  const scales: readonly [number, string][] = [
    [10000000, 'Crore'],
    [100000, 'Lakh'],
    [1000, 'Thousand'],
  ];
  for (const [div, name] of scales) {
    if (n >= div) {
      out.push(`${under1000(Math.floor(n / div))} ${name}`);
      n %= div;
    }
  }
  if (n) out.push(under1000(n));
  return out.join(' ');
}

/**
 * Derive the totals.
 *
 * Note the discount applies to the service charge only, and the net service
 * charge is floored at zero — a discount larger than the labour charge must not
 * quietly eat into the parts total.
 */
export function computeTotals(input: {
  readonly items: readonly { readonly amount: number }[];
  readonly serviceCharge: number;
  readonly discount: number;
  readonly gstPercent: number;
}): QuotationTotals {
  const partsTotal = input.items.reduce(
    (sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0),
    0,
  );
  const netService = Math.max(0, (input.serviceCharge || 0) - (input.discount || 0));
  const subtotal = partsTotal + netService;
  const gstAmount = Math.round((subtotal * (input.gstPercent || 0)) / 100);
  return { partsTotal, netService, subtotal, gstAmount, total: subtotal + gstAmount };
}

/**
 * The part of a product label before the em dash — "Nexus" from
 * "Nexus — tracked inspection robot". Used for headings, filenames and the
 * reference number, where the descriptive tail only gets in the way.
 */
export function shortProductName(product: string): string {
  return (product.split('—')[0] ?? product).trim();
}

/** `ARN/NEXUS/RPR/2026-09/01` — the vault's reference convention. */
export function defaultReference(product: string, date: Date, seq = 1): string {
  const slug =
    (shortProductName(product).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ')[0] ?? '')
      .toUpperCase()
      .slice(0, 10) || 'PROD';
  const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `ARN/${slug}/RPR/${ym}/${String(seq).padStart(2, '0')}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

/** "10 September 2026" — the date format used across ARNOBOT documents. */
export function formatLongDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ''} ${date.getFullYear()}`;
}

/** Reject anything that would produce a nonsensical or empty quotation. */
export function validate(input: QuotationInput): string[] {
  const errors: string[] = [];
  if (!input.product.trim()) errors.push('Product is required.');
  if (!input.referenceNo.trim()) errors.push('Reference number is required.');
  if (!input.date.trim()) errors.push('Date is required.');
  const priced = input.items.filter((i) => i.component.trim());
  if (priced.length === 0) errors.push('Add at least one component.');
  if (priced.some((i) => !Number.isFinite(i.amount) || i.amount < 0)) {
    errors.push('Component amounts must be zero or more.');
  }
  if (input.serviceCharge < 0) errors.push('Service charge cannot be negative.');
  if (input.discount < 0) errors.push('Discount cannot be negative.');
  if (input.discount > input.serviceCharge) {
    errors.push('Discount cannot exceed the service charge.');
  }
  if (input.gstPercent < 0 || input.gstPercent > 100) {
    errors.push('GST must be between 0 and 100.');
  }
  // The component rows are pre-seeded from the product's presets, so a
  // quotation with every amount still blank is a half-filled form rather than a
  // free repair. Catch it here instead of emitting a PDF that bills nothing.
  if (priced.length > 0 && input.discount <= input.serviceCharge) {
    const { subtotal } = computeTotals({ ...input, items: priced });
    if (subtotal <= 0) errors.push('Enter at least one amount.');
  }
  return errors;
}
