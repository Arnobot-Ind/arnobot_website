/**
 * Renders the careers poster (/career/poster.pdf) as a single-page A4 PDF.
 *
 * Every role, discipline, tag, skill and hiring step is read from
 * `src/data/careers.ts` — the same list the careers page and the exam's roles
 * table use — so editing a role or a title there re-lays-out the poster on the
 * next build. Only the headline and the photo are fixed.
 *
 * The photo is a real robot field photograph with nobody in it (see
 * `assets.ts`). Fonts are the standard-14 Helvetica pair, which only encodes
 * WinAnsi, so `clean()` swaps any other glyph a future title or body might
 * contain rather than letting the PDF build throw.
 */
import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, clip, endPath, popGraphicsState, pushGraphicsState, rectangle, rgb, type RGB } from 'pdf-lib';
import { HIRING_PROCESS, OPEN_ROLES, ROLE_GROUPS, type OpenRole } from '@/data/careers';
import { WORDMARK_ASPECT, WORDMARK_WHITE_PNG_BASE64 } from '@/lib/quotation/wordmark';
import { HERO_JPG_BASE64, HERO_OVERLAY_PNG_BASE64, QR_PNG_BASE64 } from './assets';

const MM = 2.834645669;
const W = 595.276;
const H = 841.89;
const M = 14 * MM;

const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const NAVY = hex('#1F3864');
const DEEP = hex('#0D1726');
const ACCENT = hex('#375E9D');
const SKY = hex('#00A3FF');
const LIGHT_BLUE = hex('#8AB0E8');
const PALE = hex('#DCE5F5');
const TINT = hex('#EEF2FA');
const GRID = hex('#C9D3E6');
const INK = hex('#1A1F2B');
const BODY = hex('#45505F');
const WHITE = rgb(1, 1, 1);

const SKILL_SHORT: Record<string, string> = {
  'Mechanical Design': 'Mechanical',
  'Sensor Integration': 'Sensors',
  'Control Theory': 'Control',
  'Aptitude & General': '',
};

interface Ctx {
  doc: PDFDocument;
  reg: PDFFont;
  bold: PDFFont;
  wordmark: PDFImage;
  hero: PDFImage;
  overlay: PDFImage;
  qr: PDFImage;
}

/** Make `text` encodable in WinAnsi Helvetica. */
function clean(font: PDFFont, text: string): string {
  const ok = new Set(font.getCharacterSet());
  return Array.from(
    text
      .replace(/→/g, ' to ')
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/ +/g, ' '),
  )
    .map((ch) => (ok.has(ch.codePointAt(0)!) ? ch : '?'))
    .join('');
}

function wrapLines(font: PDFFont, text: string, size: number, width: number): string[] {
  const words = clean(font, text).split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= width || !line) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draw wrapped text with its first baseline at `y`; returns the next baseline. */
function para(page: PDFPage, font: PDFFont, text: string, o: { x: number; y: number; size: number; lead: number; width: number; color: RGB; maxLines?: number }): number {
  let lines = wrapLines(font, text, o.size, o.width);
  if (o.maxLines && lines.length > o.maxLines) {
    lines = lines.slice(0, o.maxLines);
    let last = lines[o.maxLines - 1]!;
    while (last.length > 1 && font.widthOfTextAtSize(`${last}...`, o.size) > o.width) last = last.slice(0, -1);
    lines[o.maxLines - 1] = `${last.trimEnd()}...`;
  }
  let y = o.y;
  for (const l of lines) {
    page.drawText(l, { x: o.x, y, size: o.size, font, color: o.color });
    y -= o.lead;
  }
  return y;
}

function roundRect(page: PDFPage, x: number, y: number, w: number, h: number, r: number, o: { fill?: RGB; stroke?: RGB; opacity?: number }) {
  const path = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  page.drawSvgPath(path, {
    x,
    y: y + h, // drawSvgPath's origin is the shape's top-left, y pointing down
    color: o.fill,
    borderColor: o.stroke,
    borderWidth: o.stroke ? 0.7 : 0,
    opacity: o.opacity,
  });
}

/**
 * Draw `img` filling the box and clipped to it. `zoom` enlarges the fit; `fx`/`fy`
 * (0..1) pick which part of the overflow is shown — 0 = left/top, 1 = right/bottom.
 */
