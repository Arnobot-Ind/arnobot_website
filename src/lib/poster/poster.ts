/**
 * Renders the careers poster (/career/poster.pdf) as a two-page A4 PDF.
 *
 * Every role, discipline, tag, skill and hiring step is read from
 * `src/data/careers.ts` — the same list the careers page and the exam's roles
 * table use — so editing a role or a title there re-lays-out the poster on the
 * next build. Only the headline, the photos and the "what you'll do / look for /
 * get" copy are fixed text in this file.
 *
 * The photos are real robot field photographs with nobody in them (see
 * `assets.ts`). Fonts are the standard-14 Helvetica pair, which only encodes
 * WinAnsi, so `clean()` swaps any other glyph a future title or body might
 * contain rather than letting the PDF build throw.
 */
import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, clip, endPath, popGraphicsState, pushGraphicsState, rectangle, rgb, type RGB } from 'pdf-lib';
import { HIRING_PROCESS, OPEN_ROLES, ROLE_GROUPS, type OpenRole } from '@/data/careers';
import { WORDMARK_ASPECT, WORDMARK_WHITE_PNG_BASE64 } from '@/lib/quotation/wordmark';
import { HERO_JPG_BASE64, HERO_OVERLAY_PNG_BASE64, PHOTO_A_JPG_BASE64, PHOTO_B_JPG_BASE64, QR_PNG_BASE64 } from './assets';

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
  photoA: PDFImage;
  photoB: PDFImage;
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

function footer(c: Ctx, page: PDFPage, n: number) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: 17 * MM, color: DEEP });
  page.drawRectangle({ x: 0, y: 17 * MM, width: W, height: 0.7 * MM, color: SKY });
  page.drawText('careers@arnobot.in', { x: M, y: 9.2 * MM, size: 11, font: c.bold, color: WHITE });
  page.drawText('ARNOBOT Private Limited - Ahmedabad, Gujarat - Robotics for the real world', { x: M, y: 4.6 * MM, size: 8.2, font: c.reg, color: LIGHT_BLUE });
  const url = 'www.arnobot.in/career';
  page.drawText(url, { x: W - M - c.bold.widthOfTextAtSize(url, 11), y: 9.2 * MM, size: 11, font: c.bold, color: WHITE });
  const pg = `${n} / 2`;
  page.drawText(pg, { x: W - M - c.reg.widthOfTextAtSize(pg, 8.2), y: 4.6 * MM, size: 8.2, font: c.reg, color: LIGHT_BLUE });
}

function skillLine(role: OpenRole): string {
  return role.skills
    .map((s) => (s in SKILL_SHORT ? SKILL_SHORT[s]! : s))
    .filter(Boolean)
    .slice(0, 4)
    .join(' · ');
}

