<script setup lang="ts">
import { THEME_STORAGE_KEY, normalizeTheme, type ThemeMode } from '#shared/theme';
const mode = ref<ThemeMode>('system');
const picker = ref<HTMLDetailsElement>();
const options: { value: ThemeMode; title: string; description: string }[] = [
  { value: 'system', title: 'System', description: 'Match your device’s light or dark setting.' },
  { value: 'light', title: 'Light', description: 'Always use a light appearance.' },
  { value: 'dark', title: 'Dark', description: 'Always use a dark appearance.' },
];
const currentTitle = computed(() => options.find(option => option.value === mode.value)!.title);
function close(restoreFocus = false) {
  if (!picker.value?.open) return;
  picker.value.open = false;
  if (restoreFocus) picker.value.querySelector('summary')?.focus();
}
function onPointerDown(event: PointerEvent) {
  if (event.target instanceof Node && !picker.value?.contains(event.target)) close();
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && picker.value?.open) {
    event.preventDefault();
    close(true);
  }
}
function apply(value: unknown) {
  mode.value = normalizeTheme(value);
  document.documentElement.dataset.theme = mode.value;
}
function choose(value: ThemeMode) {
  apply(value);
  try { localStorage.setItem(THEME_STORAGE_KEY, mode.value); } catch { /* Keep the preference for this visit when storage is unavailable. */ }
  close(true);
}
function syncStorage(event: StorageEvent) {
  if (event.key === THEME_STORAGE_KEY || event.key === null) apply(event.newValue);
}
onMounted(() => {
  apply(document.documentElement.dataset.theme);
  window.addEventListener('storage', syncStorage);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('storage', syncStorage);
  window.removeEventListener('pointerdown', onPointerDown);
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <details ref="picker" class="theme-picker">
  <summary class="blog-link theme-toggle" :aria-label="`Appearance: ${currentTitle}. Choose theme`" title="Choose appearance">
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
    <span>{{ currentTitle }}</span>
    <svg class="theme-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
  </summary>
  <fieldset class="theme-panel">
    <legend class="sr-only">Appearance</legend>
    <p class="theme-panel-title" aria-hidden="true">Appearance</p>
    <label v-for="option in options" :key="option.value" class="theme-option" :class="{ 'is-selected': mode === option.value }">
      <input type="radio" name="site-theme" :value="option.value" :checked="mode === option.value" @change="choose(option.value)" />
      <span><strong>{{ option.title }}<small v-if="option.value === 'system'">Default</small></strong><span class="theme-description">{{ option.description }}</span></span>
    </label>
  </fieldset>
  </details>
</template>
