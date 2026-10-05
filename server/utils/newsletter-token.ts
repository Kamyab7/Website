import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const key = (secret: string) => createHash('sha256').update(secret).digest();
export function newsletterToken(email: string, secret: string, now = Date.now(), resubscribeContactId?: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify({ email, expires: now + 3600000, resubscribeContactId })), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}
export function readNewsletterToken(token: string, secret: string, now = Date.now()): string {
  return readNewsletterConfirmation(token, secret, now).email;
}
export function readNewsletterConfirmation(token: string, secret: string, now = Date.now()): { email: string; resubscribeContactId?: string } {
  if (!/^[\w-]{40,1024}$/.test(token)) throw new Error('Invalid token');
  const bytes = Buffer.from(token, 'base64url');
  const cipher = createDecipheriv('aes-256-gcm', key(secret), bytes.subarray(0, 12));
  cipher.setAuthTag(bytes.subarray(12, 28));
  const payload = JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString());
  if (typeof payload.email !== 'string' || !Number.isFinite(payload.expires) || payload.expires <= now || payload.expires > now + 3600000) throw new Error('Expired token');
  if (payload.resubscribeContactId !== undefined && (typeof payload.resubscribeContactId !== 'string' || !payload.resubscribeContactId)) throw new Error('Invalid contact');
  return { email: payload.email, resubscribeContactId: payload.resubscribeContactId };
}
