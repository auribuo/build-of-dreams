<script setup lang="ts">
import { darkTheme, NConfigProvider, NGlobalStyle, NMessageProvider, type GlobalThemeOverrides } from 'naive-ui';
import BuildView from './views/BuildView.vue';
import { computed, ref } from 'vue';

const primary = ref<string>("#F55A13")

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  return {
    common: {
      primaryColor: primary.value,
      primaryColorHover: lighten(primary.value, .3),
      primaryColorPressed: lighten(primary.value, .6)
    }
  }
})
function lighten(hex: string, amount: number) {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }

  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.round(r + (255 - r) * amount);
  g = Math.round(g + (255 - g) * amount);
  b = Math.round(b + (255 - b) * amount);

  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
</script>

<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <NMessageProvider placement="bottom">
      <NGlobalStyle></NGlobalStyle>
      <main>
        <Suspense>
          <BuildView @character-change="t => primary = t.data.color"></BuildView>
          <template #fallback>
            Loading...
          </template>
        </Suspense>
      </main>
    </NMessageProvider>
  </NConfigProvider>
</template>