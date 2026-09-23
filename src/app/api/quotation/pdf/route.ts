import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, isValidAdminCookie } from '@/lib/auth';
import { validate } from '@/lib/quotation/calc';
import { quotationFilename, renderQuotationPdf } from '@/lib/quotation/pdf';
import type { QuotationInput, QuotationItem } from '@/lib/quotation/types';

// pdf-lib and the Buffer used to decode the inlined wordmark both need Node.
export const runtime = 'nodejs';

function num(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Narrow untrusted JSON into a QuotationInput. Unknown fields are dropped. */
function parseInput(body: unknown): QuotationInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(b.items) ? b.items : [];
  const items: QuotationItem[] = rawItems.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    return {
      component: str(item.component).trim(),
      description: str(item.description).trim() || undefined,
      work: str(item.work).trim() || undefined,
      amount: num(item.amount),
    };
  });
  return {
    product: str(b.product).trim(),
    items,
    serviceCharge: num(b.serviceCharge),
    discount: num(b.discount),
    gstPercent: num(b.gstPercent, 18),
    referenceNo: str(b.referenceNo).trim(),
    date: str(b.date).trim(),
    validityDays: num(b.validityDays),
    assessedBy: str(b.assessedBy).trim() || undefined,
    customer: str(b.customer).trim() || undefined,
    contact: str(b.contact).trim() || undefined,
    serialNo: str(b.serialNo).trim() || undefined,
    receivedOn: str(b.receivedOn).trim() || undefined,
    turnaroundDays: num(b.turnaroundDays),
    warrantyMonths: num(b.warrantyMonths),
    note: str(b.note).trim() || undefined,
  };
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!isValidAdminCookie(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const input = parseInput(body);
  // Drop blank rows before validating: the form always renders one empty row at
  // the bottom for the next entry, and submitting with it present is normal.
  const cleaned: QuotationInput = {
    ...input,
    items: input.items.filter((i) => i.component),
  };
  const errors = validate(cleaned);
  if (errors.length) {
    return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
  }

  const bytes = await renderQuotationPdf(cleaned);
  const filename = quotationFilename(cleaned.product);

  return new NextResponse(bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      // `filename*` carries the UTF-8 form for the em dash and any non-ASCII
      // product name; `filename` stays as an ASCII fallback for old clients.
      'Content-Disposition': `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, '-')}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
      'Content-Length': String(bytes.length),
    },
  });
}
