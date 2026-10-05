<script setup lang="ts">
import { loadTurnstile, type TurnstileApi } from '~/utils/turnstile';
const token = defineModel<string>({ default: '' });
const siteKey = useRuntimeConfig().public.turnstileSiteKey;
const container = ref<HTMLElement>();
const error = ref('');
let api: TurnstileApi | undefined;
let widgetId: string | undefined;
let alive = true;
function reset() {
  token.value = '';
  if (api && widgetId !== undefined) api.reset(widgetId);
}
async function render() {
  if (!siteKey) return;
  error.value = '';
  try {
    api = await loadTurnstile();
    if (!alive || !container.value) return;
    if (widgetId !== undefined) api.remove(widgetId);
    token.value = '';
    const preferred = document.documentElement.dataset.theme;
    widgetId = api.render(container.value, {
      sitekey: siteKey, action: 'newsletter', size: 'flexible',
      theme: preferred === 'dark' || preferred === 'light' ? preferred : 'auto',
      callback: (value: string) => { token.value = value; error.value = ''; },
      'expired-callback': () => { token.value = ''; },
      'error-callback': () => { token.value = ''; error.value = 'Verification could not complete. Please retry.'; },
      'timeout-callback': () => { token.value = ''; error.value = 'Verification timed out. Please retry.'; },
    });
  } catch { if (alive) error.value = 'Verification could not load. Check your connection and retry.'; }
}
onMounted(render);
onBeforeUnmount(() => { alive = false; token.value = ''; if (api && widgetId !== undefined) api.remove(widgetId); });
defineExpose({ reset });
</script>
<template>
  <div class="newsletter-verification">
    <div ref="container" />
    <p v-if="!siteKey" class="newsletter-unavailable" role="alert">Subscriptions are temporarily unavailable. Please try again later.</p>
    <div v-if="error" role="status"><p>{{ error }}</p><button type="button" class="privacy-settings-button" @click="render">Retry verification</button></div>
  </div>
</template>
