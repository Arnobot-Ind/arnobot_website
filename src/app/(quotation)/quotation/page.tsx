'use client';

/**
 * The repair-quotation desk.
 *
 * Enter the components being repaired, the labour and any discount, and get the
 * branded ARNOBOT quotation back as a PDF. Totals are computed here and again on
 * the server from the same `@/lib/quotation/calc` module, so the figures on
 * screen and the figures in the document cannot drift apart.
 *
 * Sign-in reuses the hiring assistant's admin password (`ADMIN_PASSWORD`) — this
 * is internal pricing, and it should not be readable by anyone who guesses the
 * URL.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArnobotLogo } from '@/components/quiz/Brand';
import {
  amountInWords,
  computeTotals,
  defaultReference,
  formatLongDate,
  inr,
  shortProductName,
  validate,
} from '@/lib/quotation/calc';
import { OTHER_PRODUCT_ID, QUOTATION_PRODUCTS, findProduct } from '@/lib/quotation/products';
import type { QuotationInput } from '@/lib/quotation/types';

interface Row {
  id: number;
  component: string;
  description: string;
  work: string;
  amount: string;
}

let nextRowId = 1;
function blankRow(): Row {
  nextRowId += 1;
  return { id: nextRowId, component: '', description: '', work: '', amount: '' };
}

/** The component rows a product starts with — its preset list, priced blank. */
function presetRows(productId: string): Row[] {
  const preset = findProduct(productId);
  if (!preset || preset.presets.length === 0) return [blankRow()];
  return preset.presets.map((p) => ({
    ...blankRow(),
    component: p.component,
    description: p.description,
    work: 'Repair / replacement',
  }));
}

