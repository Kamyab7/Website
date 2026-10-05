import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../server/utils/health.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { checkDependencies } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const config = { resendApiKey: 'private-key', resendFrom: 'Kamyab <updates@example.com>', newsletterSecret: 'secret'.repeat(8), public: { gaMeasurementId: 'G-TEST123' } };
const successful = async url => url.includes('gtag/js') ? '/* google tag */' : url.includes('/contacts') ? { data: [{ email: 'private@example.com' }] } : { data: [{ name: 'example.com', status: 'verified', capabilities: { sending: 'enabled' } }] };
test('missing settings cause degraded health without contacting providers', async () => {
  const result = await checkDependencies({ resendApiKey: '', resendFrom: '', newsletterSecret: '', public: { gaMeasurementId: '' } }, () => { throw new Error('Unexpected network call'); });
  assert.equal(result.status, 'degraded');
  assert.ok(Object.values(result.checks).every(check => check.status === 'not_configured'));
});
test('healthy checks only read providers and never expose secrets or contacts', async () => {
  const calls = [];
  const result = await checkDependencies(config, async (url, options) => { calls.push({ url, options }); return successful(url); });
  assert.equal(result.status, 'ok');
  assert.equal(calls.length, 3);
  assert.ok(calls.every(({ options }) => !options.body && !options.method));
  const serialized = JSON.stringify(result);
  for (const secret of [config.resendApiKey, config.resendFrom, config.newsletterSecret, 'private@example.com']) assert.ok(!serialized.includes(secret));
});
test('provider failures are independent and sanitized', async () => {
  const result = await checkDependencies(config, async url => {
    if (url.includes('api.resend.com')) throw { statusCode: 403, message: 'private-key private@example.com' };
    return successful(url);
  });
  assert.equal(result.checks.ga4.status, 'ok');
  assert.equal(result.checks.resend.status, 'error');
  assert.match(result.checks.resend.message, /permissions/);
  assert.ok(!JSON.stringify(result).includes('private-key'));
});
test('unverified senders, bad IDs, short secrets and rate limits fail health', async () => {
  const result = await checkDependencies({ ...config, newsletterSecret: 'short', public: { gaMeasurementId: 'invalid' } }, async url => url.includes('/domains') ? { data: [{ name: 'example.com', status: 'pending' }] } : successful(url));
  assert.ok(Object.values(result.checks).every(check => check.status === 'error'));
  const limited = await checkDependencies(config, async () => { throw { statusCode: 429 }; });
  assert.match(limited.checks.resend.message, /rate limit/);
  assert.match(limited.checks.ga4.message, /rate limit/);
});

test('Google JavaScript is requested as text instead of automatic Blob decoding', async () => {
  const result = await checkDependencies(config, async (url, options) => {
    if (url.includes('gtag/js')) {
      assert.equal(options.responseType, 'text');
      return '/* Google JavaScript */';
    }
    return successful(url);
  });
  assert.equal(result.checks.ga4.status, 'ok');
});
test('sender accepts bare emails and display names and rejects invalid values', async () => {
  for (const sender of ['updates@example.com', 'Kamyab <updates@example.com>']) {
    const result = await checkDependencies({ ...config, resendFrom: sender }, successful);
    assert.equal(result.checks.resend.status, 'ok');
  }
  for (const sender of ['Kamyab', '"Kamyab <updates@example.com>"', 'updates@example.com>', 'Kamyab <updates@example.com']) {
    const result = await checkDependencies({ ...config, resendFrom: sender }, successful);
    assert.equal(result.checks.resend.status, 'error');
  }
});
