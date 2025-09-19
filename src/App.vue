<script setup lang="ts">
import { darkTheme, NConfigProvider, NGlobalStyle } from 'naive-ui';
import BuildView from './views/BuildView.vue';
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <NGlobalStyle></NGlobalStyle>
    <main>
      <Suspense>
        <BuildView></BuildView>
        <template #fallback>
          Loading...
        </template>
      </Suspense>
    </main>
  </NConfigProvider>
</template>