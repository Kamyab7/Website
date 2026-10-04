<script setup lang="ts">
definePageMeta({ key: route => route.path, validate: route => /^[1-9]\d*$/.test(String(route.params.page)) });
const page = Number(useRoute().params.page);
if (page === 1) await navigateTo('/blog', { redirectCode: 301 });
</script>
<template><BlogListing :page="page" /></template>
