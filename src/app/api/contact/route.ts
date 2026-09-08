import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/email/transport';
import { contactEmail } from '@/lib/email/messages';
import { field, hasAll, isValidEmail } from '@/lib/validation';

export const runtime = 'nodejs';

function back(request: Request, query: string): NextResponse {
  return NextResponse.redirect(new URL(`/contact${query}`, request.url), 303);
}

/** Port of contact_submit.php */
export async function POST(request: Request): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return back(request, '?error=required');
  }

  const submission = {
    firstName: field(formData, 'fname'),
    lastName: field(formData, 'lname'),
    email: field(formData, 'email'),
    phone: field(formData, 'phone'),
    job: field(formData, 'job'),
    country: field(formData, 'country'),
    purpose: field(formData, 'purpose'),
    message: field(formData, 'message'),
  };

  if (
    !hasAll([submission.firstName, submission.lastName, submission.email, submission.job, submission.message])
  ) {
    return back(request, '?error=required');
  }

  if (!isValidEmail(submission.email)) {
    return back(request, '?error=email');
  }

  /* The honeypot. `website` is off-screen and aria-hidden in the form, so only
     a bot filling every field will have set it. Answer exactly as a success
     would, and send nothing — telling a spammer which check caught them is how
     they tune around it.

     This replaced reCAPTCHA, whose site key was registered to `arnobot.in`
     alone and so failed closed on every other deploy host. */
  if (field(formData, 'website')) {
    return back(request, '?success=1');
  }

  try {
    const { html, text } = contactEmail(submission);
    await sendMail({
      fromName: 'ARNOBOT Website',
      subject: 'New Contact Inquiry - ARNOBOT',
      html,
      text,
      replyTo: { name: `${submission.firstName} ${submission.lastName}`, address: submission.email },
    });
    return back(request, '?success=1');
  } catch (error) {
    console.error('[contact] mail error:', error);
    return back(request, '?error=mail');
  }
}

export function GET(request: Request): NextResponse {
  return NextResponse.redirect(new URL('/contact', request.url));
}
