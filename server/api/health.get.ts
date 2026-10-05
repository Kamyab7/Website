import { createHash } from 'node:crypto';
import { checkDependencies, type HealthConfig } from '../utils/health';

// Cache only the sanitized report. Hash config so credential changes invalidate it.
const cachedCheck = defineCachedFunction(
  (config: HealthConfig) => checkDependencies(config, (url, options) => $fetch(url, { ...options, timeout: 5000, retry: 0 })),
  { name: 'dependency-health', maxAge: 60, swr: false,
    getKey: (config: HealthConfig) => createHash('sha256').update(JSON.stringify(config)).digest('hex') },
);
export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'no-store');
  setResponseHeader(event, 'X-Robots-Tag', 'noindex');
  const runtime = useRuntimeConfig(event);
  const report = await cachedCheck({ resendApiKey: runtime.resendApiKey, resendFrom: runtime.resendFrom,
    newsletterSecret: runtime.newsletterSecret, turnstileSecretKey: runtime.turnstileSecretKey,
    turnstileHostnames: runtime.turnstileHostnames,
    public: { gaMeasurementId: runtime.public.gaMeasurementId, turnstileSiteKey: runtime.public.turnstileSiteKey } });
  setResponseStatus(event, report.status === 'ok' ? 200 : 503);
  return report;
});
