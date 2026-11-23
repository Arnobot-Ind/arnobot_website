import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Replaces the PHPMailer setup shared by contact_submit.php, career_submit.php
 * and schedule_demo_submit.php.
 *
 * The PHP scripts hard-coded the Gmail account and app password in source; those
 * values now come from the environment. See .env.example.
 */
const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const MAIL_FROM = process.env.MAIL_FROM ?? 'contact@arnobot.in';
const MAIL_TO = process.env.MAIL_TO ?? 'contact@arnobot.in';

function isMailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // STARTTLS on 587, matching PHPMailer::ENCRYPTION_STARTTLS.
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER as string, pass: SMTP_PASS as string },
    });
  }
  return transporter;
}

export interface OutgoingMail {
  readonly fromName: string;
  /** Defaults to the ARNOBOT inbox (MAIL_TO). */
  readonly to?: { readonly name: string; readonly address: string };
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly replyTo?: { readonly name: string; readonly address: string };
  readonly attachments?: ReadonlyArray<{ readonly filename: string; readonly content: Buffer }>;
}

/** Resolves to the SMTP Message-ID, so a sent mail can be found again in the mailbox. */
export async function sendMail(message: OutgoingMail): Promise<string | undefined> {
  if (!isMailConfigured()) {
    throw new Error('SMTP credentials are not configured (set SMTP_USER and SMTP_PASS).');
  }

  const info = await getTransporter().sendMail({
    from: { name: message.fromName, address: MAIL_FROM },
    to: message.to ?? { name: 'ARNOBOT', address: MAIL_TO },
    replyTo: message.replyTo?.address ? message.replyTo : undefined,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: message.attachments ? [...message.attachments] : undefined,
  });
  return info.messageId;
}
