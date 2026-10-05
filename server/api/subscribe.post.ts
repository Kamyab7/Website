import { SITE_URL } from '../../shared/site';
import { newsletterConfig, resendRequest } from '../utils/newsletter';
import { newsletterToken } from '../utils/newsletter-token';
import { verifyTurnstile } from '../utils/turnstile';
import { confirmationEmail } from '../utils/newsletter-email';

export default defineEventHandler(async (event) => {
  const config = newsletterConfig(event);
  const body = await readBody<{ email?: unknown; website?: unknown; consent?: unknown; turnstileToken?: unknown; theme?: unknown }>(event);
  if (body?.website) return { message: 'Check your inbox to confirm your subscription.' };
  if (body?.consent !== true || typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(body.email.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid email and agree to receive updates.' });
  }
  await verifyTurnstile(body.turnstileToken, config);
  const email = body.email.trim().toLowerCase();
  const response = { message: 'If this address is eligible, check your inbox for a confirmation link valid for one hour. Already subscribed? You’re all set.' };
  const existing = await resendRequest<{ unsubscribed: boolean }>(config.resendApiKey, `/contacts/${encodeURIComponent(email)}`, { method: 'GET' });
  // Preserve unsubscribe choices and avoid emailing existing subscribers again.
  // A provider failure must stop the request; only an actual 404 means absent.
  if (existing) return response;
  const token = newsletterToken(email, config.newsletterSecret);
  // Fragment keeps the token out of server access logs and referrer URLs.
  const url = `${SITE_URL}/subscribe#${token}`;
  await resendRequest(config.resendApiKey, '/emails', { method: 'POST', body: {
    from: config.resendFrom, to: [email], subject: 'Confirm your subscription — Kamyab Valipour',
    ...confirmationEmail(url, SITE_URL, body.theme === 'light' ? 'light' : 'dark'),
  } });
  return response;
});
