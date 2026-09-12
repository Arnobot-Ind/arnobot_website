/**
 * Renders a repair quotation as a branded PDF.
 *
 * A direct port of the vault generator
 * `ArnobotDoc/02-Products/Nexus/Repair/gen_nexus_repair_quotation.py`: same A4
 * geometry, same navy (#1F3864) house style, same section order. Layout is
 * hand-placed rather than flowed, so keep the two in step if either changes.
 *
 * The rupee sign is deliberately absent. Standard-14 Helvetica is WinAnsi-encoded
 * and has no U+20B9 glyph; the Python generator borrows one from Georgia, which
 * would mean shipping and embedding a TTF here for two occurrences. Amounts read
 * "INR 25,960" instead, and every money column is headed "Amount (INR)".
 */
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
  type RGB,
} from 'pdf-lib';
import { amountInWords, computeTotals, inr, shortProductName } from './calc';
import type { QuotationInput } from './types';
import { WORDMARK_ASPECT, WORDMARK_WHITE_PNG_BASE64 } from './wordmark';

const MM = 2.834645669;
const PAGE_W = 595.276;
const PAGE_H = 841.89;

const MARGIN = 16 * MM;
const CONTENT_TOP = PAGE_H - 28 * MM;
const AVAIL = PAGE_W - 2 * MARGIN;

const NAVY = rgb(0x1f / 255, 0x38 / 255, 0x64 / 255);
const DARK = rgb(0x22 / 255, 0x22 / 255, 0x22 / 255);
const GREY = rgb(0x59 / 255, 0x59 / 255, 0x59 / 255);
const ALT_FILL = rgb(0xea / 255, 0xef / 255, 0xf7 / 255);
const LIGHT = rgb(0xf2 / 255, 0xf5 / 255, 0xfa / 255);
const GRID = rgb(0xc9 / 255, 0xd3 / 255, 0xe6 / 255);
const WHITE = rgb(1, 1, 1);

const FOOTER_TEXT =
  'Arnobot Private Limited  |  www.arnobot.in  |  contact@arnobot.in  |  +91 99255 12860';

/** A styled span. Runs are wrapped as one stream so bold leads flow into body text. */
interface Run {
  readonly text: string;
  readonly bold?: boolean;
  readonly color?: RGB;
}

interface Fonts {
  readonly regular: PDFFont;
  readonly bold: PDFFont;
}

type Align = 'left' | 'right' | 'center';

interface Column {
  readonly width: number;
  readonly align: Align;
}

/** A table cell: plain text plus the styling that applies to the whole cell. */
interface Cell {
  readonly text: string;
  readonly bold?: boolean;
  readonly color?: RGB;
}

function pick(fonts: Fonts, bold?: boolean): PDFFont {
  return bold ? fonts.bold : fonts.regular;
}

/**
 * Greedy word wrap across a run stream.
 *
 * Whitespace is carried, never synthesized: the text is split with the
 * separators kept, and a run of spaces is held back until the next word decides
 * whether it lands on this line or the next. Re-inserting a space between every
 * token instead — the obvious shortcut — puts one in front of any run that opens
 * with punctuation, which is how "the body , the receiver" and "Taxes— GST"
 * both got into a customer-facing document.
 *
 * A single word wider than `maxWidth` is left to overflow rather than
 * hyphenated; component names are short, and breaking one mid-word would read
 * as a typo.
 */
