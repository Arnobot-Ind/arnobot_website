export interface EmailRow {
  readonly label: string;
  readonly value: string;
  /** Long free-text values are top-aligned and keep their line height. */
  readonly multiline?: boolean;
}

// The old nites.in host returns 404; the logo is served from the site itself now.
const LOGO_URL = process.env.MAIL_LOGO_URL ?? 'https://arnobot.in/assets/logos/logo-white.png';

function renderRow({ label, value, multiline }: EmailRow, isLast: boolean): string {
  const border = isLast ? '' : 'border-bottom:1px solid #eeeeee;';
  return `
<tr>
  <td style="padding:13px 10px;width:35%;color:#11113d;${border}${multiline ? 'vertical-align:top;' : ''}">
    <strong>${label}</strong>
  </td>
  <td style="padding:13px 10px;color:#555555;${border}${multiline ? 'line-height:1.6;' : ''}">
    ${value}
  </td>
</tr>`;
}

/**
 * The branded shell used by the contact and career notifications — the markup
 * that contact_submit.php spelled out inline, shared by both templates.
 */
export function renderEmailLayout(options: {
  readonly title: string;
  readonly heading: string;
  readonly rows: readonly EmailRow[];
  readonly footnote: string;
}): string {
  const { title, heading, rows, footnote } = options;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:35px 15px;">
<tr><td align="center">
<table width="700" cellpadding="0" cellspacing="0" style="max-width:700px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 5px 25px rgba(0,0,0,0.08);">

<tr>
<td style="background:#08082d;padding:30px;text-align:center;">
  <img src="${LOGO_URL}" alt="ARNOBOT" style="max-width:190px;width:auto;height:auto;margin-bottom:18px;">
  <h1 style="margin:0;color:#ffffff;font-size:25px;font-weight:700;">${heading}</h1>
  <p style="margin:8px 0 0;color:#c8c8d8;font-size:14px;">ARNOBOT Website</p>
</td>
</tr>

<tr>
<td style="padding:35px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
${rows.map((row, i) => renderRow(row, i === rows.length - 1)).join('')}
</table>
</td>
</tr>

<tr>
<td style="background:#f7f7f9;padding:20px;text-align:center;color:#777777;font-size:13px;">
  ${footnote}
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Plain-text alternative built from the same rows. */
export function renderEmailText(heading: string, rows: readonly EmailRow[]): string {
  return `${heading}\n\n${rows.map((row) => `${row.label}: ${row.value}`).join('\n')}`;
}

/**
 * A branded letter to a person (e.g. a candidate): the same navy header with
 * the ARNOBOT logo as the notifications, then free-form body text.
 * `bodyHtml` must already be escaped.
 */
export function renderLetter(options: { readonly title: string; readonly bodyHtml: string }): string {
  const { title, bodyHtml } = options;
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:35px 15px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 5px 25px rgba(0,0,0,0.08);">

<tr>
<td style="background:#08082d;padding:28px 30px;text-align:center;">
  <img src="${LOGO_URL}" alt="ARNOBOT" style="max-width:180px;width:auto;height:auto;">
</td>
</tr>

<tr>
<td style="padding:34px 34px 28px;color:#222222;font-size:15px;line-height:1.7;">
  ${bodyHtml}
</td>
</tr>

<tr>
<td style="background:#f7f7f9;padding:20px;text-align:center;color:#777777;font-size:12px;line-height:1.6;">
  ARNOBOT Private Limited &middot; <a href="https://arnobot.in" style="color:#555555;">arnobot.in</a> &middot; <a href="mailto:contact@arnobot.in" style="color:#555555;">contact@arnobot.in</a>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
