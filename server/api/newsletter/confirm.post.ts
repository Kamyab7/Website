import { newsletterConfig, resendRequest } from '../../utils/newsletter';
import { readNewsletterToken } from '../../utils/newsletter-token';

export default defineEventHandler(async (event) => {
  const config = newsletterConfig(event);
  const body = await readBody<{ token?: unknown }>(event);
  let email: string;
  try {
    if (typeof body?.token !== 'string') throw new Error();
    email = readNewsletterToken(body.token, config.newsletterSecret);
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'This confirmation link is invalid or expired. Please subscribe again.' });
  }
  const existing = await resendRequest<{ unsubscribed: boolean }>(config.resendApiKey, `/contacts/${encodeURIComponent(email)}`, { method: 'GET' });
  // Never let a replayed confirmation link override a subsequent unsubscribe.
  if (existing?.unsubscribed) {
    throw createError({ statusCode: 409, statusMessage: 'This address has unsubscribed. Contact me if you want to subscribe again.' });
  }
  if (!existing) await resendRequest(config.resendApiKey, '/contacts', { method: 'POST', body: { email, unsubscribed: false } });
  return { message: 'You’re subscribed. Future blog updates will arrive in your inbox.' };
});