// ------------------------------------------------------------------ page 1
function page1(c: Ctx) {
  const page = c.doc.addPage([W, H]);
  const heroH = 112 * MM;
  const hy = H - heroH;

  // zoomed and shifted so the robot sits right of the headline
  cover(page, c.hero, 0, hy, W, heroH, { zoom: 1.2, fx: 0, fy: 0.55 });
  page.drawImage(c.overlay, { x: 0, y: hy, width: W, height: heroH });
  page.drawRectangle({ x: 0, y: hy - 0.7 * MM, width: W, height: 0.7 * MM, color: SKY });

  logo(c, page, M, H - 12 * MM, 44 * MM);
  pill(c, page, W - M - 33 * MM, H - 17.5 * MM, "WE'RE HIRING", { fill: SKY, fg: DEEP, size: 8.5, h: 6.6 * MM, padx: 4 * MM });

  page.drawText('CAREERS AT ARNOBOT', { x: M, y: H - 42 * MM, size: 8.5, font: c.bold, color: LIGHT_BLUE });
  page.drawText('Build robots', { x: M, y: H - 60 * MM, size: 40, font: c.bold, color: WHITE });
  page.drawText('that work in the', { x: M, y: H - 72.5 * MM, size: 40, font: c.bold, color: WHITE });
  page.drawText('real world.', { x: M, y: H - 85 * MM, size: 40, font: c.bold, color: SKY });

  const kinds = [...new Set(OPEN_ROLES.map((r) => r.tags[1]).filter(Boolean))];
  const disciplines = ROLE_GROUPS.map((g) => g.discipline);
  const list = disciplines.length > 1 ? `${disciplines.slice(0, -1).join(', ')} and ${disciplines.at(-1)}` : (disciplines[0] ?? '');
  const sub = `${OPEN_ROLES.length} roles across ${list}${kinds.length === 1 ? ` \u2014 each open as ${kinds[0]}` : ''}.`;
  para(page, c.reg, sub, { x: M, y: H - 91 * MM, size: 11, lead: 13.5, width: 100 * MM, color: PALE });

  // stat strip over the hero's bottom edge
  const sy = hy - 7 * MM;
  const sh = 14 * MM;
  roundRect(page, M, sy, W - 2 * M, sh, 2 * MM, { fill: WHITE, stroke: GRID });
  const place = (OPEN_ROLES[0]?.tags[0] ?? 'Ahmedabad').split(' · ');
  const stats: [string, string][] = [
    [String(OPEN_ROLES.length), OPEN_ROLES.length === 1 ? 'role' : 'roles'],
    [kinds.length === 1 ? kinds[0]! : 'Intern / Full-time', 'every role'],
    place.length > 1 ? [place[0]!, place.slice(1).join(' ')] : [place[0]!, 'location'],
    ['Paid', 'based on skill'],
  ];
  const cw = (W - 2 * M) / 4;
  stats.forEach(([big, small], i) => {
    const bt = clean(c.bold, big);
    const size = c.bold.widthOfTextAtSize(bt, 15) < cw - 8 ? 15 : 12;
    const cx = M + cw * i + cw / 2;
    page.drawText(bt, { x: cx - c.bold.widthOfTextAtSize(bt, size) / 2, y: sy + 7.2 * MM, size, font: c.bold, color: NAVY });
    const st = clean(c.reg, small);
    page.drawText(st, { x: cx - c.reg.widthOfTextAtSize(st, 8) / 2, y: sy + 3 * MM, size: 8, font: c.reg, color: BODY });
    if (i) page.drawLine({ start: { x: M + cw * i, y: sy + 2.5 * MM }, end: { x: M + cw * i, y: sy + sh - 2.5 * MM }, thickness: 0.6, color: GRID });
  });

  // role cards, two columns, as many rows as the list needs
  const top = sy - 6 * MM;
  const bottom = 17 * MM + 6 * MM;
  const gap = 4 * MM;
  const rows = Math.max(1, Math.ceil(OPEN_ROLES.length / 2));
  const ch = Math.min(48 * MM, (top - bottom - gap * (rows - 1)) / rows);
  const cardW = (W - 2 * M - gap) / 2;
  OPEN_ROLES.forEach((role, i) => {
    const r = Math.floor(i / 2);
    const x = M + (i % 2) * (cardW + gap);
    const y = top - ch - r * (ch + gap);
    roundRect(page, x, y, cardW, ch, 2.2 * MM, { fill: TINT, stroke: GRID });
    roundRect(page, x, y, 11 * MM, ch, 2.2 * MM, { fill: NAVY });
    page.drawRectangle({ x: x + 8 * MM, y, width: 3.2 * MM, height: ch, color: NAVY });
    const num = String(i + 1).padStart(2, '0');
    page.drawText(num, { x: x + 5.5 * MM - c.bold.widthOfTextAtSize(num, 17) / 2, y: y + ch - 10 * MM, size: 17, font: c.bold, color: WHITE });

    const tx = x + 14.5 * MM;
    const tw = cardW - 14.5 * MM - 3.5 * MM;
    let ty = y + ch - 6.2 * MM;
    ty = para(page, c.bold, role.title, { x: tx, y: ty, size: 12, lead: 13.5, width: tw, color: INK, maxLines: 2 });
    const bodyRoom = ty - 1.5 - (y + 14 * MM);
    para(page, c.reg, role.body, { x: tx, y: ty - 1.5, size: 9.2, lead: 12, width: tw, color: BODY, maxLines: Math.max(1, Math.floor(bodyRoom / 12) + 1) });
    page.drawText(clean(c.bold, skillLine(role)), { x: tx, y: y + 11.3 * MM, size: 7, font: c.bold, color: ACCENT });
    pill(c, page, tx, y + 3.4 * MM, (role.tags[1] ?? 'Open').toUpperCase(), { fill: NAVY, fg: WHITE });
  });
  footer(c, page, 1);
}

