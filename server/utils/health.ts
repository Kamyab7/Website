export interface HealthConfig {
  resendApiKey: string;
  resendFrom: string;
  newsletterSecret: string;
  turnstileSecretKey: string;
  turnstileHostnames: string;
  public: { gaMeasurementId: string; turnstileSiteKey: string };
}
type Check = { status: 'ok' | 'error' | 'not_configured'; message: string };
type Request = (url: string, options: { headers?: Record<string, string>; responseType?: 'text' | 'json'; method?: 'POST'; body?: URLSearchParams }) => Promise<unknown>;
function failure(error: unknown): Check {
  const code = (error as { statusCode?: number; response?: { status?: number } })?.statusCode
    ?? (error as { response?: { status?: number } })?.response?.status;
  return { status: 'error', message: code === 401 || code === 403 ? 'Authentication or API permissions failed.' : code === 429 ? 'Provider rate limit reached.' : 'Provider request failed or timed out.' };
}
export async function checkDependencies(config: HealthConfig, request: Request) {
  const ga4 = async (): Promise<Check> => {
    const id = config.public.gaMeasurementId;
    if (!id) return { status: 'not_configured', message: 'GA4 measurement ID is not set.' };
    if (!/^G-[A-Z0-9]+$/.test(id)) return { status: 'error', message: 'GA4 measurement ID format is invalid.' };
    try {
      const script = await request(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`, { responseType: 'text' });
      if (typeof script !== 'string' || !script.trim()) return { status: 'error', message: 'Google tag returned an unexpected response.' };
      return { status: 'ok', message: 'Measurement ID format is valid and Google tag is reachable. Property ownership and event collection are not verified.' };
    } catch (error) { return failure(error); }
  };
  const resend = async (): Promise<Check> => {
    if (!config.resendApiKey || !config.resendFrom) return { status: 'not_configured', message: 'Resend API key or sender is not set.' };
    const sender = config.resendFrom.trim();
    const match = /^(?:[^<>\r\n]+<)?([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>?$/.exec(sender);
    if (!match || sender.includes('<') !== sender.endsWith('>')) return { status: 'error', message: 'NUXT_RESEND_FROM must be an email address or Name <email@verified-domain.com>, without surrounding quotes.' };
    const domain = match[1]!.split('@')[1]!.toLowerCase();
    const headers = { Authorization: `Bearer ${config.resendApiKey}` };
    try {
      const contacts = await request('https://api.resend.com/contacts?limit=1', { headers }) as { data?: unknown };
      if (!Array.isArray(contacts?.data)) return { status: 'error', message: 'Contacts API returned an unexpected response.' };
      const domains = await request('https://api.resend.com/domains?limit=100', { headers }) as { data?: { name: string; status: string; capabilities?: { sending?: string } }[]; has_more?: boolean };
      if (!Array.isArray(domains?.data)) return { status: 'error', message: 'Domains API returned an unexpected response.' };
      const senderDomain = domains.data.find(item => item.name.toLowerCase() === domain);
      if (!senderDomain) return { status: 'error', message: domains.has_more ? 'Sender domain was not found in the first 100 domains; verification is inconclusive.' : 'Sender domain is not registered in Resend.' };
      if (senderDomain.status !== 'verified' || senderDomain.capabilities?.sending === 'disabled') return { status: 'error', message: 'Sender domain is not verified for sending.' };
      return { status: 'ok', message: 'Resend authentication, Contacts access, and sender domain verification passed. Actual email delivery is not tested.' };
    } catch (error) { return failure(error); }
  };
  const turnstile = async (): Promise<Check> => {
    if (!config.public.turnstileSiteKey || !config.turnstileSecretKey || !config.turnstileHostnames.trim()) {
      return { status: 'not_configured', message: 'Turnstile site key, secret key, or hostname allowlist is not set.' };
    }
    const hostnames = config.turnstileHostnames.split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
    if (!hostnames.length || hostnames.some(host => !/^(?:localhost|[a-z0-9]+(?:[.-][a-z0-9]+)*)$/.test(host)) ||
      (process.env.NODE_ENV === 'production' && hostnames.some(host => host === 'localhost' || host === '127.0.0.1'))) {
      return { status: 'error', message: 'Turnstile hostname allowlist is invalid or contains local hostnames in production.' };
    }
    try {
      // An intentionally invalid token probes the secret without consuming a user token.
      const result = await request('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', responseType: 'json',
        body: new URLSearchParams({ secret: config.turnstileSecretKey, response: 'XXXX.DUMMY.TOKEN.XXXX' }),
      }) as { success?: boolean; 'error-codes'?: string[] };
      const codes = Array.isArray(result?.['error-codes']) ? result['error-codes'] : [];
      if (codes.includes('invalid-input-secret') || codes.includes('missing-input-secret')) {
        return { status: 'error', message: 'Turnstile secret key was rejected by Cloudflare.' };
      }
      if (result?.success !== false || codes.length !== 1 || codes[0] !== 'invalid-input-response') {
        return { status: 'error', message: 'Turnstile verification probe returned an unexpected response.' };
      }
      return { status: 'ok', message: 'Turnstile secret probe and hostname configuration passed. Site-key pairing, widget domains, and real browser verification are not verified.' };
    } catch (error) { return failure(error); }
  };
  const [ga4Check, resendCheck, turnstileCheck] = await Promise.all([ga4(), resend(), turnstile()]);
  const newsletter: Check = config.newsletterSecret.length >= 32
    ? { status: 'ok', message: 'Confirmation encryption secret is configured.' }
    : { status: config.newsletterSecret ? 'error' : 'not_configured', message: 'Confirmation encryption secret must contain at least 32 characters.' };
  const checks = { ga4: ga4Check, resend: resendCheck, newsletter, turnstile: turnstileCheck };
  return { status: Object.values(checks).every(check => check.status === 'ok') ? 'ok' as const : 'degraded' as const, checkedAt: new Date().toISOString(), checks };
}
