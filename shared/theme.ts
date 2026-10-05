export const THEME_STORAGE_KEY = 'kv-theme';
export type ThemeMode = 'system' | 'light' | 'dark';
export const normalizeTheme = (value: unknown): ThemeMode => value === 'light' || value === 'dark' ? value : 'system';

// Runs before the stylesheet paints so a saved preference does not flash the wrong theme.
export const themeInitScript = `(() => {
  let mode = 'system';
  try {
    const saved = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (saved === 'light' || saved === 'dark') mode = saved;
  } catch {}
  document.documentElement.dataset.theme = mode;
})();`;
