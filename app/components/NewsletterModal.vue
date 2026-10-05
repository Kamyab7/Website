<script setup lang="ts">
const open = useState<boolean>('newsletter-open', () => false);
const dialog = ref<HTMLDialogElement>();
const route = useRoute();
let previousOverflow = '';
let scrollLocked = false;
function unlockScroll() {
  if (!scrollLocked) return;
  document.body.style.overflow = previousOverflow;
  scrollLocked = false;
}
function close() {
  open.value = false;
}
function dismissBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value) return;
  const rect = dialog.value.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
}
onMounted(() => {
  watch(open, (value) => {
    if (value && dialog.value && !dialog.value.open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      scrollLocked = true;
      dialog.value.showModal();
    } else if (!value) {
      dialog.value?.close();
      unlockScroll();
    }
  }, { immediate: true, flush: 'post' });
});
watch(() => route.fullPath, close);
onBeforeUnmount(unlockScroll);
</script>

<template>
  <dialog ref="dialog" class="newsletter-modal" aria-labelledby="newsletter-heading" @cancel.prevent="close" @close="close" @click="dismissBackdrop">
    <button class="newsletter-close" type="button" aria-label="Close subscription form" @click="close">×</button>
    <NewsletterSignup v-if="open" />
  </dialog>
</template>
