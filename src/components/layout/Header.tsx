'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn, queryAll } from '@/lib/dom';
import { PRIMARY_NAV, PRODUCT_NAV, SECONDARY_NAV, SITE } from '@/data/site';
import { CaretIcon, CloseIcon } from '@/components/ui/Icons';
import LogoMark from '@/components/ui/LogoMark';
import ProductLink from '@/components/ui/ProductLink';

const DESKTOP_BREAKPOINT = 1024;
const MENU_WIDTH_FALLBACK = 220;
const EDGE_GUTTER = 8;
/** Frames to keep retrying focus while the menu's open transition runs. */
const MENU_FOCUS_ATTEMPTS = 10;

/**
 * Whether a nav entry points at the section the reader is on. Sub-routes
 * belong to their section — `/insights/<slug>` highlights INSIGHTS — hence the
 * prefix test alongside the exact match.
 * Styling hangs off the `aria-current` attribute this drives (style.css),
 * so the highlight and the accessibility announcement cannot drift apart.
 */
function isCurrentSection(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site header — port of includes/header.php.
 *
 * The original toggled classes imperatively from main.js; the same classes and
 * markup are now driven by React state, which keeps `aria-expanded`, focus and
 * the open/closed flags in sync automatically.
 */
export default function Header() {
  const submenuId = useId();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; arrow: number } | null>(null);
  const [tucked, setTucked] = useState(false);
  const [onLight, setOnLight] = useState(false);

  // One fully transparent header, site-wide, at every depth. It reads the
  // section passing under it — sections that opt in with
  // `data-header-theme="dark"` (video heroes, dark bands, the footer) get
  // white type, everything else gets ink. It fades away on the way down the
  // page and back on the way up.

  // Every product lives at /product?id=<slug>, so the pathname alone says
  // whether the reader is somewhere in the PRODUCT section. `"true"` rather
  // than `"page"`: the toggle opens a menu, it is not itself the page link.
  const productActive = isCurrentSection(pathname, '/product');

  /**
   * Which ground is under the bar right now. Probes the middle of the bar
   * with `elementsFromPoint`, skips the bar and any open dialog, and climbs
   * to the nearest themed ancestor. Cheap enough to run on every scroll frame.
   */
  const syncTheme = useCallback(() => {
    const navHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 65;
    const stack = document.elementsFromPoint(Math.round(window.innerWidth / 2), Math.max(1, Math.round(navHeight / 2)));
    let dark = false;
    for (const element of stack) {
      if (element.closest('.header, .mobile-menu, .industry-modal, .video-modal')) continue;
      dark = element.closest('[data-header-theme]')?.getAttribute('data-header-theme') === 'dark';
      break;
    }
    setOnLight(!dark);
  }, []);

  // Re-read the ground on every route (the page under the bar has changed),
  // once more after the content has had a frame to hydrate, and on resize.
  useEffect(() => {
    const raf = requestAnimationFrame(syncTheme);
    const late = window.setTimeout(syncTheme, 300);
    window.addEventListener('resize', syncTheme, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener('resize', syncTheme);
    };
  }, [pathname, syncTheme]);

  /**
   * Tucks the bar away while the reader scrolls down and brings it back the
   * moment they scroll up, so the page keeps its full height when reading and
   * the nav is one flick away when wanted.
   *
   * Held open near the top of the page — a bar that vanishes on the first
   * nudge of a hero reads as a glitch. An open menu stops the tucking here
   * and is also answered by `barTucked` below, since sliding the anchor out
   * from under an open dropdown would strand it mid-air.
   */
  useEffect(() => {
    /** Scroll below this and the bar stays put; roughly one hero-title height. */
    const HOLD_OPEN_ABOVE = 180;
    /** Movement under this is noise — a trackpad settling, an elastic bounce. */
    const DEAD_ZONE = 5;
    const menuOpen = mobileOpen || dropdownOpen;

    /** Upward travel the reader has to cover before the bar comes back. A
        single reverse flick past section copy would otherwise flash the bar
        over the text for a beat; a deliberate scroll-up still brings it. */
    const SHOW_AFTER_UP = 64;

    let last = window.scrollY;
    let upTravel = 0;
    let queued = false;

    const sync = () => {
      queued = false;
      syncTheme();
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) < DEAD_ZONE) return;

      last = y;
      if (menuOpen) return;
      if (delta > 0) {
        upTravel = 0;
        setTucked(y > HOLD_OPEN_ABOVE);
      } else {
        upTravel += -delta;
        if (upTravel >= SHOW_AFTER_UP || y <= HOLD_OPEN_ABOVE) setTucked(false);
      }
    };

    // rAF-throttled: scroll fires far more often than the bar can change state.
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(sync);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname, mobileOpen, dropdownOpen, syncTheme]);

  /* Derived rather than forced from the effect: an open menu has to keep the
     bar on screen, and computing that here avoids a second render pass. */
  const barTucked = tucked && !mobileOpen && !dropdownOpen;

  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Hover-opens the PRODUCT menu on pointer devices, with a short grace on
   * the way out: the floating card hangs 10px below the toggle, and the
   * timer keeps the menu from snapping shut while the pointer crosses that
   * gap. Click and keyboard behaviour stay untouched, so touch and assistive
   * tech keep the explicit toggle.
   */
  const hoverCloseTimer = useRef<number | null>(null);
  const cancelHoverClose = () => {
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };
  const hoverCapable = () =>
    window.matchMedia('(hover: hover)').matches && window.innerWidth >= DESKTOP_BREAKPOINT;
  const onDropdownMouseEnter = () => {
    if (!hoverCapable()) return;
    cancelHoverClose();
    setDropdownOpen(true);
  };
  const onDropdownMouseLeave = () => {
    if (!hoverCapable()) return;
    cancelHoverClose();
    hoverCloseTimer.current = window.setTimeout(() => setDropdownOpen(false), 180);
  };
  useEffect(() => cancelHoverClose, []);

  // Every menu item closes what it opened via its own onClick, so there is no
  // route-change effect here; this only serves the Escape key handler below.
  const closeAll = useCallback(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
    setMobileSubmenuOpen(false);
  }, []);

  /** Mirrors positionDropdown() from main.js: centre under the toggle, clamped to the viewport. */
  const positionDropdown = useCallback(() => {
    const toggle = toggleRef.current;
    const menu = menuRef.current;
    if (!toggle || !menu) return;

    const rect = toggle.getBoundingClientRect();
    const menuWidth = menu.offsetWidth || MENU_WIDTH_FALLBACK;
    const left = Math.max(
      EDGE_GUTTER,
      Math.min(rect.left + rect.width / 2 - menuWidth / 2, window.innerWidth - menuWidth - EDGE_GUTTER),
    );

    setMenuPosition({ top: rect.bottom + 10, left, arrow: rect.left + rect.width / 2 - left });
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    positionDropdown();

    const reposition = () => positionDropdown();
    window.addEventListener('resize', reposition, { passive: true });
    window.addEventListener('scroll', reposition, { passive: true });

    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('click', onPointerDown);

    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition);
      document.removeEventListener('click', onPointerDown);
    };
  }, [dropdownOpen, positionDropdown]);

  // Escape closes; widening past the mobile breakpoint closes the drawer.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (dropdownOpen) toggleRef.current?.focus();
      closeAll();
    };
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [dropdownOpen, closeAll]);

  // The drawer covers the page, so the page behind it must not scroll.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /**
   * Focuses the first or last menu item.
   *
   * `.dropdown-menu` is `visibility: hidden` until the `.open` class applies, and
   * focus() is a no-op on a hidden element — so this retries for a few frames
   * until the item actually takes focus instead of assuming one frame is enough.
   */
  const focusMenuItem = (position: 'first' | 'last', attemptsLeft = MENU_FOCUS_ATTEMPTS) => {
    requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (!menu) return;

      const items = queryAll<HTMLAnchorElement>('a', menu);
      const target = position === 'first' ? items[0] : items[items.length - 1];
      if (!target) return;

      target.focus();
      if (document.activeElement !== target && attemptsLeft > 1) {
        focusMenuItem(position, attemptsLeft - 1);
      }
    });
  };

  const onToggleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Standard menu-button keys: Enter/Space toggle, arrows open and enter the menu.
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (dropdownOpen) {
        setDropdownOpen(false);
        return;
      }
      setDropdownOpen(true);
      focusMenuItem('first');
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setDropdownOpen(true);
      focusMenuItem(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = queryAll<HTMLAnchorElement>('a', event.currentTarget);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLAnchorElement);
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    items[(current + offset + items.length) % items.length]?.focus();
  };

  return (
    <>
      <header
        className={cn('header', onLight && 'header-on-light', barTucked && 'header-tucked')}
      >
        <div className="header-inner">
          {/* The full ARNOBOT wordmark as an inline SVG in currentColor — white
              over dark sections, ink over light ones; hover paints a badge
              behind it and flips the mark to the opposite colour. */}
          <Link href="/" className="logo-wrap" aria-label={`${SITE.name} — home`}>
            <LogoMark className="logo-mark" />
          </Link>

          <nav className="main-nav" aria-label="Primary">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrentSection(pathname, link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            <div
              className={cn('nav-dropdown', dropdownOpen && 'open')}
              ref={dropdownRef}
              onMouseEnter={onDropdownMouseEnter}
              onMouseLeave={onDropdownMouseLeave}
            >
              <div className="nav-dropdown-wrap">
                <button
                  type="button"
                  ref={toggleRef}
                  className="nav-dropdown-toggle"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-controls={submenuId}
                  aria-current={productActive ? 'true' : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    setDropdownOpen((open) => !open);
                  }}
                  onKeyDown={onToggleKeyDown}
                >
                  PRODUCT
                  <CaretIcon />
                </button>

                <ul
                  id={submenuId}
                  ref={menuRef}
                  className="dropdown-menu"
                  onKeyDown={onMenuKeyDown}
                  style={
                    menuPosition
                      ? {
                          top: `${menuPosition.top}px`,
                          left: `${menuPosition.left}px`,
                          ['--arrow-left' as string]: `${menuPosition.arrow}px`,
                        }
                      : undefined
                  }
                >
                  {PRODUCT_NAV.map((item) => (
                    <li key={item.href}>
                      <ProductLink href={item.href} onClick={() => setDropdownOpen(false)}>
                        {item.label}
                      </ProductLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {SECONDARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrentSection(pathname, link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className={cn('nav-toggle', mobileOpen && 'active')}
            id="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={(event) => {
              event.stopPropagation();
              setMobileOpen((open) => !open);
            }}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </header>

      <div className={cn('mobile-menu', mobileOpen && 'active')} id="mobile-menu" aria-hidden={!mobileOpen}>
        <div className="mobile-menu-backdrop" id="mobile-menu-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="mobile-menu-panel">
          <div className="mobile-menu-header">
            <Link
              href="/"
              className="mobile-menu-logo"
              aria-label={`${SITE.name} — home`}
              onClick={() => setMobileOpen(false)}
            >
              <LogoMark className="logo-mark" />
            </Link>
            <button
              type="button"
              className="icon-btn mobile-menu-close"
              id="mobile-menu-close"
              aria-label="Close navigation menu"
              onClick={(event) => {
                event.stopPropagation();
                setMobileOpen(false);
              }}
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="mobile-menu-body">
            <nav className="mobile-nav-links" aria-label="Mobile">
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrentSection(pathname, link.href) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.mobileLabel}
                </Link>
              ))}

              <div className={cn('mobile-dropdown', mobileSubmenuOpen && 'open')}>
                <button
                  type="button"
                  className="mobile-dropdown-toggle"
                  aria-expanded={mobileSubmenuOpen}
                  aria-controls="mobile-products-submenu"
                  aria-current={productActive ? 'true' : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMobileSubmenuOpen((open) => !open);
                  }}
                >
                  <span>Product</span>
                  <CaretIcon />
                </button>
                <ul
                  className={cn('mobile-submenu', mobileSubmenuOpen && 'open')}
                  id="mobile-products-submenu"
                  role="menu"
                >
                  {PRODUCT_NAV.map((item) => (
                    <li role="none" key={item.href}>
                      <ProductLink href={item.href} role="menuitem" onClick={() => setMobileOpen(false)}>
                        {item.label}
                      </ProductLink>
                    </li>
                  ))}
                </ul>
              </div>

              {SECONDARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrentSection(pathname, link.href) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.mobileLabel}
                </Link>
              ))}
            </nav>

            <div className="mobile-menu-footer">
              <Link href="/contact" className="btn btn-block" onClick={() => setMobileOpen(false)}>
                Schedule a Demo <span className="btn-arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
