<script setup lang="ts">
import { THEME_STORAGE_KEY, normalizeTheme, type ThemeMode } from '#shared/theme';
const mode = ref<ThemeMode>('system');
const modes: ThemeMode[] = ['system', 'light', 'dark'];
const nextMode = computed(() => modes[(modes.indexOf(mode.value) + 1) % modes.length]!);
const label = computed(() => `Theme: ${mode.value}. Switch to ${nextMode.value} theme`);
function apply(value: unknown) {
  mode.value = normalizeTheme(value);
  document.documentElement.dataset.theme = mode.value;
}
function cycle() {
  apply(nextMode.value);
  try { localStorage.setItem(THEME_STORAGE_KEY, mode.value); } catch { /* Keep the preference for this visit when storage is unavailable. */ }
}
function syncStorage(event: StorageEvent) {
  if (event.key === THEME_STORAGE_KEY || event.key === null) apply(event.newValue);
}
onMounted(() => {
  apply(document.documentElement.dataset.theme);
  window.addEventListener('storage', syncStorage);
});
onBeforeUnmount(() => window.removeEventListener('storage', syncStorage));
</script>

<template>
  <button class="blog-link theme-toggle" type="button" :aria-label="label" :title="label" @click="cycle">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <template v-if="mode === 'system'">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </template>
      <template v-else-if="mode === 'light'">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
      </template>
      <path v-else d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
    </svg>
    <span class="sr-only" aria-live="polite">{{ mode }} theme</span>
  </button>
</template>