function wrapRuns(runs: readonly Run[], fonts: Fonts, size: number, maxWidth: number): Run[][] {
  const lines: Run[][] = [];
  let line: Run[] = [];
  let width = 0;
  let pendingSpace: Run | null = null;

  for (const run of runs) {
    for (const token of run.text.split(/(\s+)/)) {
      if (token === '') continue;
      const font = pick(fonts, run.bold);
      if (/^\s+$/.test(token)) {
        // Hold the gap: it only gets drawn if a word follows it on this line.
        if (line.length > 0) pendingSpace = { text: token, bold: run.bold, color: run.color };
        continue;
      }
      const gapWidth = pendingSpace
        ? pick(fonts, pendingSpace.bold).widthOfTextAtSize(pendingSpace.text, size)
        : 0;
      const wordWidth = font.widthOfTextAtSize(token, size);
      if (line.length > 0 && width + gapWidth + wordWidth > maxWidth) {
        lines.push(line);
        line = [{ text: token, bold: run.bold, color: run.color }];
        width = wordWidth;
      } else {
        if (pendingSpace) {
          line.push(pendingSpace);
          width += gapWidth;
        }
        line.push({ text: token, bold: run.bold, color: run.color });
        width += wordWidth;
      }
      pendingSpace = null;
    }
  }
  if (line.length) lines.push(line);
  return lines.length ? lines : [[]];
}

function lineWidth(line: readonly Run[], fonts: Fonts, size: number): number {
  return line.reduce((sum, r) => sum + pick(fonts, r.bold).widthOfTextAtSize(r.text, size), 0);
}

/** Draws one wrapped line, returning nothing; `baseline` is the text baseline. */
function drawLine(
  page: PDFPage,
  line: readonly Run[],
  fonts: Fonts,
  size: number,
  x: number,
  baseline: number,
  defaultColor: RGB,
) {
  let cursor = x;
  for (const run of line) {
    const font = pick(fonts, run.bold);
    page.drawText(run.text, {
      x: cursor,
      y: baseline,
      size,
      font,
      color: run.color ?? defaultColor,
    });
    cursor += font.widthOfTextAtSize(run.text, size);
  }
}

/** Baseline sits this far below the top of its line box. */
function ascent(size: number): number {
  return size * 0.78;
}

/** Layout cursor over a single page. */
class Layout {
  y = CONTENT_TOP;

  constructor(
    readonly page: PDFPage,
    readonly fonts: Fonts,
  ) {}

  /** Vertical gap. */
  gap(points: number) {
    this.y -= points;
  }

  /** A wrapped paragraph. Returns the height consumed. */
  paragraph(
    runs: readonly Run[],
    opts: { size?: number; leading?: number; color?: RGB; spaceAfter?: number; x?: number; width?: number } = {},
  ) {
    const size = opts.size ?? 9;
    const leading = opts.leading ?? 12.1;
    const x = opts.x ?? MARGIN;
    const width = opts.width ?? AVAIL;
    const lines = wrapRuns(runs, this.fonts, size, width);
    for (const line of lines) {
      drawLine(this.page, line, this.fonts, size, x, this.y - ascent(size), opts.color ?? DARK);
      this.y -= leading;
    }
    this.y -= opts.spaceAfter ?? 2;
  }

  /** Navy section heading, e.g. "2. Components to Repair / Replace". */
  section(text: string) {
    this.y -= 6;
    drawLine(this.page, [{ text, bold: true }], this.fonts, 10.5, MARGIN, this.y - ascent(10.5), NAVY);
    this.y -= 13 + 2.5;
  }

