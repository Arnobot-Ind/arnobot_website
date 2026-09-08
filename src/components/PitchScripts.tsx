'use client';

import { useEffect } from 'react';

/**
 * Behaviour for the /pitch deck — a direct port of the scripts in
 * presentation.src.html: scroll spy, fade-up reveal, product accordion,
 * click-to-play video facades and the allocation donut.
 *
 * The two financial bar charts this file also used to draw went out with the
 * financial-snapshot section; the deck no longer publishes those figures.
 */

const NS = 'http://www.w3.org/2000/svg';

const TOTAL_CR = 4;
const allocation = [
  { label: 'R&D & Product Development', pct: 25, color: '#230C75' },
  { label: 'Infrastructure & Lab', pct: 20, color: '#2F3F8E' },
  { label: 'Team & Hiring', pct: 15, color: '#375E9D' },
  { label: 'Business Development', pct: 10, color: '#5A85BE' },
  { label: 'Certifications & Compliance', pct: 10, color: '#8AA9D2' },
  { label: 'Testing & Field Trials', pct: 10, color: '#E39412' },
  { label: 'Working Capital', pct: 10, color: '#B7C6DA' },
];

function drawDonut() {
  const svg = document.getElementById('donutChart') as SVGSVGElement | null;
  const legend = document.getElementById('donutLegend') as HTMLUListElement | null;
  if (!svg || !legend) return;
  svg.innerHTML = '';
  legend.innerHTML = '';

  const cx = 100,
    cy = 100,
    r = 76,
    sw = 26;
  const C = 2 * Math.PI * r;
  let offset = 0;

  function centerLabel(text: string) {
    let t = svg!.querySelector('.center-label') as SVGTextElement | null;
    if (!t) {
      t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'center-label');
      t.setAttribute('x', String(cx));
      t.setAttribute('y', String(cy + 3));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '8.5');
      t.setAttribute('fill', '#1F3864');
      svg!.appendChild(t);
    }
    t.textContent = text;
  }
  function reset() {
    svg!.querySelectorAll('circle').forEach((c) => c.setAttribute('opacity', '1'));
    legend!.querySelectorAll('li').forEach((l) => l.classList.remove('active'));
    centerLabel('');
  }

  allocation.forEach((a, i) => {
    const len = (a.pct / 100) * C;
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', a.color);
    circle.setAttribute('stroke-width', String(sw));
    circle.setAttribute('stroke-dasharray', `${len} ${C - len}`);
    circle.setAttribute('stroke-dashoffset', String(-offset));
    circle.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
    circle.style.transition = 'opacity .15s';
    circle.style.cursor = 'pointer';
    circle.dataset.idx = String(i);
    svg.appendChild(circle);
    offset += len;

    const amount = (TOTAL_CR * a.pct / 100).toFixed(2).replace(/\.00$/, '');
    const li = document.createElement('li');
    li.innerHTML = `<span class="sw" style="background:${a.color}"></span><span class="lbl">${a.label}</span><span class="amt">₹${amount} Cr</span><span class="pct">${a.pct}%</span>`;
    li.dataset.idx = String(i);
    legend.appendChild(li);

    function highlight() {
      svg!.querySelectorAll('circle').forEach((c) =>
        c.setAttribute('opacity', (c as SVGCircleElement).dataset.idx === String(i) ? '1' : '0.22'),
      );
      legend!.querySelectorAll('li').forEach((l) => l.classList.toggle('active', l === li));
      centerLabel(`₹${amount} Cr · ${a.pct}%`);
    }
    circle.addEventListener('mouseenter', highlight);
    circle.addEventListener('mouseleave', reset);
    li.addEventListener('mouseenter', highlight);
    li.addEventListener('mouseleave', reset);
  });
}

export default function PitchScripts() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ---- scroll spy ----
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.navlist a');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('active'));
            const link = document.querySelector(`.navlist a[href="#${e.target.getAttribute('id')}"]`);
            if (link) link.classList.add('active');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    cleanups.push(() => io.disconnect());

    // ---- fade-up reveal ----
    const fio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            fio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll('.cell, .product, .mstat, .trac-nums, .hero-photo, .uc-table, .proof-figure')
      .forEach((el) => {
        el.classList.add('fade-up');
        fio.observe(el);
      });
    cleanups.push(() => fio.disconnect());

    // ---- product accordion ----
    document.querySelectorAll<HTMLElement>('.product').forEach((p) => {
      const head = p.querySelector<HTMLElement>('.head')!;
      const body = p.querySelector<HTMLElement>('.body')!;
      const onClick = () => {
        const isOpen = p.classList.contains('open');
        document.querySelectorAll<HTMLElement>('.product').forEach((o) => {
          o.classList.remove('open');
          o.querySelector<HTMLElement>('.body')!.style.maxHeight = '';
        });
        if (!isOpen) {
          p.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      };
      head.addEventListener('click', onClick);
      cleanups.push(() => head.removeEventListener('click', onClick));
    });

    // ---- click-to-play video facades (YouTube + Google Drive) ----
    // Served over http(s) the poster is swapped for a real inline player; from
    // file:// both providers refuse to embed, so the video opens in a new tab.
    document.querySelectorAll<HTMLElement>('.yt').forEach((el) => {
      const id = el.dataset.yt;
      const drive = el.dataset.drive;
      const watch = drive ? `https://drive.google.com/file/d/${drive}/view` : `https://youtu.be/${id}`;
      const embed = drive
        ? `https://drive.google.com/file/d/${drive}/preview`
        : `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      const onClick = () => {
        if (location.protocol === 'file:') {
          window.open(watch, '_blank', 'noopener');
          return;
        }
        const f = document.createElement('iframe');
        f.src = embed;
        f.title = el.getAttribute('aria-label') || 'ARNOBOT video';
        f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
        f.allowFullscreen = true;
        el.replaceWith(f);
      };
      el.addEventListener('click', onClick);
      cleanups.push(() => el.removeEventListener('click', onClick));
    });

    // ---- placeholder for assets not yet dropped into /public/pitch/assets ----
    const placeholder = (img: HTMLImageElement) => {
      if (img.dataset.phDone) return;
      img.dataset.phDone = '1';
      const file = img.getAttribute('src')?.split('/').pop() || 'image';
      const ph = document.createElement('div');
      ph.className = 'img-ph';
      ph.textContent = `Image pending — ${file}`;
      img.replaceWith(ph);
    };
    document.querySelectorAll<HTMLImageElement>('main img, .rail img').forEach((img) => {
      const onError = () => placeholder(img);
      if (img.complete && img.naturalWidth === 0) placeholder(img);
      else img.addEventListener('error', onError);
      cleanups.push(() => img.removeEventListener('error', onError));
    });

    // ---- allocation donut ----
    drawDonut();

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
