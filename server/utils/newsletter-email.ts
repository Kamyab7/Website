const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

export function confirmationEmail(confirmationUrl: string, siteUrl: string) {
  const url = escapeHtml(confirmationUrl);
  const site = escapeHtml(siteUrl);
  return {
    text: `Confirm your subscription — Kamyab Valipour\n\nNotes on software engineering, AI, and building things.\n\nConfirm that you want to receive blog updates:\n${confirmationUrl}\n\nThis link expires in one hour. You can unsubscribe from any update.\nIf you didn’t request this, ignore this email. You won’t be subscribed.\n\nKamyab Valipour\n${siteUrl}`,
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Confirm your subscription</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;color:#f1f5f9;font-family:Inter,Arial,Helvetica,sans-serif;">
  <div style="display:none;font-size:1px;line-height:1px;color:#0f172a;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">One quick confirmation, then new notes in your inbox. Link valid for one hour.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0f172a" style="background-color:#0f172a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;">
        <tr><td style="padding:0 0 24px;">
          <a href="${site}" style="color:#f1f5f9;text-decoration:none;font-size:32px;font-weight:700;letter-spacing:-2px;">kv<span style="color:#60a5fa;">.</span></a>
          <p style="margin:8px 0 0;color:#a3b1c6;font-size:12px;line-height:20px;">Kamyab Valipour · Notes &amp; ideas</p>
        </td></tr>
        <tr><td bgcolor="#172238" style="padding:32px 24px;background-color:#172238;border:1px solid #2d3b52;border-top:3px solid #60a5fa;border-radius:12px;">
          <p style="margin:0 0 18px;color:#60a5fa;font-size:11px;font-weight:600;letter-spacing:2px;line-height:18px;">STAY IN THE LOOP</p>
          <h1 style="margin:0 0 20px;color:#f1f5f9;font-size:32px;font-weight:500;letter-spacing:-1px;line-height:38px;">New notes,<br>in your inbox<span style="color:#60a5fa;">.</span></h1>
          <p style="margin:0 0 12px;color:#cbd5e1;font-size:15px;line-height:26px;">Thanks for joining. I share what I’m learning about software engineering, AI, and building things.</p>
          <p style="margin:0 0 28px;color:#cbd5e1;font-size:15px;line-height:26px;">Just confirm your email to start receiving updates.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" bgcolor="#60a5fa" style="background-color:#60a5fa;border-radius:8px;mso-padding-alt:15px 24px;">
            <a href="${url}" style="display:inline-block;padding:15px 24px;border:1px solid #60a5fa;border-radius:8px;color:#0f172a;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;">Confirm subscription&nbsp; →</a>
          </td></tr></table>
          <p style="margin:18px 0 0;color:#a3b1c6;font-size:12px;line-height:20px;">This link expires in one hour. Unsubscribe from any update.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;"><tr><td style="border-top:1px solid #2d3b52;padding-top:20px;">
            <p style="margin:0 0 8px;color:#a3b1c6;font-size:12px;line-height:20px;">Button not working? Copy this link into your browser:</p>
            <a href="${url}" style="color:#60a5fa;font-size:11px;line-height:18px;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${url}</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:24px 8px 0;">
          <p style="margin:0 0 12px;color:#a3b1c6;font-size:12px;line-height:20px;">Didn’t request this? You can ignore this email.<br>You won’t be subscribed until you confirm.</p>
          <p style="margin:0;color:#a3b1c6;font-size:12px;line-height:20px;">Kamyab Valipour &nbsp;·&nbsp; <a href="${site}/blog" style="color:#60a5fa;text-decoration:none;">Read the blog</a> &nbsp;·&nbsp; <a href="${site}/privacy#email-updates" style="color:#60a5fa;text-decoration:none;">Privacy</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
