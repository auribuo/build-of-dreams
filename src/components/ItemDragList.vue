<template>
    <NGrid :cols="perLine ? perLine : 1" x-gap="7">
        <NGridItem class="" v-for="(item, index) in props.itemList" :key="item.id">
            <ItemCardSmall :draggable="item.remaining_pool > 0" @dragstart="onDragStart(item, index, $event)"
                @dragend="onDragEnd" :item="item">
            </ItemCardSmall>
        </NGridItem>
    </NGrid>
</template>

<script setup lang="ts">
import { NGrid, NGridItem } from 'naive-ui';
import type { Item, ItemList, ItemType } from '../models/item';
import ItemCardSmall from './ItemCardSmall.vue';

const props = defineProps<{
    itemList: ItemList | undefined,
    perLine?: number
}>()

const model = defineModel<{ item: Item<ItemType>, index: number } | undefined>({ required: false })

const onDragStart = (item: Item<ItemType>, index: number, event?: DragEvent) => {
    model.value = { item, index }
    const img = document.getElementById(`img_${item.id}`) as HTMLImageElement;
    if (img && event && event.dataTransfer) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const size = 70;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        event.dataTransfer.setDragImage(canvas, size / 2, size / 2);
    }

}

const onDragEnd = () => {
    model.value = undefined;
};
</script>