  /** Horizontal rule in navy. */
  rule(thickness = 1.1, spaceBefore = 3, spaceAfter = 5) {
    this.y -= spaceBefore;
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - thickness,
      width: AVAIL,
      height: thickness,
      color: NAVY,
    });
    this.y -= thickness + spaceAfter;
  }

  /**
   * A grid table.
   *
   * `headerRow` renders navy-on-white; body rows zebra-stripe in ALT_FILL and any
   * row listed in `totalRows` gets the LIGHT fill plus a heavy navy rule above.
   */
  table(opts: {
    columns: readonly Column[];
    header?: readonly Cell[];
    rows: readonly (readonly Cell[])[];
    totalRows?: readonly number[];
    labelColumnShaded?: boolean;
  }) {
    const { columns, header, rows } = opts;
    const totals = new Set(opts.totalRows ?? []);
    const size = 8.5;
    const leading = 11;
    const padX = 5;
    const padY = 2.8;

    const fallback: Column = { width: 0, align: 'left' };

    const drawRow = (cells: readonly Cell[], isHeader: boolean, rowIndex: number) => {
      const cellSize = isHeader ? 8.6 : size;
      // Pair each cell with its column once, so nothing downstream indexes a
      // possibly-ragged array.
      const entries = cells.map((cell, i) => {
        const col = columns[i] ?? fallback;
        return {
          cell,
          col,
          lines: wrapRuns(
            [{ text: cell.text, bold: cell.bold }],
            this.fonts,
            cellSize,
            col.width - 2 * padX,
          ),
        };
      });
      const maxLines = Math.max(1, ...entries.map((e) => e.lines.length));
      const height = maxLines * leading + 2 * padY;
      const top = this.y;
      const bottom = top - height;

      // Fills first, so the grid and text sit on top of them.
      let fill: RGB | undefined;
      if (isHeader) fill = NAVY;
      else if (totals.has(rowIndex)) fill = LIGHT;
      else if (rowIndex % 2 === 0) fill = ALT_FILL;
      if (fill) {
        this.page.drawRectangle({ x: MARGIN, y: bottom, width: AVAIL, height, color: fill });
      }
      if (opts.labelColumnShaded && !isHeader) {
        this.page.drawRectangle({
          x: MARGIN,
          y: bottom,
          width: (columns[0] ?? fallback).width,
          height,
          color: ALT_FILL,
        });
      }
      if (totals.has(rowIndex)) {
        this.page.drawRectangle({ x: MARGIN, y: top - 0.8, width: AVAIL, height: 0.8, color: NAVY });
      }

      // Cell text.
      let x = MARGIN;
      for (const { cell, col, lines } of entries) {
        const color = cell.color ?? (isHeader ? WHITE : DARK);
        lines.forEach((line, li) => {
          const w = lineWidth(line, this.fonts, cellSize);
          let lx = x + padX;
          if (col.align === 'right') lx = x + col.width - padX - w;
          else if (col.align === 'center') lx = x + (col.width - w) / 2;
          drawLine(this.page, line, this.fonts, cellSize, lx, top - padY - li * leading - ascent(cellSize), color);
        });
        x += col.width;
      }

      // Grid: outer box plus interior verticals.
      this.page.drawRectangle({
        x: MARGIN,
        y: bottom,
        width: AVAIL,
        height,
        borderColor: GRID,
        borderWidth: 0.4,
      });
      let vx = MARGIN;
      for (let i = 0; i < columns.length - 1; i += 1) {
        vx += (columns[i] ?? fallback).width;
        this.page.drawLine({
          start: { x: vx, y: bottom },
          end: { x: vx, y: top },
          thickness: 0.4,
          color: GRID,
        });
      }
      this.y = bottom;
    };

    if (header) drawRow(header, true, -1);
    rows.forEach((row, i) => drawRow(row, false, i));
  }
}

function drawChrome(page: PDFPage, fonts: Fonts, logo: { width: number; height: number } | null, logoImage: unknown) {
  // Header band.
  page.drawRectangle({ x: 0, y: PAGE_H - 24 * MM, width: PAGE_W, height: 24 * MM, color: NAVY });
  if (logoImage && logo) {
    page.drawImage(logoImage as Parameters<PDFPage['drawImage']>[0], {
      x: MARGIN,
      y: PAGE_H - 12 * MM - logo.height / 2,
      width: logo.width,
      height: logo.height,
    });
  }
  const title = 'Repair Quotation';
  page.drawText(title, {
    x: PAGE_W - MARGIN - fonts.bold.widthOfTextAtSize(title, 11),
    y: PAGE_H - 10.5 * MM - ascent(11) + 11 * 0.78,
    size: 11,
    font: fonts.bold,
    color: WHITE,
  });

  // Footer band.
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 12 * MM, color: NAVY });
  if (logoImage && logo) {
    const fw = 22 * MM;
    const fh = fw * WORDMARK_ASPECT;
    page.drawImage(logoImage as Parameters<PDFPage['drawImage']>[0], {
      x: MARGIN,
      y: 6 * MM - fh / 2,
      width: fw,
      height: fh,
    });
  }
  page.drawText(FOOTER_TEXT, {
    x: (PAGE_W - fonts.regular.widthOfTextAtSize(FOOTER_TEXT, 7.3)) / 2,
    y: 5.2 * MM,
    size: 7.3,
    font: fonts.regular,
    color: WHITE,
  });
}

