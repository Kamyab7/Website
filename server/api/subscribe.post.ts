import { SITE_URL } from '../../shared/site';
import { newsletterConfig, resendRequest } from '../utils/newsletter';
import { newsletterToken } from '../utils/newsletter-token';

export default defineEventHandler(async (event) => {
  const config = newsletterConfig(event);
  const body = await readBody<{ email?: unknown; website?: unknown; consent?: unknown }>(event);
  if (body?.website) return { message: 'Check your inbox to confirm your subscription.' };
  if (body?.consent !== true || typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(body.email.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid email and agree to receive updates.' });
  }
  const email = body.email.trim().toLowerCase();
  const token = newsletterToken(email, config.newsletterSecret);
  // Fragment keeps the token out of server access logs and referrer URLs.
  const url = `${SITE_URL}/subscribe#${token}`;
  await resendRequest(config.resendApiKey, '/emails', { method: 'POST', body: {
    from: config.resendFrom, to: [email], subject: 'Confirm your subscription — Kamyab Valipour',
    text: `Confirm that you want to receive blog updates from Kamyab Valipour:\n\n${url}\n\nThis link expires in one hour. If you did not request this, ignore this email.`,
  } });
  return { message: 'Check your inbox to confirm your subscription. The link expires in one hour.' };
});