function toNumber(value: string): number {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

const LABEL = 'block text-xs font-semibold text-ink mb-1';
const INPUT =
  'w-full rounded-lg border border-line2 bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-steel focus:ring-2 focus:ring-steel/20';

export default function QuotationPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');

  const [productId, setProductId] = useState<string>(QUOTATION_PRODUCTS[0]?.id ?? '');
  const [customProduct, setCustomProduct] = useState('');
  const [rows, setRows] = useState<Row[]>(() => presetRows(QUOTATION_PRODUCTS[0]?.id ?? ''));

  const [serviceCharge, setServiceCharge] = useState('');
  const [discount, setDiscount] = useState('');
  const [gstPercent, setGstPercent] = useState('18');

  const [customer, setCustomer] = useState('');
  const [contact, setContact] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [receivedOn, setReceivedOn] = useState('');
  const [assessedBy, setAssessedBy] = useState('');

  const [referenceNo, setReferenceNo] = useState('');
  const [date, setDate] = useState('');
  const [validityDays, setValidityDays] = useState('15');
  const [turnaroundDays, setTurnaroundDays] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('3');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const product =
    productId === OTHER_PRODUCT_ID ? customProduct : (findProduct(productId)?.label ?? '');

  const checkSession = useCallback(async () => {
    const res = await fetch('/api/quotation/session');
    const data = await res.json();
    setAuthed(Boolean(data.authed));
  }, []);

  // Two mount effects, both of which the set-state-in-effect rule objects to;
  // the same exemption is taken in the hiring assistant's admin desk.
  //
  // The date/reference seed genuinely does set state synchronously, and has to:
  // deriving them during render would use the *server's* clock on the SSR pass,
  // and Netlify runs UTC while the workshop runs IST — between 05:30 and midnight
  // IST the two disagree about what day it is, so the seeded date would flip on
  // hydration. Seeding after mount makes the client's clock the only one that
  // counts. The session probe only sets state after its `await fetch`, but the
  // rule analyses the call graph rather than the timing.
  /* eslint-disable react-hooks/set-state-in-effect -- see the note above. */
  useEffect(() => {
    const now = new Date();
    setDate(formatLongDate(now));
    setReferenceNo(defaultReference(QUOTATION_PRODUCTS[0]?.label ?? '', now));
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoginErr(data.error || 'Sign-in failed.');
      return;
    }
    setPassword('');
    setAuthed(true);
  }

  /** Switching product reseeds the component rows and the reference number. */
  function pickProduct(id: string) {
    setProductId(id);
    const preset = findProduct(id);
    if (preset) {
      setRows(presetRows(id));
      setReferenceNo(defaultReference(preset.label, new Date()));
    }
  }

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length === 1 ? [blankRow()] : prev.filter((r) => r.id !== id)));
  }

  const input: QuotationInput = useMemo(
    () => ({
      product,
      items: rows
        .filter((r) => r.component.trim())
        .map((r) => ({
          component: r.component.trim(),
          description: r.description.trim() || undefined,
          work: r.work.trim() || undefined,
          amount: toNumber(r.amount),
        })),
      serviceCharge: toNumber(serviceCharge),
      discount: toNumber(discount),
      gstPercent: toNumber(gstPercent),
      referenceNo,
      date,
      validityDays: toNumber(validityDays),
      assessedBy: assessedBy.trim() || undefined,
      customer: customer.trim() || undefined,
      contact: contact.trim() || undefined,
      serialNo: serialNo.trim() || undefined,
      receivedOn: receivedOn.trim() || undefined,
      turnaroundDays: toNumber(turnaroundDays),
      warrantyMonths: toNumber(warrantyMonths),
    }),
    [
      product, rows, serviceCharge, discount, gstPercent, referenceNo, date,
      validityDays, assessedBy, customer, contact, serialNo, receivedOn,
      turnaroundDays, warrantyMonths,
    ],
  );

  const totals = useMemo(() => computeTotals(input), [input]);
  const problems = useMemo(() => validate(input), [input]);

  async function download() {
    setError('');
    if (problems.length) {
      setError(problems.join(' '));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/quotation/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Could not build the PDF (${res.status}).`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ARNOBOT - ${shortProductName(product)} - Repair Quotation.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoked on the next tick so Safari has started the download first.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Network error while building the PDF.');
    } finally {
      setBusy(false);
    }
  }

  if (authed === null) {
    return (
      <main className="min-h-screen grid place-items-center">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen grid place-items-center px-4">
        <form onSubmit={signIn} className="card w-full max-w-sm p-7">
          <ArnobotLogo height={26} />
          <h1 className="mt-5 text-lg font-bold text-ink">Repair Quotation</h1>
          <p className="mt-1 text-sm text-muted">
            Internal tool. Sign in with the ARNOBOT admin password.
          </p>
          <input
            type="password"
            className={`${INPUT} mt-4`}
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {loginErr && <p className="mt-2 text-sm text-bad">{loginErr}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-btn"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <ArnobotLogo height={24} />
            <h1 className="mt-3 text-2xl font-bold text-ink">Repair Quotation</h1>
            <p className="mt-1 text-sm text-muted">
              Build a branded quotation and download it as a PDF. Fields left blank are
              omitted from the document.
            </p>
          </div>
        </header>

        {/* ---- job details ---- */}
        <section className="card mt-6 p-6">
          <h2 className="text-sm font-bold text-ink">Job details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className={productId === OTHER_PRODUCT_ID ? '' : 'sm:col-span-2'}>
              <label className={LABEL} htmlFor="product">Product</label>
              <select
                id="product"
                className={INPUT}
                value={productId}
                onChange={(e) => pickProduct(e.target.value)}
              >
                {QUOTATION_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
                <option value={OTHER_PRODUCT_ID}>Other — type the name</option>
              </select>
            </div>
            {productId === OTHER_PRODUCT_ID && (
              <div>
                <label className={LABEL} htmlFor="customProduct">Product name</label>
                <input
                  id="customProduct"
                  className={INPUT}
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                  placeholder="e.g. Husky A200 — inspection rover"
                />
              </div>
            )}
            <div>
              <label className={LABEL} htmlFor="customer">Customer <span className="font-normal text-muted">(optional)</span></label>
              <input id="customer" className={INPUT} value={customer} onChange={(e) => setCustomer(e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="contact">Contact / phone <span className="font-normal text-muted">(optional)</span></label>
              <input id="contact" className={INPUT} value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="serialNo">Robot serial no. <span className="font-normal text-muted">(optional)</span></label>
              <input id="serialNo" className={INPUT} value={serialNo} onChange={(e) => setSerialNo(e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="receivedOn">Unit received on <span className="font-normal text-muted">(optional)</span></label>
              <input id="receivedOn" className={INPUT} value={receivedOn} onChange={(e) => setReceivedOn(e.target.value)} placeholder="e.g. 8 September 2026" />
            </div>
            <div>
              <label className={LABEL} htmlFor="assessedBy">Assessed by <span className="font-normal text-muted">(optional)</span></label>
              <input id="assessedBy" className={INPUT} value={assessedBy} onChange={(e) => setAssessedBy(e.target.value)} placeholder="e.g. Prijen Balar" />
            </div>
            <div>
              <label className={LABEL} htmlFor="referenceNo">Reference no.</label>
              <input id="referenceNo" className={INPUT} value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="date">Date</label>
              <input id="date" className={INPUT} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <div>
                <label className={LABEL} htmlFor="validityDays">Validity (days)</label>
                <input id="validityDays" type="number" min={0} className={INPUT} value={validityDays} onChange={(e) => setValidityDays(e.target.value)} />
              </div>
              <div>
                <label className={LABEL} htmlFor="turnaroundDays">Turnaround (days)</label>
                <input id="turnaroundDays" type="number" min={0} className={INPUT} value={turnaroundDays} onChange={(e) => setTurnaroundDays(e.target.value)} placeholder="0 = omit" />
              </div>
              <div>
                <label className={LABEL} htmlFor="warrantyMonths">Warranty (months)</label>
                <input id="warrantyMonths" type="number" min={0} className={INPUT} value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* ---- components ---- */}
        <section className="card mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Components to repair / replace</h2>
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, blankRow()])}
              className="rounded-lg border border-line2 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-surfaceAlt"
            >
              + Add component
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-muted">
                  <th className="pb-2 pr-3 w-[22%]">Component</th>
                  <th className="pb-2 pr-3 w-[30%]">Description</th>
                  <th className="pb-2 pr-3 w-[24%]">Work</th>
                  <th className="pb-2 pr-3 w-[16%] text-right">Amount (INR)</th>
                  <th className="pb-2 w-[8%]" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id}>
                    <td className="py-1.5 pr-3">
                      <input
                        aria-label={`Component ${i + 1}`}
                        className={INPUT}
                        value={row.component}
                        onChange={(e) => updateRow(row.id, { component: e.target.value })}
                        placeholder="e.g. Body"
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input
                        aria-label={`Description ${i + 1}`}
                        className={INPUT}
                        value={row.description}
                        onChange={(e) => updateRow(row.id, { description: e.target.value })}
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input
                        aria-label={`Work ${i + 1}`}
                        className={INPUT}
                        value={row.work}
                        onChange={(e) => updateRow(row.id, { work: e.target.value })}
                        placeholder="Repair / replacement"
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input
                        aria-label={`Amount ${i + 1}`}
                        type="number"
                        min={0}
                        className={`${INPUT} text-right`}
                        value={row.amount}
                        onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                      />
                    </td>
                    <td className="py-1.5 text-right">
                      <button
                        type="button"
                        aria-label={`Remove component ${i + 1}`}
                        onClick={() => removeRow(row.id)}
                        className="rounded-lg border border-line2 px-2.5 py-2 text-xs text-bad hover:bg-badbg"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL} htmlFor="serviceCharge">Service charge (INR)</label>
              <input id="serviceCharge" type="number" min={0} className={INPUT} value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} placeholder="0 = omit section" />
            </div>
            <div>
              <label className={LABEL} htmlFor="discount">Discount on service (INR)</label>
              <input id="discount" type="number" min={0} className={INPUT} value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="gstPercent">GST (%)</label>
              <input id="gstPercent" type="number" min={0} max={100} className={INPUT} value={gstPercent} onChange={(e) => setGstPercent(e.target.value)} />
            </div>
          </div>
        </section>

        {/* ---- totals ---- */}
        <section className="card mt-6 p-6">
          <h2 className="text-sm font-bold text-ink">Commercial summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-body">Components — parts and replacement</dt>
              <dd data-testid="parts-total" className="font-semibold text-ink">{inr(totals.partsTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">
                Service charge{toNumber(discount) > 0 ? ` (net of ${inr(toNumber(discount))} discount)` : ''}
              </dt>
              <dd data-testid="net-service" className="font-semibold text-ink">{inr(totals.netService)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <dt className="font-semibold text-ink">Sub-total</dt>
              <dd data-testid="subtotal" className="font-semibold text-ink">{inr(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">GST @ {toNumber(gstPercent)}%</dt>
              <dd data-testid="gst" className="font-semibold text-ink">{inr(totals.gstAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-line2 pt-2 text-base">
              <dt className="font-bold text-navy">Total payable</dt>
              <dd data-testid="total" className="font-bold text-navy">INR {inr(totals.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">
            Rupees {amountInWords(totals.total)} Only.
          </p>

          {(error || problems.length > 0) && (
            <p data-testid="problems" className="mt-4 rounded-lg bg-badbg px-3 py-2 text-sm text-bad">
              {error || problems.join(' ')}
            </p>
          )}

          <button
            type="button"
            onClick={download}
            disabled={busy}
            data-testid="download"
            className="mt-5 w-full rounded-lg brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-btn disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {busy ? 'Building PDF…' : 'Download PDF'}
          </button>
        </section>

        <p className="mt-6 text-center text-xs text-muted">
          Arnobot Private Limited · contact@arnobot.in · +91 99255 12860
        </p>
      </div>
    </main>
  );
}