/** Terms, assembled from whatever the input actually specifies. */
function buildTerms(input: QuotationInput): Run[][] {
  const terms: Run[][] = [];
  const bullet = (lead: string, rest: string): Run[] => [
    { text: '•  ' },
    { text: lead, bold: true },
    { text: rest },
  ];

  if (input.validityDays > 0) {
    terms.push(
      bullet(
        'Validity',
        ` — this quotation is valid for ${input.validityDays} days from the date of this quotation. Prices may be revised thereafter.`,
      ),
    );
  }
  if (input.gstPercent > 0) {
    terms.push(
      bullet(
        'Taxes',
        ` — GST at ${input.gstPercent}% is shown separately above and is included in the payable amount.`,
      ),
    );
  }
  terms.push(
    bullet(
      'Payment',
      ' — 50% advance on approval of this quotation, balance on handover of the repaired unit.',
    ),
  );
  if (input.turnaroundDays && input.turnaroundDays > 0) {
    terms.push(
      bullet(
        'Turnaround',
        ` — the unit will be returned within ${input.turnaroundDays} working days from receipt of advance and confirmed approval.`,
      ),
    );
  }
  const count = input.items.length;
  const counted = count <= 10 ? amountInWords(count).toLowerCase() : String(count);
  terms.push(
    bullet(
      'Scope',
      ` — the amounts above cover only the ${counted} ${count === 1 ? 'assembly' : 'assemblies'} listed. Any further fault found during teardown will be quoted separately and taken up only after written approval.`,
    ),
  );
  terms.push(
    bullet(
      'Replaced parts',
      ' — parts removed and replaced during this repair remain with Arnobot unless the customer asks for them in writing at the time of approval.',
    ),
  );
  if (input.warrantyMonths && input.warrantyMonths > 0) {
    terms.push(
      bullet(
        'Warranty',
        ` — replaced components carry a ${input.warrantyMonths}-month warranty against manufacturing defect from the date of handover. It does not cover physical damage, water ingress, unauthorised opening or modification, or use outside the stated operating conditions.`,
      ),
    );
  }
  terms.push(
    bullet(
      'Transport',
      " — to-and-fro transport of the unit is to the customer's account unless agreed otherwise in writing.",
    ),
  );
  return terms;
}