function cover(page: PDFPage, img: PDFImage, x: number, y: number, w: number, h: number, o: { zoom?: number; fx?: number; fy?: number } = {}) {
  const s = Math.max(w / img.width, h / img.height) * (o.zoom ?? 1);
  const dw = img.width * s;
  const dh = img.height * s;
  const ix = x - (dw - w) * (o.fx ?? 0.5);
  const iy = y + h + (dh - h) * (o.fy ?? 0.5) - dh;
  page.pushOperators(pushGraphicsState(), rectangle(x, y, w, h), clip(), endPath());
  page.drawImage(img, { x: ix, y: iy, width: dw, height: dh });
  page.pushOperators(popGraphicsState());
}

function logo(c: Ctx, page: PDFPage, x: number, yTop: number, w: number) {
  const h = w * WORDMARK_ASPECT;
  page.drawImage(c.wordmark, { x, y: yTop - h, width: w, height: h });
}

function pill(c: Ctx, page: PDFPage, x: number, y: number, text: string, o: { fill: RGB; fg: RGB; size?: number; h?: number; padx?: number; stroke?: RGB }): number {
  const size = o.size ?? 7.2;
  const h = o.h ?? 5.2 * MM;
  const padx = o.padx ?? 2.6 * MM;
  const t = clean(c.bold, text);
  const tw = c.bold.widthOfTextAtSize(t, size);
  roundRect(page, x, y, tw + 2 * padx, h, h / 2, { fill: o.fill, stroke: o.stroke });
  page.drawText(t, { x: x + padx, y: y + h / 2 - size * 0.35, size, font: c.bold, color: o.fg });
  return tw + 2 * padx;
}

function footer(c: Ctx, page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: 17 * MM, color: DEEP });
  page.drawRectangle({ x: 0, y: 17 * MM, width: W, height: 0.7 * MM, color: SKY });
  page.drawText('careers@arnobot.in', { x: M, y: 9.2 * MM, size: 11, font: c.bold, color: WHITE });
  page.drawText('ARNOBOT Private Limited - Ahmedabad, Gujarat - Robotics for the real world', { x: M, y: 4.6 * MM, size: 8.2, font: c.reg, color: LIGHT_BLUE });
  const url = 'www.arnobot.in/career';
  page.drawText(url, { x: W - M - c.bold.widthOfTextAtSize(url, 11), y: 9.2 * MM, size: 11, font: c.bold, color: WHITE });
}

function skillLine(role: OpenRole): string {
  return role.skills
    .map((s) => (s in SKILL_SHORT ? SKILL_SHORT[s]! : s))
    .filter(Boolean)
    .slice(0, 4)
    .join(' · ');
}

