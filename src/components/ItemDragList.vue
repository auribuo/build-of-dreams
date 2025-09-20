<template>
    <NList hoverable :clickable="true" class="select-none">
        <NListItem v-for="item in props.itemList" :key="item.id" :draggable="item.remaining_pool > 0"
            @dragstart="onDragStart(item, $event)" @dragend="onDragEnd">
            <NThing :title="item.data.name">
                <template #description>
                    <NSpace size="small">
                        <NTag :bordered="false" size="small" :type="rarityColor(item.data.rarity)">
                            {{ item.data.rarity }}
                        </NTag>
                        <NDivider v-if="item.data.tags.length > 0" vertical></NDivider>
                        <NTag v-for="tag in item.data.tags" round size="small">
                            {{ tag }}
                        </NTag>
                    </NSpace>
                </template>
                <div class="flex items-start w-full">
                    <NImage width="40" height="40" preview-disabled lazy
                        :src="`/build-of-dreams/data/!Images/${item.data.image}`" :id="`img_${item.id}`"
                        draggable="false" class="rounded-lg z-0 object-cover"
                        :class="{ 'opacity-30 pointer-events-none select-none': item.remaining_pool == 0 }">
                    </NImage>
                    <div class="flex-1 ml-3" v-html="renderDescription(item.data.description)">
                    </div>
                </div>
            </NThing>
        </NListItem>
    </NList>
</template>

<script setup lang="ts">
import { NDivider, NImage, NList, NListItem, NSpace, NTag, NThing } from 'naive-ui';
import { renderDescription, type Item, type ItemList, type ItemType } from '../models/item';
import type { Rarity } from '../models/rarity';

const props = defineProps<{
    itemList: ItemList | undefined,
    perLine?: number
}>()

const model = defineModel<Item<ItemType> | undefined>({ required: false })

const rarityColor = (rarity: Rarity): "default" | "success" | "warning" | "error" | "info" => {
    switch (rarity) {
        case 'Common':
            return "default"
        case 'Rare':
            return "info"
        case 'Epic':
            return "default"
        case 'Legendary':
            return "error"
        case 'Unique':
        case 'Character':
        case 'Identity':
            return "warning"
    }
}

const onDragStart = (item: Item<ItemType>, event?: DragEvent) => {
    model.value = item
    const img = document.getElementById(`img_${item.id}`)?.firstElementChild as HTMLImageElement;
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