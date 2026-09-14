import { Fragment } from 'react';
import Link from 'next/link';
import { FOOTER_NAV, HQ_ADDRESS_LINES, SITE, SOCIAL_LINKS } from '@/data/site';
import { MailIcon, PhoneIcon, PinIcon } from '@/components/ui/Icons';
import ProductLink from '@/components/ui/ProductLink';

function LinkColumn({ heading, links }: (typeof FOOTER_NAV)[number]) {
  return (
    <div>
      <h4>{heading}</h4>
      <ul className="footer-links">
        {links.map((link) => {
          // The Products column: see ProductLink for why those do not prefetch.
          const Anchor = link.href.startsWith('/product') ? ProductLink : Link;
          return (
            <li key={link.href}>
              <Anchor href={link.href}>{link.label}</Anchor>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Port of the footer in includes/footer.php. */
export default function Footer() {
  const [products, company, quickLinks] = FOOTER_NAV;

  return (
    <footer className="footer" id="site-footer" data-header-theme="dark">
      {/* Five columns on a single row; the last stacks Quick Links over Connect. */}
      <div className="footer-grid">
        <div className="footer-brand">
          <img className="footer-logo" src="/assets/logos/logo-white.png" alt={SITE.name} />
          <p className="footer-tagline">{SITE.tagline}</p>
        </div>

        {products ? <LinkColumn {...products} /> : null}
        {company ? <LinkColumn {...company} /> : null}

        <div>
          <h4>Get in Touch</h4>
          <ul className="footer-contact">
            <li>
              <PhoneIcon size={18} aria-hidden="true" />
              <a href={`tel:${SITE.phone.replace(/\s+/g, '')}`}>{SITE.phone}</a>
            </li>
            <li>
              <MailIcon size={18} aria-hidden="true" />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <PinIcon size={18} aria-hidden="true" />
              {/* Broken on its authored lines rather than left to wrap: the
                  column is content-sized, so each line stays whole. */}
              <span className="footer-address">
                {HQ_ADDRESS_LINES.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </Fragment>
                ))}
              </span>
            </li>
          </ul>
        </div>

        {/* Column 5: Quick Links above, Connect below. */}
        <div className="footer-col">
          {quickLinks ? <LinkColumn {...quickLinks} /> : null}
          <div>
            <h4>Connect</h4>
            <div className="socials">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  /* Profiles on someone else's domain: no referrer, and no
                     handle on this window from the tab that opens. */
                  rel="noreferrer noopener"
                >
                  <img src={social.icon} alt={social.label} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{SITE.copyright}</p>
        <p>MADE IN INDIA</p>
      </div>
    </footer>
  );
}
