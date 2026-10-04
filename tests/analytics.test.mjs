import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../app/utils/analytics.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { createAnalytics } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
function browser() {
  const scripts = [];
  const cookies = [];
  const document = {
    title: 'Test page',
    createElement: () => ({}),
    head: { appendChild: script => scripts.push(script) },
    get cookie() { return '_ga=abc; _ga_TEST123=def; preference=keep'; },
    set cookie(value) { cookies.push(value); },
  };
  return { scripts, cookies, window: { document, location: { origin: 'https://example.com', hostname: 'example.com', pathname: '/blog' } } };
}
test('blank and invalid IDs never load analytics even after acceptance', () => {
  for (const id of ['', 'invalid']) {
    const b = browser();
    const ga = createAnalytics(b.window, id);
    ga.enable(); ga.trackPage();
    assert.equal(b.scripts.length, 0);
    assert.equal(b.window.dataLayer, undefined);
  }
});
test('analytics requires consent, loads once, and tracks navigation without duplicates', () => {
  const b = browser();
  const ga = createAnalytics(b.window, 'G-TEST123');
  ga.trackPage(); ga.disable();
  assert.equal(b.scripts.length, 0);
  assert.equal(b.window.dataLayer, undefined);
  ga.enable(); ga.enable(); ga.trackPage();
  assert.equal(b.scripts.length, 1);
  const events = () => b.window.dataLayer.map(args => Array.from(args)).filter(args => args[0] === 'event');
  assert.equal(events().length, 1);
  b.window.location.pathname = '/blog/article'; ga.trackPage();
  assert.equal(events().length, 2);
  assert.equal(events()[1][2].page_location, 'https://example.com/blog/article');
  ga.disable();
  assert.equal(b.window['ga-disable-G-TEST123'], true);
  ga.trackPage(); assert.equal(events().length, 2);
  assert.ok(b.cookies.some(cookie => cookie.startsWith('_ga=')));
  assert.ok(!b.cookies.some(cookie => cookie.startsWith('preference=')));
  ga.enable();
  assert.equal(b.window['ga-disable-G-TEST123'], false);
  assert.equal(b.scripts.length, 1);
  const consent = b.window.dataLayer.map(args => Array.from(args)).filter(args => args[0] === 'consent');
  assert.ok(consent.every(args => args[2].ad_storage === 'denied' && args[2].ad_user_data === 'denied' && args[2].ad_personalization === 'denied'));
});
