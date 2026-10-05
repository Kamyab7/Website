import { newsletterConfig, resendRequest } from '../../utils/newsletter';
import { readNewsletterConfirmation } from '../../utils/newsletter-token';

export default defineEventHandler(async (event) => {
  const config = newsletterConfig(event);
  const body = await readBody<{ token?: unknown }>(event);
  let email: string;
  let resubscribeContactId: string | undefined;
  try {
    if (typeof body?.token !== 'string') throw new Error();
    ({ email, resubscribeContactId } = readNewsletterConfirmation(body.token, config.newsletterSecret));
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'This confirmation link is invalid or expired. Please subscribe again.' });
  }
  const contactPath = `/contacts/${encodeURIComponent(email)}`;
  const existing = await resendRequest<{ id: string; unsubscribed: boolean }>(config.resendApiKey, contactPath, { method: 'GET' });
  // Original signup links cannot reactivate an unsubscribed contact.
  // Resubscription links are authenticated and bound to the existing contact ID.
  if ((existing?.unsubscribed && (!resubscribeContactId || resubscribeContactId !== existing.id)) || (resubscribeContactId && resubscribeContactId !== existing?.id)) {
    throw createError({ statusCode: 409, statusMessage: 'Please subscribe again to request a fresh confirmation email.' });
  }
  if (existing && resubscribeContactId) {
    // Restore segment membership before opting in, so a provider failure is retryable.
    if (config.resendSegmentId) await resendRequest(config.resendApiKey, `${contactPath}/segments/${encodeURIComponent(config.resendSegmentId)}`, { method: 'POST' });
    if (existing.unsubscribed) await resendRequest(config.resendApiKey, contactPath, { method: 'PATCH', body: { unsubscribed: false } });
  }
  if (!existing) await resendRequest(config.resendApiKey, '/contacts', { method: 'POST', body: {
    email, unsubscribed: false,
    ...(config.resendSegmentId ? { segments: [{ id: config.resendSegmentId }] } : {}),
  } });
  return { message: 'You’re subscribed. Future blog updates will arrive in your inbox.' };
});
