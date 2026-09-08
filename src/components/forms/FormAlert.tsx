import type { ReactNode } from 'react';

const ERROR_MESSAGES: Readonly<Record<string, { readonly title: string; readonly body: string }>> = {
  // No `captcha` entry: the contact form no longer carries a reCAPTCHA, so
  // nothing can redirect back with `?error=captcha`. An old link that still
  // carries it falls through to FALLBACK_ERROR.
  required: { title: 'Required Fields Missing', body: 'Please fill in all required fields.' },
  email: { title: 'Invalid Email Address', body: 'Please enter a valid email address.' },
  // Returned by /api/career only — the resume is the one field the browser
  // cannot fully validate before the POST.
  resume: { title: 'Resume Missing', body: 'Please attach your resume before submitting.' },
  resume_size: { title: 'Resume Too Large', body: 'Resume files must be under 5 MB. Please attach a smaller file.' },
  resume_type: { title: 'Unsupported Resume Format', body: 'Please attach a PDF or Word document (.pdf, .doc, .docx).' },
  mail: { title: 'Delivery Failed', body: 'We could not send your application. Please try again in a moment.' },
};

const FALLBACK_ERROR = { title: 'Something went wrong', body: 'Please try again later.' } as const;

interface FormAlertProps {
  readonly success?: string | string[] | undefined;
  readonly error?: string | string[] | undefined;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The `?success` / `?error` notice both contact.php and career.php rendered
 * above their forms, after the submit handler redirected back.
 */
export default function FormAlert({ success, error }: FormAlertProps): ReactNode {
  if (first(success) !== undefined) {
    return (
      <div className="form-alert form-alert-success" role="status" aria-live="polite">
        <span aria-hidden="true">✓</span>
        <div>
          <strong>Message Sent Successfully!</strong>
          <p>Thank you for contacting ARNOBOT. Our team will get back to you soon.</p>
        </div>
      </div>
    );
  }

  const code = first(error);
  if (code === undefined) return null;

  const message = ERROR_MESSAGES[code] ?? FALLBACK_ERROR;

  return (
    <div className="form-alert form-alert-error" role="alert">
      <span aria-hidden="true">!</span>
      <div>
        <strong>{message.title}</strong>
        <p>{message.body}</p>
      </div>
    </div>
  );
}
