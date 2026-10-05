import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../server/utils/turnstile.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const factory = new Function('$fetch', 'createError', 'process', outputText.replace('export async function', 'async function') + '; return verifyTurnstile;');
const config = { turnstileSecretKey: 'private-secret', turnstileHostnames: 'kamyabvalipour.com' };
const make = request => factory(request, options => Object.assign(new Error(options.statusMessage), options), { env: { NODE_ENV: 'production' } });
test('missing config, local production hostnames and malformed tokens fail closed', async () => {
  const verify = make(() => { throw new Error('Unexpected provider call'); });
  for (const token of [undefined, '', ' '.repeat(10), 'x'.repeat(2049)]) await assert.rejects(verify(token, config), { statusCode: 403 });
  for (const settings of [{ ...config, turnstileSecretKey: '' }, { ...config, turnstileHostnames: '' }, { ...config, turnstileHostnames: 'kamyabvalipour.com,localhost' }]) await assert.rejects(verify('token', settings), { statusCode: 503 });
});
test('verification requires strict success, matching action and exact hostname', async () => {
  for (const response of [null, {}, { success: 'true', action: 'newsletter', hostname: 'kamyabvalipour.com' }, { success: true, action: 'login', hostname: 'kamyabvalipour.com' }, { success: true, action: 'newsletter', hostname: 'evil.kamyabvalipour.com' }, { success: false, 'error-codes': ['timeout-or-duplicate'] }]) {
    await assert.rejects(make(async () => response)('token', config), { statusCode: 403 });
  }
});
test('valid token uses only server-side Siteverify and sends correct secret', async () => {
  await make(async (url, options) => {
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(options.method, 'POST');
    assert.equal(options.body.get('secret'), config.turnstileSecretKey);
    assert.equal(options.body.get('response'), 'token');
    assert.equal(options.retry, 0);
    return { success: true, action: 'newsletter', hostname: 'kamyabvalipour.com' };
  })('token', config);
});
test('provider errors are sanitized and rejected', async () => {
  await assert.rejects(make(async () => { throw new Error('private-secret'); })('token', config), error => error.statusCode === 503 && !error.message.includes('private-secret'));
});
