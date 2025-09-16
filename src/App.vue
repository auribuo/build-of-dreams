<script setup lang="ts">
import BuildView from './views/BuildView.vue';

</script>

<template>
  <Suspense>
    <BuildView></BuildView>
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
<style scoped>
.transition-colors {
  transition: background-color 0.2s, border-color 0.2s;
}
</style>