// ------------------------------------------------------------------ page 2
function sectionTitle(c: Ctx, page: PDFPage, x: number, y: number, text: string) {
  page.drawText(text, { x, y, size: 15, font: c.bold, color: NAVY });
  page.drawRectangle({ x, y: y - 3 * MM - 0.9 * MM, width: 10 * MM, height: 0.9 * MM, color: SKY });
}

function page2(c: Ctx) {
  const page = c.doc.addPage([W, H]);
  const band = 24 * MM;
  page.drawRectangle({ x: 0, y: H - band, width: W, height: band, color: NAVY });
  page.drawRectangle({ x: 0, y: H - band - 0.7 * MM, width: W, height: 0.7 * MM, color: SKY });
  logo(c, page, M, H - 8.5 * MM, 40 * MM);
  const come = 'Come build with us.';
  page.drawText(come, { x: W - M - c.bold.widthOfTextAtSize(come, 20), y: H - 14.5 * MM - 4, size: 20, font: c.bold, color: WHITE });

  // photos
  const ph = 60 * MM;
  const py = H - band - 6 * MM - ph;
  const gw = W - 2 * M - 4 * MM;
  const w1 = gw * 0.6;
  const w2 = gw * 0.4;
  const x2 = M + w1 + 4 * MM;
  cover(page, c.photoA, M, py, w1, ph);
  cover(page, c.photoB, x2, py, w2, ph, { fy: 0.9 });
  ([[M, w1, 'IN THE FIELD'], [x2, w2, 'ON SITE']] as const).forEach(([x, w, cap]) => {
    page.drawRectangle({ x, y: py, width: w, height: 7 * MM, color: NAVY, opacity: 0.85 });
    page.drawText(cap, { x: x + 3 * MM, y: py + 2.4 * MM, size: 8, font: c.bold, color: WHITE });
  });

  // three columns
  const cy = py - 11 * MM;
  const colW = (W - 2 * M - 12 * MM) / 3;
  const cols: [string, string[]][] = [
    ["What you'll do", ['Design, build and test real robot hardware', 'Draw, model and release parts for the workshop', 'Bring boards, harnesses and drives to life', "Be there at assembly - and fix what didn't fit"]],
    ['What we look for', ['Strong fundamentals in your discipline', "Tools you've actually used: CAD, KiCad, MCUs, shop-floor processes", 'Hands-on debugging, not just theory', "We care more about what you've built than your marks"]],
    ['What you get', ['A fast-growing robotics company to grow with', 'A passionate team and a workspace made for building', 'Real industrial robotics projects', 'Intern 3-6 months, then a full-time offer if you do well. Paid.']],
  ];
  cols.forEach(([head, items], i) => {
    const x = M + i * (colW + 6 * MM);
    sectionTitle(c, page, x, cy, head);
    let y = cy - 10 * MM;
    for (const it of items) {
      page.drawCircle({ x: x + 1.2 * MM, y: y + 1.1 * MM + 1.5, size: 0.9 * MM, color: SKY });
      y = para(page, c.reg, it, { x: x + 4 * MM, y, size: 9, lead: 11.6, width: colW - 4.5 * MM, color: BODY }) - 2.4;
    }
  });

  // hiring steps — straight from HIRING_PROCESS
  const sy = cy - 62 * MM;
  sectionTitle(c, page, M, sy, 'How we hire');
  const n = HIRING_PROCESS.length;
  const gapS = 4 * MM;
  const stw = (W - 2 * M - (n - 1) * gapS) / n;
  const boxH = 38 * MM;
  const by = sy - 8 * MM - boxH;
  HIRING_PROCESS.forEach((step, i) => {
    const x = M + i * (stw + gapS);
    roundRect(page, x, by, stw, boxH, 2 * MM, { fill: TINT, stroke: GRID });
    page.drawCircle({ x: x + 6.2 * MM, y: by + boxH - 6.5 * MM, size: 3.6 * MM, color: NAVY });
    const num = String(i + 1);
    page.drawText(num, { x: x + 6.2 * MM - c.bold.widthOfTextAtSize(num, 10) / 2, y: by + boxH - 8 * MM, size: 10, font: c.bold, color: WHITE });
    para(page, c.bold, step.name, { x: x + 12.5 * MM, y: by + boxH - 8 * MM, size: 9.6, lead: 11, width: stw - 14 * MM, color: INK, maxLines: 1 });
    para(page, c.reg, step.body, { x: x + 3.5 * MM, y: by + boxH - 15 * MM, size: 8.2, lead: 10.2, width: stw - 7 * MM, color: BODY, maxLines: 4 });
    para(page, c.bold, step.takes.toUpperCase(), { x: x + 3.5 * MM, y: by + 6 * MM, size: 7, lead: 8.4, width: stw - 7 * MM, color: ACCENT, maxLines: 2 });
    if (i < n - 1) {
      const ax = x + stw + gapS / 2;
      const my = by + boxH / 2;
      page.drawSvgPath('M 0 0 L 6 3.5 L 0 7 Z', { x: ax - 3, y: my + 3.5, color: SKY });
    }
  });

  // apply block
  const ay = 17 * MM + 6 * MM;
  const ah = by - 6 * MM - ay;
  roundRect(page, M, ay, W - 2 * M, ah, 3 * MM, { fill: NAVY });
  page.drawRectangle({ x: M, y: ay + ah - 1.1 * MM, width: W - 2 * M, height: 1.1 * MM, color: SKY });
  const qs = Math.min(ah - 12 * MM, 38 * MM);
  const qx = W - M - 5 * MM - qs;
  const qy = ay + (ah - qs) / 2 - 0.5 * MM;
  page.drawImage(c.qr, { x: qx, y: qy, width: qs, height: qs });
  const tx = M + 7 * MM;
  const ty = ay + ah - 12 * MM;
  page.drawText('READY TO BUILD?', { x: tx, y: ty, size: 8.5, font: c.bold, color: LIGHT_BLUE });
  page.drawText('Apply now', { x: tx, y: ty - 9.5 * MM, size: 22, font: c.bold, color: WHITE });
  para(page, c.reg, 'Pick your role, then take the short online quiz and questionnaire - we read every application and reply within five business days.', {
    x: tx,
    y: ty - 17 * MM,
    size: 9.6,
    lead: 12.6,
    width: qx - tx - 8 * MM,
    color: PALE,
  });
  page.drawText('arnobot.in/career/open-positions', { x: tx, y: ay + 5.5 * MM, size: 10.5, font: c.bold, color: SKY });
  const scan = 'SCAN TO APPLY';
  page.drawText(scan, { x: qx + qs / 2 - c.bold.widthOfTextAtSize(scan, 7.5) / 2, y: qy - 4.5 * MM, size: 7.5, font: c.bold, color: WHITE });
  footer(c, page, 2);
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
    photoA: await doc.embedJpg(PHOTO_A_JPG_BASE64),
    photoB: await doc.embedJpg(PHOTO_B_JPG_BASE64),
    qr: await doc.embedPng(QR_PNG_BASE64),
  };
  page1(c);
  page2(c);
  return doc.save();
}
