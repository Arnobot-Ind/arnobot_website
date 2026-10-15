import PptxGenJS from 'pptxgenjs';
import { allocation, TOTAL_CR } from '@/components/PitchScripts';

/**
 * "Download PPT" on /pitch. The deck is rebuilt in the browser from the page
 * the reader is looking at, so every figure, name and caption in the file is
 * the one on screen — there is no second copy of the deck's text to drift.
 * Each slide reads its section by the same class names the page styles with;
 * rename one there and its content goes missing here, visibly.
 *
 * The page's widgets become their native PowerPoint equivalents:
 *   - the section rail sits on every slide, current section lit, each entry a
 *     link to that section's first slide (the scroll spy);
 *   - every product's accordion is shown open: two platforms a slide, each
 *     with its specification table;
 *   - the video posters are links to the footage (the click-to-play facades);
 *   - the allocation donut is a native, editable doughnut chart, its legend
 *     carrying every amount the hover state reveals;
 *   - mail, phone and web lines on the contact slide are live links.
 *
 * Shape-level links in pptxgenjs are written without a relationship, which
 * PowerPoint rejects, so every clickable area is a transparent picture on top
 * of the artwork — PowerPoint hit-tests a picture across its whole box.
 */

type Slide = PptxGenJS.Slide;
type Run = PptxGenJS.TextProps;
type TextOpts = PptxGenJS.TextPropsOptions;
type Link = PptxGenJS.HyperlinkProps;
type Pic = { data: string; w: number; h: number };

const W = 13.333;
const H = 7.5;
const RAIL = 2.1; // the page's 232px rail, at slide scale
const X0 = RAIL + 0.55;
const CW = W - X0 - 0.55;
const BOTTOM = H - 0.55;
const NAV_Y = 1.35;
const NAV_H = 0.36;

// pitch-globals.css :root
const C = {
  indigo: '230C75',
  steel: '375E9D',
  navy: '1F3864',
  paper: 'FFFFFF',
  paper2: 'F5F7FA',
  paper3: 'EAEFF6',
  line: 'D6DFEA',
  lineSoft: 'E7ECF3',
  text1: '12203A',
  text2: '4C5A6E',
  text3: '7C8A9C',
  amber: 'E39412',
};
// Space Grotesk / IBM Plex are web fonts the recipient won't have installed.
const HEAD = 'Arial';
const BODY = 'Calibri';
const MAX_PX = 1600;

const clean = (s?: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const one = (root: ParentNode | null | undefined, sel: string) => root?.querySelector<HTMLElement>(sel) ?? null;
const all = (root: ParentNode | null | undefined, sel: string) =>
  root ? Array.from(root.querySelectorAll<HTMLElement>(sel)) : [];
const tx = (root: ParentNode | null | undefined, sel: string) => clean(one(root, sel)?.textContent);
const srcOf = (root: ParentNode | null | undefined, sel = 'img') => one(root, sel)?.getAttribute('src') ?? undefined;
const noStop = (s: string) => s.replace(/\.$/, '');

/** Rough wrapped height of a run of text. Enough to stack blocks, not to typeset. */
const textH = (s: string, pt: number, w: number, em = 0.47) =>
  Math.max(1, Math.ceil((s.length * pt * em) / 72 / w)) * ((pt * 1.22) / 72);

/** Inline markup (<br>, <em>, <strong>, <small>) to text runs. */
function runs(el: Element | null, base: TextOpts): Run[] {
  const out: Run[] = [];
  const walk = (n: Node, o: TextOpts) => {
    if (n.nodeType === Node.TEXT_NODE) {
      let t = (n.textContent ?? '').replace(/\s+/g, ' ');
      const prev = out[out.length - 1];
      if (!prev || prev.options?.breakLine) t = t.trimStart();
      if (t) out.push({ text: t, options: { ...o } });
      return;
    }
    if (!(n instanceof Element)) return;
    if (n.tagName === 'BR') {
      const prev = out[out.length - 1];
      if (prev) prev.options = { ...prev.options, breakLine: true };
      return;
    }
    const next =
      n.tagName === 'EM' ? { ...o, color: C.steel }
      : n.tagName === 'STRONG' ? { ...o, bold: true }
      : n.tagName === 'SMALL' ? { ...o, fontSize: Math.round((o.fontSize ?? 14) * 0.55), bold: false, color: C.text3 }
      : o;
    n.childNodes.forEach((c) => walk(c, next));
  };
  el?.childNodes.forEach((c) => walk(c, base));
  const last = out[out.length - 1];
  if (last) last.text = (last.text ?? '').trimEnd();
  return out;
}

async function loadPic(src: string, gray = false): Promise<Pic | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`${res.status} ${src}`);
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_PX / bmp.width);
    const asIs = scale === 1 && !gray && /^image\/(jpeg|png)$/.test(blob.type);
    let data: string;
    if (asIs) {
      data = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(blob);
      });
    } else {
      // WebP isn't safe in older PowerPoint, and the 4.7k-px wordmark would be
      // embedded at full size, so both go through a canvas.
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      const ctx = c.getContext('2d')!;
      if (gray) ctx.filter = 'grayscale(1)';
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
      data = blob.type === 'image/jpeg' ? c.toDataURL('image/jpeg', 0.88) : c.toDataURL('image/png');
    }
    return { data: data.replace(/^data:/, ''), w: bmp.width, h: bmp.height };
  } catch (err) {
    console.warn('pitch-pptx: image not embedded', src, err);
    return null;
  }
}

function canvasPng(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  paint(c.getContext('2d')!);
  return c.toDataURL('image/png').replace(/^data:/, '');
}

