import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('../shared/theme.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { themeInitScript, normalizeTheme, THEME_STORAGE_KEY } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
test('initial theme defaults to system and restores only supported preferences before hydration', () => {
  for (const saved of [null, 'system', 'light', 'dark', 'invalid']) {
    const document = { documentElement: { dataset: {} } };
    runInNewContext(themeInitScript, { document, localStorage: { getItem(key) { assert.equal(key, THEME_STORAGE_KEY); return saved; } } });
    assert.equal(document.documentElement.dataset.theme, normalizeTheme(saved));
  }
});
test('blocked storage still allows system rendering', () => {
  const document = { documentElement: { dataset: {} } };
  runInNewContext(themeInitScript, { document, localStorage: { getItem() { throw new Error('blocked'); } } });
  assert.equal(document.documentElement.dataset.theme, 'system');
});
