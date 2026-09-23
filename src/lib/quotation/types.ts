/**
 * Repair-quotation domain types.
 *
 * Mirrors the branded PDF produced by the vault generator at
 * `02-Products/Nexus/Repair/gen_nexus_repair_quotation.py`, generalised so any
 * product and any component list can be quoted.
 */

/** One component being repaired or replaced. */
export interface QuotationItem {
  /** Assembly name, e.g. "Body", "Receiver". Required. */
  readonly component: string;
  /** Optional gloss, e.g. "Nexus body / chassis shell". */
  readonly description?: string;
  /** Optional action, e.g. "Repair / replacement". */
  readonly work?: string;
  /** Charge in whole rupees. */
  readonly amount: number;
}

/** Everything the form collects. Blank optional fields are omitted from the PDF. */
export interface QuotationInput {
  /** Product being serviced, e.g. "Nexus — tracked inspection robot". */
  readonly product: string;
  readonly items: readonly QuotationItem[];
  /** Gross workshop labour charge, before discount. */
  readonly serviceCharge: number;
  /** Discount applied to the service charge. */
  readonly discount: number;
  /** GST percentage, normally 18. */
  readonly gstPercent: number;
  readonly referenceNo: string;
  /** Display date, e.g. "10 September 2026". */
  readonly date: string;
  /** Validity in days; 0 omits the row and the Validity term. */
  readonly validityDays: number;
  readonly assessedBy?: string;
  readonly customer?: string;
  readonly contact?: string;
  readonly serialNo?: string;
  readonly receivedOn?: string;
  /** Turnaround in working days; 0 omits the term. */
  readonly turnaroundDays?: number;
  /** Warranty on replaced parts, in months; 0 omits the term. */
  readonly warrantyMonths?: number;
  /** Free-text note; each non-blank line is added to Terms & Conditions as a red "Note: (…)" bullet. */
  readonly note?: string;
}

/** Derived money figures. Every field is whole rupees. */
export interface QuotationTotals {
  readonly partsTotal: number;
  readonly netService: number;
  readonly subtotal: number;
  readonly gstAmount: number;
  readonly total: number;
}
