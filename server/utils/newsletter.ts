import type { H3Event } from 'h3';
import { SITE_URL } from '../../shared/site';

export function newsletterConfig(event: H3Event) {
  setResponseHeader(event, 'Cache-Control', 'no-store');
  const origin = getHeader(event, 'origin');
  if (origin && origin !== getRequestURL(event).origin && origin !== SITE_URL) {
    throw createError({ statusCode: 403, statusMessage: 'Request not allowed' });
  }
  const config = useRuntimeConfig(event);
  if (!config.resendApiKey || !config.resendFrom || config.newsletterSecret.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Email subscriptions are not available yet. Please try again later.' });
  }
  return config;
}
export async function resendRequest<T>(apiKey: string, path: string, options: { method: 'GET' | 'POST' | 'PATCH'; body?: Record<string, unknown>; headers?: Record<string, string> }) {
  try {
    return await $fetch<T>(`https://api.resend.com${path}`, {
      ...options, headers: { Authorization: `Bearer ${apiKey}`, ...options.headers }, timeout: 10000, retry: 0,
    });
  } catch (error) {
    // Do not log provider errors: they can contain recipient data and request headers.
    const status = (error as { statusCode?: number; response?: { status?: number } }).statusCode
      ?? (error as { response?: { status?: number } }).response?.status;
    if (options.method === 'GET' && path.startsWith('/contacts/') && status === 404) return null;
    throw createError({ statusCode: 502, statusMessage: 'The email service is unavailable. Please try again later.' });
  }
}