// ------------------------------------------------------------------ the page
function poster(c: Ctx) {
  const page = c.doc.addPage([W, H]);

  // hero — one photo, navy fade on the text side
  const heroH = 82 * MM;
  const hy = H - heroH;
  // zoomed and shifted so the robot sits right of the headline
  cover(page, c.hero, 0, hy, W, heroH, { zoom: 1.2, fx: 0, fy: 0.55 });
  page.drawImage(c.overlay, { x: 0, y: hy, width: W, height: heroH });
  page.drawRectangle({ x: 0, y: hy - 0.7 * MM, width: W, height: 0.7 * MM, color: SKY });

  logo(c, page, M, H - 11 * MM, 40 * MM);
  pill(c, page, W - M - 33 * MM, H - 16 * MM, "WE'RE HIRING", { fill: SKY, fg: DEEP, size: 8.5, h: 6.6 * MM, padx: 4 * MM });

  page.drawText('CAREERS AT ARNOBOT', { x: M, y: H - 29 * MM, size: 8.5, font: c.bold, color: LIGHT_BLUE });
  page.drawText('Build robots', { x: M, y: H - 42 * MM, size: 34, font: c.bold, color: WHITE });
  page.drawText('that work in the', { x: M, y: H - 52.5 * MM, size: 34, font: c.bold, color: WHITE });
  page.drawText('real world.', { x: M, y: H - 63 * MM, size: 34, font: c.bold, color: SKY });

  const kinds = [...new Set(OPEN_ROLES.map((r) => r.tags[1]).filter(Boolean))];
  const disciplines = ROLE_GROUPS.map((g) => g.discipline);
  const list = disciplines.length > 1 ? `${disciplines.slice(0, -1).join(', ')} and ${disciplines.at(-1)}` : (disciplines[0] ?? '');
  const sub = `${OPEN_ROLES.length} roles across ${list}${kinds.length === 1 ? ` \u2014 each open as ${kinds[0]}` : ''}.`;
  para(page, c.reg, sub, { x: M, y: H - 70 * MM, size: 10.5, lead: 12.5, width: 100 * MM, color: PALE });

  // stat strip over the hero's bottom edge
  const sh = 12 * MM;
  const sy = hy - 6 * MM;
  roundRect(page, M, sy, W - 2 * M, sh, 2 * MM, { fill: WHITE, stroke: GRID });
  const place = (OPEN_ROLES[0]?.tags[0] ?? 'Ahmedabad').split(' · ');
  const stats: [string, string][] = [
    [String(OPEN_ROLES.length), OPEN_ROLES.length === 1 ? 'role' : 'roles'],
    [kinds.length === 1 ? kinds[0]! : 'Intern / Full-time', 'every role'],
    place.length > 1 ? [place[0]!, place.slice(1).join(' ')] : [place[0]!, 'location'],
    ['Paid', 'based on skill'],
  ];
  const sw = (W - 2 * M) / 4;
  stats.forEach(([big, small], i) => {
    const bt = clean(c.bold, big);
    const size = c.bold.widthOfTextAtSize(bt, 14) < sw - 8 ? 14 : 11.5;
    const cx = M + sw * i + sw / 2;
    page.drawText(bt, { x: cx - c.bold.widthOfTextAtSize(bt, size) / 2, y: sy + 6.2 * MM, size, font: c.bold, color: NAVY });
    const st = clean(c.reg, small);
    page.drawText(st, { x: cx - c.reg.widthOfTextAtSize(st, 7.5) / 2, y: sy + 2.4 * MM, size: 7.5, font: c.reg, color: BODY });
    if (i) page.drawLine({ start: { x: M + sw * i, y: sy + 2 * MM }, end: { x: M + sw * i, y: sy + sh - 2 * MM }, thickness: 0.6, color: GRID });
  });

  // bottom stack, laid out upward from the footer: apply bar, then hiring steps
  const footTop = 17 * MM;
  const applyH = 24 * MM;
  const applyY = footTop + 5 * MM;
  const stepsH = 29 * MM;
  const stepsY = applyY + applyH + 4 * MM;
  const cardsBottom = stepsY + stepsH + 13 * MM; // leaves room for the "How we hire" title

  // role cards, two columns, as many rows as the list needs
  const top = sy - 5 * MM;
  const gap = 3.5 * MM;
  const rows = Math.max(1, Math.ceil(OPEN_ROLES.length / 2));
  const ch = Math.min(42 * MM, (top - cardsBottom - gap * (rows - 1)) / rows);
  const cardW = (W - 2 * M - gap) / 2;
  OPEN_ROLES.forEach((role, i) => {
    const r = Math.floor(i / 2);
    const x = M + (i % 2) * (cardW + gap);
    const y = top - ch - r * (ch + gap);
    roundRect(page, x, y, cardW, ch, 2.2 * MM, { fill: TINT, stroke: GRID });
    roundRect(page, x, y, 10 * MM, ch, 2.2 * MM, { fill: NAVY });
    page.drawRectangle({ x: x + 7 * MM, y, width: 3.2 * MM, height: ch, color: NAVY });
    const num = String(i + 1).padStart(2, '0');
    page.drawText(num, { x: x + 5 * MM - c.bold.widthOfTextAtSize(num, 15) / 2, y: y + ch - 9 * MM, size: 15, font: c.bold, color: WHITE });

    const tx = x + 12.5 * MM;
    const tw = cardW - 12.5 * MM - 2.5 * MM;
    let ty = y + ch - 5.8 * MM;
    ty = para(page, c.bold, role.title, { x: tx, y: ty, size: 11, lead: 12.2, width: tw, color: INK, maxLines: 2 });
    const bodyRoom = ty - 1 - (y + 11.4 * MM);
    para(page, c.reg, role.body, { x: tx, y: ty - 1, size: 8.1, lead: 9.6, width: tw, color: BODY, maxLines: Math.max(1, Math.floor(bodyRoom / 9.6) + 1) });
    page.drawText(clean(c.bold, skillLine(role)), { x: tx, y: y + 9.2 * MM, size: 6.8, font: c.bold, color: ACCENT });
    pill(c, page, tx, y + 2.2 * MM, (role.tags[1] ?? 'Open').toUpperCase(), { fill: NAVY, fg: WHITE, size: 6.8, h: 4.8 * MM });
  });

  // hiring steps — straight from HIRING_PROCESS
  page.drawText('How we hire', { x: M, y: stepsY + stepsH + 3.2 * MM, size: 12, font: c.bold, color: NAVY });
  page.drawRectangle({ x: M, y: stepsY + stepsH + 0.6 * MM, width: 9 * MM, height: 0.8 * MM, color: SKY });
  const n = HIRING_PROCESS.length;
  const gapS = 3.5 * MM;
  const stw = (W - 2 * M - (n - 1) * gapS) / n;
  HIRING_PROCESS.forEach((step, i) => {
    const x = M + i * (stw + gapS);
    roundRect(page, x, stepsY, stw, stepsH, 2 * MM, { fill: TINT, stroke: GRID });
    page.drawCircle({ x: x + 5 * MM, y: stepsY + stepsH - 5 * MM, size: 3 * MM, color: NAVY });
    const num = String(i + 1);
    page.drawText(num, { x: x + 5 * MM - c.bold.widthOfTextAtSize(num, 8.5) / 2, y: stepsY + stepsH - 6.4 * MM, size: 8.5, font: c.bold, color: WHITE });
    para(page, c.bold, step.name, { x: x + 10 * MM, y: stepsY + stepsH - 6.4 * MM, size: 9, lead: 10, width: stw - 11 * MM, color: INK, maxLines: 1 });
    para(page, c.reg, step.body, { x: x + 3 * MM, y: stepsY + stepsH - 11.2 * MM, size: 7.1, lead: 8.2, width: stw - 6 * MM, color: BODY, maxLines: 4 });
    para(page, c.bold, step.takes.toUpperCase(), { x: x + 3 * MM, y: stepsY + 5.6 * MM, size: 6.4, lead: 7.2, width: stw - 6 * MM, color: ACCENT, maxLines: 2 });
    if (i < n - 1) page.drawSvgPath('M 0 0 L 5 3 L 0 6 Z', { x: x + stw + gapS / 2 - 2.5, y: stepsY + stepsH / 2 + 3, color: SKY });
  });

  // apply bar
  roundRect(page, M, applyY, W - 2 * M, applyH, 3 * MM, { fill: NAVY });
  page.drawRectangle({ x: M, y: applyY + applyH - 1 * MM, width: W - 2 * M, height: 1 * MM, color: SKY });
  const qs = applyH - 4 * MM;
  const qx = W - M - 4 * MM - qs;
  const qy = applyY + 1.5 * MM;
  page.drawImage(c.qr, { x: qx, y: qy, width: qs, height: qs });
  const tx = M + 6 * MM;
  page.drawText('READY TO BUILD?', { x: tx, y: applyY + applyH - 7 * MM, size: 7.5, font: c.bold, color: LIGHT_BLUE });
  page.drawText('Apply now', { x: tx, y: applyY + applyH - 14 * MM, size: 17, font: c.bold, color: WHITE });
  para(page, c.reg, 'Pick your role, take the short online quiz and questionnaire - we reply within five business days.', {
    x: tx, y: applyY + 5.5 * MM, size: 8.4, lead: 10.4, width: qx - tx - 50 * MM, color: PALE, maxLines: 2,
  });
  const url = 'arnobot.in/career/open-positions';
  page.drawText(url, { x: qx - 6 * MM - c.bold.widthOfTextAtSize(url, 9.5), y: applyY + applyH - 14 * MM, size: 9.5, font: c.bold, color: SKY });
  const scan = 'SCAN TO APPLY';
  page.drawText(scan, { x: qx - 6 * MM - c.bold.widthOfTextAtSize(scan, 7), y: applyY + 5.5 * MM, size: 7, font: c.bold, color: WHITE });

  footer(c, page);
}

export async function buildCareersPoster(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle('ARNOBOT - Careers');
  doc.setAuthor('ARNOBOT (Arnobot Private Limited)');
  const c: Ctx = {
    doc,
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    wordmark: await doc.embedPng(WORDMARK_WHITE_PNG_BASE64),
    hero: await doc.embedJpg(HERO_JPG_BASE64),
    overlay: await doc.embedPng(HERO_OVERLAY_PNG_BASE64),
    qr: await doc.embedPng(QR_PNG_BASE64),
  };
  poster(c);
  return doc.save();
}
