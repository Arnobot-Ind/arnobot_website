'use client';

import { useState } from 'react';

const INQUIRY_OPTIONS = [
  'Schedule a Consultation',
  'Request a Demo',
  'Book Site Assessment',
  'Partnership / Distribution',
  'Defence Procurement',
  'General Inquiry',
] as const;

/**
 * Contact form — the fields of the form in contact.php, dressed in the
 * site-wide `.form-*` classes from public/assets/css/style.css.
 *
 * It performs a real POST (to /api/contact) which redirects back to
 * /contact?success=1 or ?error=…, so it keeps working without JavaScript. The
 * inquiry router is a radio group rather than a <select> for the same reason:
 * every route is visible, and `:checked` needs no script.
 *
 * There is no reCAPTCHA. The key was registered against `arnobot.in` alone, so
 * on any other host — a Netlify deploy preview, the staging domain — the widget
 * rendered "ERROR for site owner: Invalid domain for site key" and the form
 * could not be submitted at all. Spam is now held off by the honeypot below;
 * if reCAPTCHA comes back, add every deploy domain to the key first.
 */
export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  /* The submit is a real form POST, so this only puts the button into its
     sending state — the navigation itself is the browser's. */
  const onSubmit = () => setSubmitting(true);

  return (
    <>
      <form className="form" id="contact-form" action="/api/contact" method="POST" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="cf-fname">
              First Name <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="cf-fname"
              name="fname"
              autoComplete="given-name"
              placeholder="Ananya"
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="cf-lname">
              Last Name <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="cf-lname"
              name="lname"
              autoComplete="family-name"
              placeholder="Sharma"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="cf-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="email"
              id="cf-email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="cf-phone">
              Phone Number <span className="optional">(optional)</span>
            </label>
            <input
              className="form-input"
              type="tel"
              id="cf-phone"
              name="phone"
              autoComplete="tel"
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="cf-job">
              Designation <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="cf-job"
              name="job"
              autoComplete="organization-title"
              placeholder="Head of Operations, Acme Energy"
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="cf-country">
              Country <span className="optional">(optional)</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="cf-country"
              name="country"
              autoComplete="country-name"
              placeholder="India"
            />
          </div>
        </div>

        <fieldset className="form-field">
          <legend className="form-legend">What is this about?</legend>
          <div className="chips">
            {INQUIRY_OPTIONS.map((option, index) => (
              <label className="chip" key={option}>
                <input
                  type="radio"
                  id={`cf-purpose-${index}`}
                  name="purpose"
                  value={option}
                  defaultChecked={index === 0}
                  required
                />
                <span className="chip-label">{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-field">
          <label className="form-label" htmlFor="cf-message">
            Message <span className="required">*</span>
          </label>
          <textarea
            className="form-input"
            id="cf-message"
            name="message"
            rows={4}
            placeholder="Where the robot would work, what it would do, and the timeline you have in mind."
            required
          />
        </div>

        {/* Honeypot. `sr-only` takes it off the screen without `display: none`,
            which some bots skip, and `aria-hidden` plus `tabIndex={-1}` keep it
            out of the accessibility tree and the tab order so a person never
            meets it. A bot that fills every field fills this one, and
            /api/contact then drops the submission. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="cf-website">Website</label>
          <input type="text" id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" id="contact-submit-btn" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              'Sending…'
            ) : (
              <>
                Send Message{' '}
                <span className="btn-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </>
            )}
          </button>

          <p className="form-note">We respect your privacy. Your information is never shared.</p>
        </div>
      </form>
    </>
  );
}
