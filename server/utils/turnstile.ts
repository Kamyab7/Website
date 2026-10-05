interface TurnstileConfig { turnstileSecretKey: string; turnstileHostnames: string }
interface Verification { success?: boolean; action?: string; hostname?: string }
export async function verifyTurnstile(token: unknown, config: TurnstileConfig) {
  const hostnames = config.turnstileHostnames.split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
  if (!config.turnstileSecretKey || !hostnames.length || (process.env.NODE_ENV === 'production' && hostnames.some(host => host === 'localhost' || host === '127.0.0.1'))) {
    throw createError({ statusCode: 503, statusMessage: 'Subscriptions are temporarily unavailable. Please try again later.' });
  }
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    throw createError({ statusCode: 403, statusMessage: 'Please complete the bot verification and try again.' });
  }
  let result: Verification;
  try {
    result = await $fetch<Verification>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: config.turnstileSecretKey, response: token }),
      timeout: 10000, retry: 0,
    });
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Bot verification is unavailable. Please try again.' });
  }
  if (result?.success !== true || result.action !== 'newsletter' || typeof result.hostname !== 'string' || !hostnames.includes(result.hostname.toLowerCase())) {
    throw createError({ statusCode: 403, statusMessage: 'Bot verification failed or expired. Please try again.' });
  }
}