export async function downloadPitchDeck() {
  const doc = document;
  const sec = (id: string) => one(doc, `#${id}`);

  const nav = all(doc, '.navlist a').map((a) => ({
    id: (a.getAttribute('href') ?? '').replace('#', ''),
    idx: tx(a, '.idx'),
    label: clean(Array.from(a.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(' ')),
  }));

  // Every picture the deck uses is already on the page; fetch them once.
  const logoSrcs = new Set(all(doc, '.logo-strip img').map((i) => i.getAttribute('src') ?? ''));
  const srcs = Array.from(new Set(all(doc, 'main img, .rail img').map((i) => i.getAttribute('src') ?? '').filter(Boolean)));
  const pics = new Map(await Promise.all(srcs.map(async (s) => [s, await loadPic(s, logoSrcs.has(s))] as const)));

  const CLEAR = canvasPng(1, 1, () => {});
  const HAZARD = canvasPng(1600, 14, (ctx) => {
    ctx.fillStyle = `#${C.navy}`;
    ctx.fillRect(0, 0, 1600, 14);
    ctx.fillStyle = `#${C.amber}`;
    for (let x = -14; x < 1600; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 14, 0);
      ctx.lineTo(x + 28, 14);
      ctx.lineTo(x + 14, 14);
      ctx.fill();
    }
  });

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = doc.title;
  pres.company = 'Arnobot Private Limited';
  pres.author = 'ARNOBOT';
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

  const wordmark = pics.get(srcOf(doc, '.rail .brand img') ?? '');
  pres.defineSlideMaster({
    title: 'RAIL',
    background: { color: C.paper },
    objects: [
      ...(wordmark ? [{ image: { x: 0.3, y: 0.45, w: 1.45, h: (1.45 * wordmark.h) / wordmark.w, data: wordmark.data } }] : []),
      { text: { text: tx(doc, '.rail .brand .sub').toUpperCase(), options: { x: 0.3, y: 0.86, w: 1.7, h: 0.2, fontFace: HEAD, fontSize: 7, color: C.steel, charSpacing: 2, margin: 0 } } },
      { line: { x: 0, y: 1.2, w: RAIL, h: 0, line: { color: C.line, width: 0.75 } } },
      { line: { x: RAIL, y: 0, w: 0, h: H, line: { color: C.line, width: 0.75 } } },
      {
        text: {
          text: Array.from(one(doc, '.rail-bottom')?.childNodes ?? []).map((n) => (n.nodeName === 'BR' ? '\n' : n.textContent)).join('').toUpperCase(),
          options: { x: 0.3, y: H - 1.25, w: RAIL - 0.4, h: 0.8, fontFace: BODY, fontSize: 7.5, color: C.text3, charSpacing: 1, margin: 0, valign: 'bottom' },
        },
      },
    ],
  });

  // ---- drawing helpers -----------------------------------------------------

  const text = (s: Slide, t: string | Run[], o: TextOpts) =>
    s.addText(t, { fontFace: BODY, fontSize: 13, color: C.text2, margin: 0, valign: 'top', isTextBox: true, ...o });

  const hotspot = (s: Slide, x: number, y: number, w: number, h: number, link: Link) =>
    s.addImage({ data: CLEAR, x, y, w, h, altText: link.tooltip, hyperlink: { ...link, url: link.url?.replace(/&/g, '&amp;') } });

  const box = (s: Slide, x: number, y: number, w: number, h: number, fill = C.paper, line = C.line) =>
    s.addShape('rect', { x, y, w, h, fill: { color: fill }, line: { color: line, width: 0.75 } });

  // the page's corner-bracket card frame
  const bracket = (s: Slide, x: number, y: number, w: number, h: number) => {
    box(s, x, y, w, h);
    const k = 0.13;
    const ln = { color: C.steel, width: 1.75 };
    const corners: Array<[number, number, number, number]> = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]];
    for (const [cx, cy, dx, dy] of corners) {
      s.addShape('line', { x: dx > 0 ? cx : cx - k, y: cy, w: k, h: 0, line: { ...ln } });
      s.addShape('line', { x: cx, y: dy > 0 ? cy : cy - k, w: 0, h: k, line: { ...ln } });
    }
  };

  const image = (s: Slide, src: string | undefined, x: number, y: number, w: number, h: number, fit: 'cover' | 'contain' = 'cover', alt?: string) => {
    const p = src ? pics.get(src) : null;
    if (!p) {
      text(s, `Image pending — ${src?.split('/').pop() ?? 'image'}`.toUpperCase(), { x, y, w, h, fill: { color: C.paper3 }, align: 'center', valign: 'middle', fontSize: 8, color: C.text3 });
      return;
    }
    const r = p.w / p.h;
    if (fit === 'contain') {
      const bw = Math.min(w, h * r);
      const bh = bw / r;
      s.addImage({ data: p.data, x: x + (w - bw) / 2, y: y + (h - bh) / 2, w: bw, h: bh, altText: alt });
    } else {
      s.addImage({ data: p.data, x, y, w, h: w / r, sizing: { type: 'cover', w, h }, altText: alt });
    }
  };

  const pills = (s: Slide, items: string[], x: number, y: number, w: number, o: { pt?: number; fill?: string } = {}) => {
    const pt = o.pt ?? 10.5;
    const ph = (pt * 2.3) / 72;
    let cx = x;
    let cy = y;
    for (const label of items) {
      const pw = (label.length * pt * 0.46) / 72 + 0.28;
      if (cx + pw > x + w && cx > x) {
        cx = x;
        cy += ph + 0.08;
      }
      text(s, label, { x: cx, y: cy, w: pw, h: ph, fontSize: pt, color: C.navy, align: 'center', valign: 'middle', wrap: false, fill: { color: o.fill ?? C.paper2 }, line: { color: C.line, width: 0.75 } });
      cx += pw + 0.08;
    }
    return cy + ph - y;
  };

  const eyebrow = (s: Slide, label: string, y = 0.45, x = X0, w = CW) =>
    text(s, label.toUpperCase(), { x, y, w, h: 0.25, fontFace: HEAD, fontSize: 10, bold: true, color: C.steel, charSpacing: 2 });

  /** Eyebrow, title and optional lede; returns where the content starts. */
  const header = (s: Slide, kicker: string, title: string, lede?: string) => {
    eyebrow(s, kicker);
    const t = noStop(title);
    const th = textH(t, 28, CW, 0.48);
    text(s, t, { x: X0, y: 0.75, w: CW, h: th, fontFace: HEAD, fontSize: 28, bold: true, color: C.navy });
    let y = 0.75 + th + 0.15;
    if (lede) {
      const lh = textH(lede, 14, CW);
      text(s, lede, { x: X0, y, w: CW, h: lh, fontSize: 14 });
      y += lh;
    }
    return y + 0.35;
  };

  const linkRun = (label: string, link: Link, o: TextOpts = {}): Run => ({ text: label, options: { hyperlink: link, ...o } });

  const caption = (s: Slide, t: string, x: number, y: number, w: number) =>
    text(s, t, { x, y, w, h: 0.4, fontSize: 10.5, color: C.text3 });

  const play = (s: Slide, x: number, y: number, w: number, h: number) => {
    const d = Math.min(w, h) * 0.26;
    s.addShape('ellipse', { x: x + (w - d) / 2, y: y + (h - d) / 2, w: d, h: d, fill: { color: C.navy, transparency: 12 }, line: { color: C.paper, width: 1.5 } });
    s.addShape('triangle', { x: x + (w - d * 0.36) / 2 + d * 0.04, y: y + (h - d * 0.4) / 2, w: d * 0.4, h: d * 0.36, rotate: 90, fill: { color: C.paper }, line: { type: 'none' } });
  };

  /** A click-to-play poster: the slot's button, or the iframe once the reader has already played it (no poster left). */
  const video = (s: Slide, slot: HTMLElement, x: number, y: number, w: number) => {
    const btn = one(slot, '.yt');
    const frame = one(slot, 'iframe');
    const ids = (btn ?? frame)?.dataset;
    const url = ids?.drive ? `https://drive.google.com/file/d/${ids.drive}/view` : ids?.yt ? `https://youtu.be/${ids.yt}` : '';
    const title = tx(btn, '.yt-cap') || clean(frame?.title);
    const h = w * (9 / 16);
    if (btn) image(s, srcOf(btn), x, y, w, h, 'cover', title);
    else box(s, x, y, w, h, C.navy, C.navy);
    play(s, x, y, w, h);
    text(s, [{ text: title, options: { bold: true, color: C.navy, breakLine: true } }, { text: 'Click to play — opens in your browser', options: { fontSize: 9.5, color: C.text3 } }], { x, y: y + h + 0.1, w, h: 0.5, fontSize: 11.5 });
    if (url) hotspot(s, x, y, w, h + 0.6, { url, tooltip: `Play: ${title}` });
    return h + 0.6;
  };

  /** The labelled blocks inside a section: `<div><div class="eyebrow">Label</div>…</div>`. */
  const blocks = (root: HTMLElement | null) =>
    all(root, ':scope > div > .eyebrow').map((e) => ({ label: clean(e.textContent), el: e.parentElement }));

  // ---- the plan: every slide in order, so links can name their target ------

  type Page = { key: string; section: string; draw: (s: Slide) => void };
  const plan: Page[] = [];
  const page = (key: string, section: string, draw: (s: Slide) => void) => plan.push({ key, section, draw });
  const at = (key: string) => plan.findIndex((p) => p.key === key) + 1;

  // 00 — Overview
  const hero = sec('overview');
  page('overview', 'overview', (s) => {
    const kicker = tx(hero, '.kicker').toUpperCase();
    s.addShape('line', { x: X0, y: 0.72, w: 0.35, h: 0, line: { color: C.amber, width: 2 } });
    text(s, kicker, { x: X0 + 0.5, y: 0.6, w: 4.6, h: 0.45, fontFace: HEAD, fontSize: 9.5, bold: true, color: C.steel, charSpacing: 1.5 });
    text(s, runs(one(hero, 'h1'), { fontFace: HEAD, fontSize: 36, bold: true, color: C.navy }), { x: X0, y: 1.25, w: 5.2, h: 1.9, lineSpacingMultiple: 0.95 });
    text(s, tx(hero, '.lede'), { x: X0, y: 3.3, w: 4.9, h: 1.4, fontSize: 14 });
    const fig = one(hero, '.hero-photo');
    const px = X0 + 5.45;
    const pw = W - 0.55 - px;
    image(s, srcOf(fig), px, 0.6, pw, pw / 1.5, 'cover', one(fig, 'img')?.getAttribute('alt') ?? undefined);
    caption(s, tx(fig, 'figcaption'), px, 0.6 + pw / 1.5 + 0.08, pw);
    const stats = all(hero, '.hero-stats .stat');
    const sw = CW / stats.length;
    stats.forEach((st, i) => {
      const x = X0 + i * sw;
      box(s, x, 5.0, sw, 1.45);
      text(s, tx(st, '.num'), { x: x + 0.2, y: 5.2, w: sw - 0.4, h: 0.5, fontFace: HEAD, fontSize: 24, bold: true, color: C.indigo });
      text(s, tx(st, '.lbl'), { x: x + 0.2, y: 5.75, w: sw - 0.4, h: 0.55, fontSize: 10.5, color: C.text3 });
    });
  });

  // 01 — Company: the claim with the workshop that backs it, then the people
  const co = sec('company');
  const coKicker = tx(co, ':scope > .eyebrow');
  const [roof] = blocks(co);
  page('company', 'company', (s) => {
    const y = header(s, coKicker, tx(co, '.sec-title'), tx(co, '.sec-lede'));
    const band = one(co, '.team-band');
    const figs = [
      ...all(co, '.proof-figure').map((f) => ({ src: srcOf(f), alt: one(f, 'img')?.getAttribute('alt'), cap: tx(f, 'figcaption'), fit: 'cover' as const })),
      // the team photograph is a cut-out on white, so it is never cropped
      { src: srcOf(band), alt: one(band, 'img')?.getAttribute('alt'), cap: tx(band, 'p'), fit: 'contain' as const },
    ];
    const fw = (CW - 0.25 * (figs.length - 1)) / figs.length;
    const fh = Math.min(BOTTOM - y - 1.15, fw * 0.8);
    eyebrow(s, roof?.label ?? '', y - 0.05);
    figs.forEach((f, i) => {
      const x = X0 + i * (fw + 0.25);
      image(s, f.src, x, y + 0.3, fw, fh, f.fit, f.alt ?? undefined);
      text(s, f.cap, { x, y: y + 0.3 + fh + 0.08, w: fw, h: 0.75, fontSize: 10, color: C.text3 });
    });
  });

  page('company-people', 'company', (s) => {
    const y = header(s, coKicker, 'Mission, values and leadership');
    const people = all(co, '.founder');
    const pw = (CW - 0.3 * (people.length - 1)) / people.length;
    const ph = 1.4;
    people.forEach((p, i) => {
      const x = X0 + i * (pw + 0.3);
      bracket(s, x, y, pw, ph);
      text(s, tx(p, '.ph'), { x: x + 0.25, y: y + 0.25, w: 0.55, h: 0.55, fontFace: HEAD, fontSize: 14, bold: true, color: C.indigo, align: 'center', valign: 'middle', line: { color: C.steel, width: 1.5 } });
      text(s, tx(p, 'h3'), { x: x + 0.95, y: y + 0.24, w: pw - 1.15, h: 0.32, fontFace: HEAD, fontSize: 15, bold: true, color: C.navy });
      text(s, tx(p, '.role').toUpperCase(), { x: x + 0.95, y: y + 0.58, w: pw - 1.15, h: 0.22, fontFace: HEAD, fontSize: 8, color: C.steel, charSpacing: 1 });
      text(s, tx(p, '.cred'), { x: x + 0.25, y: y + 0.92, w: pw - 0.5, h: 0.4, fontSize: 10 });
    });
    const cy = y + ph + 0.3;
    const cells = all(co, ':scope > .grid-2 > .cell');
    const cw = (CW - 0.2 * (cells.length - 1)) / cells.length;
    const ch = Math.min(2.7, BOTTOM - cy);
    cells.forEach((c, i) => {
      const x = X0 + i * (cw + 0.2);
      box(s, x, cy, cw, ch);
      text(s, tx(c, 'h4'), { x: x + 0.22, y: cy + 0.2, w: cw - 0.44, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: C.navy });
      const pillEls = all(c, '.pill');
      if (pillEls.length) pills(s, pillEls.map((q) => clean(q.textContent)), x + 0.22, cy + 0.6, cw - 0.44, { pt: 9.5 });
      else text(s, tx(c, 'p'), { x: x + 0.22, y: cy + 0.58, w: cw - 0.44, h: ch - 0.75, fontSize: 11 });
    });
  });

  // 02 — Products: two platforms a slide, each with its own specification
  const pr = sec('products');
  const prKicker = tx(pr, ':scope > .eyebrow');
  const products = all(pr, '.product');
  const platform = (s: Slide, p: HTMLElement, x: number, y: number, w: number, h: number) => {
    bracket(s, x, y, w, h);
    const pad = 0.25;
    const iw = 2.1;
    const ih = 1.35;
    image(s, srcOf(p, '.shot img'), x + pad, y + pad, iw, ih, 'cover', tx(p, '.name'));
    text(s, [
      { text: tx(p, '.name'), options: { fontFace: HEAD, fontSize: 20, bold: true, color: C.navy, breakLine: true } },
      { text: tx(p, '.tag'), options: { fontSize: 11, color: C.text3 } },
    ], { x: x + pad + iw + 0.25, y: y + pad, w: w - 2 * pad - iw - 0.25, h: ih, valign: 'middle' });

    const iw2 = w - 2 * pad;
    const [overview, ...rest] = all(p, '.row');
    const ov = tx(overview, '.v');
    const oy = y + pad + ih + 0.15;
    const oh = textH(ov, 10.5, iw2);
    text(s, ov, { x: x + pad, y: oy, w: iw2, h: oh, fontSize: 10.5 });

    // the use case and sector rows are on the use-case matrix; the spec table is the detail kept here
    const sy = oy + oh + 0.15;
    const avail = y + h - pad - sy;
    const spec = all(p, '.spec-table tr').map((tr) => all(tr, 'td').map((td) => clean(td.textContent)));
    if (spec.length) {
      s.addTable(
        spec.map(([k, v]) => [{ text: k, options: { color: C.text3 } }, { text: v, options: { color: C.text1, bold: true } }]),
        { x: x + pad, y: sy, w: iw2, colW: [iw2 * 0.46, iw2 * 0.54], fontFace: BODY, fontSize: 10, rowH: Math.min(0.27, avail / spec.length), margin: [0.02, 0.08, 0.02, 0.08], valign: 'middle', border: { type: 'solid', pt: 0.75, color: C.lineSoft }, fill: { color: C.paper } },
      );
    } else {
      text(s, rest.flatMap((r, j): Run[] => [
        { text: tx(r, '.k').toUpperCase(), options: { fontFace: HEAD, fontSize: 8, bold: true, color: C.steel, charSpacing: 1, breakLine: true } },
        { text: tx(r, '.v'), options: { fontSize: 10.5, color: C.text2, paraSpaceAfter: 8, breakLine: j < rest.length - 1 } },
      ]), { x: x + pad, y: sy, w: iw2, h: avail });
    }
  };
  for (let i = 0; i < products.length; i += 2) {
    page(`products-${i}`, 'products', (s) => {
      const lede = i === 0 ? tx(pr, ':scope > .sec-lede').replace(/\s*Click[^.]*\.\s*$/, '') : undefined;
      const y = header(s, prKicker, tx(pr, ':scope > .sec-title'), lede);
      const pw = (CW - 0.3) / 2;
      products.slice(i, i + 2).forEach((p, j) => platform(s, p, X0 + j * (pw + 0.3), y, pw, BOTTOM - y));
    });
  }

  const [services, footage, usecases] = blocks(pr);

  page('services', 'products', (s) => {
    const y = header(s, prKicker, services?.label ?? '');
    const lw = 5.7;
    box(s, X0, y, lw, BOTTOM - y);
    const cells = all(services?.el, '.svc');
    text(s, cells.flatMap((c, i): Run[] => [
      { text: `${tx(c, '.n')}   `, options: { fontFace: HEAD, fontSize: 12, bold: true, color: C.steel, paraSpaceAfter: 3 } },
      { text: tx(c, 'h4'), options: { fontFace: HEAD, fontSize: 13.5, bold: true, color: C.navy, breakLine: true } },
      { text: tx(c, 'p'), options: { fontSize: 12, color: C.text2, paraSpaceAfter: 14, breakLine: i < cells.length - 1 } },
    ]), { x: X0 + 0.3, y: y + 0.2, w: lw - 0.6, h: BOTTOM - y - 0.4, valign: 'middle' });

    // the field footage sits beside the services it shows, still click-to-play
    const vx = X0 + lw + 0.4;
    const cw = W - 0.55 - vx;
    eyebrow(s, footage?.label ?? '', y, vx, cw);
    const slots = all(footage?.el, '.video-slot');
    const vw = Math.min(cw, ((BOTTOM - y - 0.35 - 0.15 * (slots.length - 1)) / slots.length - 0.6) * (16 / 9));
    let vy = y + 0.35;
    for (const slot of slots) vy += video(s, slot, vx + (cw - vw) / 2, vy, vw) + 0.15;
  });

  page('usecases', 'products', (s) => {
    const block = usecases?.el;
    const y = header(s, prKicker, usecases?.label ?? '', tx(block, '.sec-lede'));
    const head = all(block, '.uc-table thead th').map((th) => clean(th.textContent));
    const body = all(block, '.uc-table tbody tr').map((tr) => all(tr, 'td').map((td) => clean(td.textContent)));
    const colW = [1.15, 4.35, 2.65, CW - 1.15 - 4.35 - 2.65];
    s.addTable(
      [
        head.map((h) => ({ text: h.toUpperCase(), options: { bold: true, color: C.paper, fill: { color: C.navy }, fontFace: HEAD, fontSize: 8.5, charSpacing: 1 } })),
        ...body.map((r) => r.map((c, j) => ({ text: c, options: j === 0 ? { bold: true, color: C.navy, fontFace: HEAD, fontSize: 10 } : {} }))),
      ],
      { x: X0, y, w: CW, colW, fontFace: BODY, fontSize: 10.5, color: C.text2, margin: [0.05, 0.1, 0.05, 0.1], valign: 'top', border: { type: 'solid', pt: 0.75, color: C.line }, fill: { color: C.paper } },
    );
    text(s, tx(block, '.fin-note'), { x: X0, y: BOTTOM - 0.15, w: CW, h: 0.25, fontSize: 9.5, italic: true, color: C.text3 });
  });

  // 03 — Technology: the stack, then the loop it runs and the station that watches it
  const te = sec('technology');
  const teKicker = tx(te, ':scope > .eyebrow');
  page('technology', 'technology', (s) => {
    const y = header(s, teKicker, tx(te, ':scope > .sec-title'), tx(te, ':scope > .sec-lede'));
    const layers = all(te, ':scope > .grid-4 .svc');
    const cw = (CW - 0.2 * (layers.length - 1)) / layers.length;
    const ch = Math.min(3.4, BOTTOM - y);
    layers.forEach((c, i) => {
      const x = X0 + i * (cw + 0.2);
      box(s, x, y, cw, ch);
      text(s, tx(c, '.n'), { x: x + 0.25, y: y + 0.25, w: cw - 0.5, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true, color: C.steel });
      text(s, tx(c, 'h4'), { x: x + 0.25, y: y + 0.7, w: cw - 0.5, h: 0.35, fontFace: HEAD, fontSize: 15, bold: true, color: C.navy });
      text(s, tx(c, 'p'), { x: x + 0.25, y: y + 1.15, w: cw - 0.5, h: ch - 1.35, fontSize: 12.5 });
    });
  });

  page('tech-loop', 'technology', (s) => {
    const y = header(s, teKicker, blocks(te)[0]?.label ?? '');
    const cards = all(te, '.tcard:not(.tcard-wide)');
    const cw = (CW - 0.3 * (cards.length - 1)) / cards.length;
    const ih = 1.45;
    const ch = ih + 1.55;
    cards.forEach((c, i) => {
      const x = X0 + i * (cw + 0.3);
      box(s, x, y, cw, ch);
      image(s, srcOf(c), x, y, cw, ih, 'cover', one(c, 'img')?.getAttribute('alt') ?? undefined);
      text(s, [
        { text: `${tx(c, '.n')}   `, options: { fontFace: HEAD, fontSize: 10, bold: true, color: C.steel } },
        { text: tx(c, 'h4'), options: { fontFace: HEAD, fontSize: 15, bold: true, color: C.navy, breakLine: true, paraSpaceAfter: 4 } },
        { text: tx(c, 'p'), options: { fontSize: 11, color: C.text2 } },
      ], { x: x + 0.22, y: y + ih + 0.15, w: cw - 0.44, h: ch - ih - 0.25 });
    });

    const card = one(te, '.tcard-wide');
    const gy = y + ch + 0.3;
    const gh = BOTTOM - gy;
    const giw = gh * 1.6;
    box(s, X0, gy, CW, gh);
    image(s, srcOf(card), X0, gy, giw, gh, 'cover', one(card, 'img')?.getAttribute('alt') ?? undefined);
    text(s, [
      { text: `${tx(card, '.n')}   `, options: { fontFace: HEAD, fontSize: 10, bold: true, color: C.steel } },
      { text: tx(card, 'h4'), options: { fontFace: HEAD, fontSize: 15, bold: true, color: C.navy, breakLine: true, paraSpaceAfter: 4 } },
      { text: tx(card, 'p'), options: { fontSize: 11, color: C.text2 } },
    ], { x: X0 + giw + 0.3, y: gy + 0.15, w: CW - giw - 0.55, h: gh - 0.3, valign: 'middle' });
  });

  // 04 — Market
  const mk = sec('market');
  page('market', 'market', (s) => {
    const y = header(s, tx(mk, ':scope > .eyebrow'), tx(mk, ':scope > .sec-title'), tx(mk, ':scope > .sec-lede'));
    const stats = all(mk, '.mstat');
    const sw = (CW - 0.12 * (stats.length - 1)) / stats.length;
    stats.forEach((m, i) => {
      const x = X0 + i * (sw + 0.12);
      box(s, x, y, sw, 1.65);
      text(s, tx(m, '.lbl').toUpperCase(), { x: x + 0.15, y: y + 0.15, w: sw - 0.3, h: 0.32, fontFace: HEAD, fontSize: 7.5, color: C.text3, charSpacing: 0.5 });
      text(s, runs(one(m, '.val'), { fontFace: HEAD, fontSize: 16, bold: true, color: C.indigo }), { x: x + 0.15, y: y + 0.52, w: sw - 0.3, h: 0.65 });
      text(s, tx(m, '.ctx'), { x: x + 0.15, y: y + 1.2, w: sw - 0.3, h: 0.35, fontSize: 9.5, color: C.text3 });
    });
    const cy = y + 1.65 + 0.25;
    const cells = all(mk, ':scope > .grid-2 > .cell');
    const cw = (CW - 0.25) / 2;
    const ch = BOTTOM - 0.35 - cy;
    cells.forEach((c, i) => {
      const x = X0 + i * (cw + 0.25);
      box(s, x, cy, cw, ch);
      text(s, tx(c, 'h4'), { x: x + 0.3, y: cy + 0.22, w: cw - 0.6, h: 0.3, fontFace: HEAD, fontSize: 14, bold: true, color: C.navy });
      const pillEls = all(c, '.pill');
      if (pillEls.length) pills(s, pillEls.map((p) => clean(p.textContent)), x + 0.3, cy + 0.65, cw - 0.6, { pt: 10 });
      else text(s, tx(c, 'p'), { x: x + 0.3, y: cy + 0.62, w: cw - 0.6, h: ch - 0.8, fontSize: 12.5 });
    });
    text(s, tx(mk, '.fin-note'), { x: X0, y: BOTTOM - 0.2, w: CW, h: 0.25, fontSize: 9.5, italic: true, color: C.text3 });
  });

  // 05 — Traction: the counts, who and what, and the sites photographed on the day
  const tr = sec('traction');
  page('traction', 'traction', (s) => {
    const y = header(s, tx(tr, ':scope > .eyebrow'), tx(tr, ':scope > .sec-title'));
    const nums = all(tr, '.trac-nums .tn');
    const nw = (CW - 0.12 * (nums.length - 1)) / nums.length;
    nums.forEach((n, i) => {
      const x = X0 + i * (nw + 0.12);
      box(s, x, y, nw, 0.9);
      text(s, tx(n, '.num'), { x: x + 0.15, y: y + 0.08, w: nw - 0.3, h: 0.42, fontFace: HEAD, fontSize: 22, bold: true, color: C.indigo });
      text(s, tx(n, '.lbl'), { x: x + 0.15, y: y + 0.5, w: nw - 0.3, h: 0.35, fontSize: 9, color: C.text3 });
    });

    const [clients, site] = blocks(tr);
    const lw = 5.4;
    let ly = y + 0.9 + 0.3;
    const gy = ly;
    eyebrow(s, clients?.label ?? '', ly);
    ly += 0.3 + pills(s, all(tr, '.name-strip li').map((li) => clean(li.textContent)), X0, ly + 0.3, lw, { pt: 9.5, fill: C.paper }) + 0.18;
    for (const c of all(tr, ':scope > .grid-2 > .cell')) {
      eyebrow(s, tx(c, 'h4'), ly, X0, lw);
      ly += 0.3;
      const pillEls = all(c, '.pill');
      if (pillEls.length) {
        ly += pills(s, pillEls.map((p) => clean(p.textContent)), X0, ly, lw, { pt: 9.5, fill: C.paper2 }) + 0.18;
      } else {
        const ph = textH(tx(c, 'p'), 10.5, lw);
        text(s, tx(c, 'p'), { x: X0, y: ly, w: lw, h: ph, fontSize: 10.5 });
        ly += ph + 0.18;
      }
    }

    const rx = X0 + lw + 0.4;
    const rw = W - 0.55 - rx;
    eyebrow(s, site?.label ?? '', gy, rx, rw);
    const figs = all(tr, '.proof-figure');
    const fw = (rw - 0.15) / 2;
    const fh = Math.min(fw / 1.5, (BOTTOM - gy - 0.3 - 0.15 - 2 * 0.4) / 2);
    figs.forEach((f, i) => {
      const x = rx + (i % 2) * (fw + 0.15);
      const fy = gy + 0.3 + Math.floor(i / 2) * (fh + 0.4 + 0.15);
      image(s, srcOf(f), x, fy, fw, fh, 'cover', one(f, 'img')?.getAttribute('alt') ?? undefined);
      text(s, tx(f, 'figcaption'), { x, y: fy + fh + 0.05, w: fw, h: 0.35, fontSize: 9, color: C.text3 });
    });
  });

  // 06 — The Ask: the allocation and the closing argument, on one slide
  const ask = sec('ask');
  const cr = (pct: number) => (TOTAL_CR * pct / 100).toFixed(2).replace(/\.00$/, '');
  page('ask', 'ask', (s) => {
    const lede = tx(ask, ':scope > .sec-lede').replace(/\s*Hover[^.]*\.\s*$/, '');
    const y = header(s, tx(ask, ':scope > .eyebrow'), tx(ask, ':scope > .sec-title'), lede);
    const bottom = BOTTOM - 0.4; // the NDA note sits under both columns

    const lw = 4.0;
    const d = 2.0;
    const dx = X0 + (lw - d) / 2;
    s.addChart('doughnut', [{ name: 'Allocation', labels: allocation.map((a) => a.label), values: allocation.map((a) => a.pct) }], {
      x: dx, y, w: d, h: d,
      holeSize: 64,
      chartColors: allocation.map((a) => a.color.slice(1)),
      dataBorder: { pt: 1.5, color: C.paper2 },
      showLegend: false, showValue: false, showPercent: false, showLabel: false, showTitle: false,
      chartArea: { fill: { color: C.paper2 } },
      plotArea: { fill: { color: C.paper2 } },
    });
    text(s, [
      { text: tx(ask, '.raise-amt'), options: { fontFace: HEAD, fontSize: 20, bold: true, color: C.indigo, breakLine: true } },
      { text: 'TOTAL ASK', options: { fontFace: HEAD, fontSize: 7, color: C.text3, charSpacing: 1 } },
    ], { x: dx + d * 0.2, y: y + d * 0.3, w: d * 0.6, h: d * 0.4, align: 'center', valign: 'middle' });

    const ly = y + d + 0.2;
    const rh = Math.min(0.3, (bottom - ly) / allocation.length);
    allocation.forEach((row, i) => {
      const ry = ly + i * rh;
      s.addShape('rect', { x: X0, y: ry + rh / 2 - 0.06, w: 0.12, h: 0.12, fill: { color: row.color.slice(1) }, line: { type: 'none' } });
      text(s, row.label, { x: X0 + 0.25, y: ry, w: lw - 1.65, h: rh, valign: 'middle', fontSize: 11 });
      text(s, `₹${cr(row.pct)} Cr`, { x: X0 + lw - 1.35, y: ry, w: 0.85, h: rh, valign: 'middle', align: 'right', fontSize: 10, color: C.text3 });
      text(s, `${row.pct}%`, { x: X0 + lw - 0.45, y: ry, w: 0.45, h: rh, valign: 'middle', align: 'right', fontSize: 10, bold: true, color: C.indigo });
      s.addShape('line', { x: X0, y: ry + rh, w: lw, h: 0, line: { color: C.line, width: 0.5 } });
    });

    const px = X0 + lw + 0.45;
    const pw = W - 0.55 - px;
    box(s, px, y, pw, bottom - y);
    // one box, so PowerPoint flows the points however many lines each takes
    const points = all(ask, ':scope > .grid-4 .svc');
    text(s, points.flatMap((c, i): Run[] => [
      { text: `${tx(c, '.n')}   `, options: { fontFace: HEAD, fontSize: 12, bold: true, color: C.steel, paraSpaceAfter: 3 } },
      { text: tx(c, 'h4'), options: { fontFace: HEAD, fontSize: 12.5, bold: true, color: C.navy, breakLine: true } },
      { text: tx(c, 'p'), options: { fontSize: 10.5, color: C.text2, paraSpaceAfter: 13, breakLine: i < points.length - 1 } },
    ]), { x: px + 0.3, y: y + 0.2, w: pw - 0.6, h: bottom - y - 0.4, valign: 'middle' });
    text(s, tx(ask, '.fin-note'), { x: X0, y: BOTTOM - 0.2, w: CW, h: 0.25, fontSize: 9.5, italic: true, color: C.text3 });
  });

  // 07 — Recognition
  const re = sec('recognition');
  page('recognition', 'recognition', (s) => {
    const y = header(s, tx(re, ':scope > .eyebrow'), tx(re, ':scope > .sec-title'));
    const cols = all(re, ':scope > .grid-2 > .cell');
    const cw = (CW - 0.25) / 2;
    const logoY = BOTTOM - 0.6;
    const ch = logoY - 0.3 - y;
    cols.forEach((c, i) => {
      const x = X0 + i * (cw + 0.25);
      box(s, x, y, cw, ch);
      text(s, tx(c, ':scope > h4'), { x: x + 0.3, y: y + 0.2, w: cw - 0.6, h: 0.3, fontFace: HEAD, fontSize: 14, bold: true, color: C.navy });
      let ry = y + 0.6;
      all(c, '.award-row').forEach((r) => {
        text(s, tx(r, '.yr').toUpperCase(), { x: x + 0.3, y: ry + 0.02, w: 1.0, h: 0.25, fontFace: HEAD, fontSize: 8.5, color: C.steel });
        text(s, [
          { text: tx(r, 'h4'), options: { fontFace: HEAD, fontSize: 11.5, bold: true, color: C.navy, breakLine: true } },
          { text: tx(r, 'p'), options: { fontSize: 10.5, color: C.text3 } },
        ], { x: x + 1.35, y: ry, w: cw - 1.65, h: 0.5 });
        ry += 0.62;
      });
      const slot = one(c, '.video-slot');
      if (slot) {
        const vw = Math.min(cw - 0.6, ((y + ch - 0.7 - ry) * 16) / 9);
        video(s, slot, x + 0.3, ry + 0.05, vw);
      }
    });
    const logos = all(re, '.logo-strip img');
    const lw = CW / logos.length;
    logos.forEach((l, i) => image(s, l.getAttribute('src') ?? undefined, X0 + i * lw + 0.15, logoY, lw - 0.3, 0.55, 'contain', l.getAttribute('alt') ?? undefined));
  });

  // 08 — Contact
  const ct = sec('contact');
  page('contact', 'contact', (s) => {
    const y = header(s, tx(ct, ':scope > .eyebrow'), tx(ct, ':scope > .sec-title'));
    const card = one(ct, '.contact-card');
    const cw = 4.6;
    const ch = 3.3;
    bracket(s, X0, y, cw, ch);
    text(s, tx(card, '.role').toUpperCase(), { x: X0 + 0.35, y: y + 0.3, w: cw - 0.7, h: 0.25, fontFace: HEAD, fontSize: 8.5, color: C.steel, charSpacing: 1 });
    text(s, tx(card, 'h3'), { x: X0 + 0.35, y: y + 0.6, w: cw - 0.7, h: 0.45, fontFace: HEAD, fontSize: 22, bold: true, color: C.navy });
    const lines = all(card, 'a.line');
    text(s, lines.map((a, i) => linkRun(clean(a.textContent), { url: a.getAttribute('href') ?? '', tooltip: clean(a.textContent) }, { color: C.steel, breakLine: i < lines.length - 1 })), { x: X0 + 0.35, y: y + 1.2, w: cw - 0.7, h: 0.85, fontSize: 13, paraSpaceAfter: 3 });
    text(s, Array.from(one(card, '.addr')?.childNodes ?? []).map((n) => (n.nodeName === 'BR' ? '\n' : n.textContent)).join(''), { x: X0 + 0.35, y: y + 2.25, w: cw - 0.7, h: 0.8, fontSize: 10.5, color: C.text3 });

    const sx = X0 + cw + 0.5;
    const sw = W - 0.55 - sx;
    eyebrow(s, tx(ct, '.supported-by .lbl'), y, sx, sw);
    pills(s, all(ct, '.sb-pills span').map((p) => clean(p.textContent)), sx, y + 0.35, sw, { pt: 11, fill: C.paper });

    const foot = one(ct, '.foot-mark');
    const mark = pics.get(srcOf(foot) ?? '');
    const fy = y + ch + 0.45;
    if (mark) s.addImage({ data: mark.data, x: X0, y: fy, w: 1.6, h: (1.6 * mark.h) / mark.w, altText: 'ARNOBOT' });
    text(s, tx(foot, 'span').toUpperCase(), { x: X0 + 1.85, y: fy, w: 5, h: (1.6 * (mark?.h ?? 1)) / (mark?.w ?? 4.5), valign: 'middle', fontFace: HEAD, fontSize: 8.5, color: C.text3, charSpacing: 1.5 });

    s.addImage({ data: HAZARD, x: RAIL + 0.01, y: H - 0.62, w: W - RAIL - 0.01, h: 0.09 });
    text(s, tx(doc, '.confidential').toUpperCase(), { x: X0, y: H - 0.43, w: CW - 0.8, h: 0.22, fontFace: HEAD, fontSize: 7.5, color: C.text3, charSpacing: 1.5 });
  });

  // ---- render --------------------------------------------------------------

  const firstOf = (section: string) => at(plan.find((p) => p.section === section)?.key ?? '');
  let current = '';
  for (const p of plan) {
    const label = nav.find((n) => n.id === p.section)?.label ?? p.section;
    if (p.section !== current) {
      pres.addSection({ title: label });
      current = p.section;
    }
    const s = pres.addSlide({ masterName: 'RAIL', sectionTitle: label });
    if (sec(p.section)?.classList.contains('alt')) {
      s.addShape('rect', { x: RAIL + 0.01, y: 0, w: W - RAIL - 0.01, h: H, fill: { color: C.paper2 }, line: { type: 'none' } });
    }
    nav.forEach((n, i) => {
      const y = NAV_Y + i * NAV_H;
      const on = n.id === p.section;
      if (on) {
        s.addShape('rect', { x: 0, y, w: RAIL, h: NAV_H, fill: { color: C.paper2 }, line: { type: 'none' } });
        s.addShape('rect', { x: 0, y, w: 0.03, h: NAV_H, fill: { color: C.steel }, line: { type: 'none' } });
      }
      text(s, [
        { text: n.idx, options: { fontFace: HEAD, fontSize: 8, color: on ? C.steel : C.text3 } },
        { text: `   ${n.label}`, options: { fontSize: 11.5, bold: on, color: on ? C.navy : C.text2 } },
      ], { x: 0.3, y, w: RAIL - 0.4, h: NAV_H, valign: 'middle' });
      const target = firstOf(n.id);
      if (target) hotspot(s, 0, y, RAIL, NAV_H, { slide: target, tooltip: n.label });
    });
    p.draw(s);
  }

  await pres.writeFile({ fileName: 'ARNOBOT-Pitch-Deck.pptx', compression: true });
}
