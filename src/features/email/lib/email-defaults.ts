/**
 * Wrap email body HTML in a simple responsive container.
 * Keeps things consistent without a full template builder.
 */
export function wrapEmailHtml(
  bodyHtml: string,
  options?: {
    preheader?: string;
    unsubscribeUrl?: string;
    businessName?: string;
  },
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
  ${options?.preheader ? `<span style="display:none;max-height:0;overflow:hidden">${options.preheader}</span>` : ""}
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .content { padding: 32px 24px; }
    .content p { margin: 0 0 16px; line-height: 1.6; color: #18181b; font-size: 15px; }
    .content a { color: #0d9488; }
    .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #a1a1aa; }
    .footer a { color: #a1a1aa; }
    @media (max-width: 640px) {
      .content { padding: 24px 16px; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
          <tr>
            <td class="content">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td class="footer">
              ${options?.businessName ? `<p>${options.businessName}</p>` : ""}
              ${options?.unsubscribeUrl ? `<p><a href="${options.unsubscribeUrl}">Unsubscribe</a></p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Strip HTML tags for plain text fallback.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