/** Build the quotation PDF. Returns the raw bytes. */
export async function renderQuotationPdf(input: QuotationInput): Promise<Uint8Array> {
  const items = input.items.filter((i) => i.component.trim());
  const totals = computeTotals({ ...input, items });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`ARNOBOT - ${input.product} - Repair Quotation`);
  pdf.setAuthor('Arnobot Private Limited');
  pdf.setSubject('Repair Quotation');
  pdf.setProducer('arnobot.in/quotation');

  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };

  let logoImage: Awaited<ReturnType<PDFDocument['embedPng']>> | null = null;
  try {
    logoImage = await pdf.embedPng(Buffer.from(WORDMARK_WHITE_PNG_BASE64, 'base64'));
  } catch {
    // A malformed logo must not cost the customer their quotation.
    logoImage = null;
  }
  const logoW = 46 * MM;
  const logoDims = logoImage ? { width: logoW, height: logoW * WORDMARK_ASPECT } : null;

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  drawChrome(page, fonts, logoDims, logoImage);
  const L = new Layout(page, fonts);

  // ---- title block ----
  drawLine(page, [{ text: `Repair Quotation — ${shortProductName(input.product)}`, bold: true }], fonts, 15.5, MARGIN, L.y - ascent(15.5), NAVY);
  L.y -= 19 + 2;
  L.paragraph(
    [{ text: 'Assessment of components to repair / replace, with charges | Arnobot Private Limited' }],
    { size: 8.5, leading: 11, color: GREY, spaceAfter: 0 },
  );
  L.rule();

  // ---- cover block: only rows that have a value ----
  const cover: [string, string][] = [['Product', input.product]];
  if (input.customer?.trim()) cover.push(['Customer', input.customer.trim()]);
  if (input.contact?.trim()) cover.push(['Contact / Phone', input.contact.trim()]);
  if (input.serialNo?.trim()) cover.push(['Robot Serial No.', input.serialNo.trim()]);
  if (input.receivedOn?.trim()) cover.push(['Unit received on', input.receivedOn.trim()]);
  if (input.assessedBy?.trim()) {
    cover.push(['Assessed by', `${input.assessedBy.trim()}, Arnobot Private Limited`]);
  }
  cover.push(['Reference No.', input.referenceNo]);
  cover.push(['Date', input.date]);
  if (input.validityDays > 0) {
    cover.push(['Validity', `${input.validityDays} days from the date of this quotation`]);
  }
  L.table({
    columns: [
      { width: 38 * MM, align: 'left' },
      { width: AVAIL - 38 * MM, align: 'left' },
    ],
    rows: cover.map(([k, v]) => [
      { text: k, bold: true, color: NAVY },
      { text: v },
    ]),
    labelColumnShaded: true,
  });

  // ---- 1. scope ----
  L.section('1. Scope of Repair');
  const names = items.map((i) => i.component.trim());
  const nameRuns: Run[] = [];
  names.forEach((n, i) => {
    if (i > 0) nameRuns.push({ text: i === names.length - 1 ? ' and the ' : ', the ' });
    nameRuns.push({ text: n.toLowerCase(), bold: true });
  });
  L.paragraph([
    { text: `The ${shortProductName(input.product)} unit has been inspected and ` },
    // Small counts read better spelled out, matching the vault's wording.
    {
      text: `${names.length <= 10 ? amountInWords(names.length).toLowerCase() : names.length} ${names.length === 1 ? 'assembly' : 'assemblies'}`,
      bold: true,
    },
    { text: ` ${names.length === 1 ? 'requires' : 'require'} repair or replacement to restore it to working condition — the ` },
    ...nameRuns,
    { text: '. The charges below cover parts, workshop labour, reassembly and functional testing before handover.' },
  ]);

  // ---- 2. components ----
  L.section('2. Components to Repair / Replace');
  const itemColumns: Column[] = [
    { width: AVAIL * 0.06, align: 'center' },
    { width: AVAIL * 0.22, align: 'left' },
    { width: AVAIL * 0.3, align: 'left' },
    { width: AVAIL * 0.24, align: 'left' },
    { width: AVAIL * 0.18, align: 'right' },
  ];
  L.table({
    columns: itemColumns,
    header: [
      { text: '#' },
      { text: 'Component' },
      { text: 'Description' },
      { text: 'Work' },
      { text: 'Amount (INR)' },
    ],
    rows: [
      ...items.map((item, i) => [
        { text: String(i + 1) },
        { text: item.component.trim(), bold: true, color: NAVY },
        { text: item.description?.trim() || '' },
        { text: item.work?.trim() || 'Repair / replacement' },
        { text: inr(item.amount) },
      ]),
      [
        { text: '' },
        { text: 'Total — parts', bold: true, color: NAVY },
        { text: '' },
        { text: '' },
        { text: inr(totals.partsTotal), bold: true, color: NAVY },
      ],
    ],
    totalRows: [items.length],
  });

  // ---- 3. service charge (omitted entirely when there is no labour) ----
  const moneyColumns: Column[] = [
    { width: AVAIL * 0.82, align: 'left' },
    { width: AVAIL * 0.18, align: 'right' },
  ];
  if (input.serviceCharge > 0) {
    L.section('3. Service Charge');
    const serviceRows: Cell[][] = [
      [
        { text: 'Workshop service charge — teardown, repair, reassembly and functional testing' },
        { text: inr(input.serviceCharge) },
      ],
    ];
    if (input.discount > 0) {
      serviceRows.push([{ text: 'Less: discount' }, { text: `(${inr(input.discount)})` }]);
    }
    serviceRows.push([
      { text: 'Net service charge', bold: true, color: NAVY },
      { text: inr(totals.netService), bold: true, color: NAVY },
    ]);
    L.table({
      columns: moneyColumns,
      header: [{ text: 'Description' }, { text: 'Amount (INR)' }],
      rows: serviceRows,
      totalRows: [serviceRows.length - 1],
    });
  }

  // ---- 4. commercial summary ----
  const summaryNo = input.serviceCharge > 0 ? '4' : '3';
  L.section(`${summaryNo}. Commercial Summary`);
  const summaryRows: Cell[][] = [
    [
      { text: `Components — parts and replacement (${items.length} ${items.length === 1 ? 'item' : 'items'})` },
      { text: inr(totals.partsTotal) },
    ],
  ];
  if (input.serviceCharge > 0) {
    summaryRows.push([
      {
        text:
          input.discount > 0
            ? `Service charge (net of INR ${inr(input.discount)} discount)`
            : 'Service charge',
      },
      { text: inr(totals.netService) },
    ]);
  }
  summaryRows.push([
    { text: 'Sub-total', bold: true, color: NAVY },
    { text: inr(totals.subtotal), bold: true, color: NAVY },
  ]);
  const subtotalRowIndex = summaryRows.length - 1;
  if (input.gstPercent > 0) {
    summaryRows.push([{ text: `GST @ ${input.gstPercent}%` }, { text: inr(totals.gstAmount) }]);
  }
  summaryRows.push([
    { text: 'Total payable', bold: true, color: NAVY },
    { text: `INR ${inr(totals.total)}`, bold: true, color: NAVY },
  ]);
  L.table({
    columns: moneyColumns,
    header: [{ text: 'Particulars' }, { text: 'Amount (INR)' }],
    rows: summaryRows,
    totalRows: [subtotalRowIndex, summaryRows.length - 1],
  });
  L.paragraph([
    { text: 'Amount in words: ', bold: true },
    { text: `Rupees ${amountInWords(totals.total)} Only.` },
  ]);

  // ---- 5. terms ----
  L.section(`${input.serviceCharge > 0 ? '5' : '4'}. Terms & Conditions`);
  for (const term of buildTerms(input)) {
    L.paragraph(term);
  }

  // ---- sign-off ----
  if (input.assessedBy?.trim()) {
    L.rule(0.8, 3, 2);
    L.paragraph(
      [
        { text: 'Prepared by: ' },
        { text: input.assessedBy.trim(), bold: true },
        { text: ', Arnobot Private Limited — contact@arnobot.in | +91 99255 12860' },
      ],
      { size: 7.3, leading: 9.6, color: GREY },
    );
  }

  return pdf.save();
}

/** `ARNOBOT - Nexus Robot - Repair Quotation.pdf`, safe for a filename. */
export function quotationFilename(product: string): string {
  const name = shortProductName(product).replace(/[^A-Za-z0-9 _-]/g, '');
  return `ARNOBOT - ${name} - Repair Quotation.pdf`;
}
