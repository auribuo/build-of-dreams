<template>
    <div
        class="min-w-[150px] min-h-[150px] rounded-sm bg-gray-950 text-teal-50 p-2 border-[1px] border-gray-700/70 flex flex-col items-center select-none">
        <div class="w-[70px] h-[70px] relative">
            <img :id="`img_${item.id}`" class="absolute rounded-lg bg-gray-800 z-0"
                :class="[item.kind === 'essence' ? 'p-2' : 'p-0.5']" draggable="false"
                :src="`/build-of-dreams/data/!Images/${item.data.image}`"></img>
            <div v-if="disabled" class="absolute w-full h-full z-10 rounded-sm bg-gray-600/40">
            </div>
        </div>
        <NTooltip trigger="hover">
            <template #trigger>
                <span class="underline decoration-dashed text-center mt-4">
                    {{ item.data.name }}
                </span>
            </template>
            <div v-html="renderedDesc"></div>
        </NTooltip>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { renderDescription, type Item } from '../models/item';
import { NTooltip } from 'naive-ui'

const props = defineProps<{
    item: Item<"essence" | "memory">
}>()

const disabled = computed(() => {
    if (props.item.remaining_pool == 0) {
        return true
    }
    return false
})

const renderedDesc = renderDescription(props.item.data.description)

</script>