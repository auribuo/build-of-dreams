<template>
    <NFlex class="mb-3">
        <NInput @update-value="filterItemsText" class="flex-1"></NInput>
        <NSelect @update-value="filterItemsTag" class="flex-1" :options="itemTagList" multiple></NSelect>
    </NFlex>
    <NList hoverable :clickable="true" class="select-none">
        <NListItem v-for="item in displayList" :key="item.id" :draggable="item.remaining_pool > 0"
            @dragstart="onDragStart(item, $event)" @dragend="onDragEnd">
            <NThing :class="{ 'pointer-events-none': item.remaining_pool == 0 }">
                <template #header>
                    <span :class="{ 'line-through': item.remaining_pool == 0 }">
                        {{ item.data.name }}
                    </span>
                    <span v-if="item.remaining_pool == 0" :style="{ color: theme.textColorDisabled }">
                        (Max reached)
                    </span>
                </template>
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
import { NDivider, NImage, NList, NListItem, NSelect, NSpace, NFlex, NTag, NThing, NInput, useThemeVars } from 'naive-ui';
import { renderDescription, type Item, type ItemList, type ItemType } from '../models/item';
import type { Rarity } from '../models/rarity';
import { computed, ref } from 'vue';

const props = defineProps<{
    itemList: ItemList,
    perLine?: number
}>()

const theme = useThemeVars()

const displayTagList = ref<ItemList>(props.itemList)
const displayTextList = ref<ItemList>(props.itemList)
const displayList = computed(() => {
    const set2 = new Set(displayTagList.value);
    return displayTextList.value.filter(item => set2.has(item));
})
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

const itemTagList = computed(() => {
    return [...new Set(props.itemList?.flatMap(i => i.data.tags))].map(t => { return { label: t, value: t } })
})

const filterItemsTag = (tags: string[]) => {
    if (tags.length == 0) {
        displayTagList.value = props.itemList
    } else {
        displayTagList.value = props.itemList.filter(i => i.data.tags.some(t => tags.includes(t)))
    }
}

const filterItemsText = (text: string) => {
    text = text.toLowerCase()
    displayTextList.value = props.itemList.filter(i => i.data.description.toLowerCase().includes(text) || i.data.name.toLowerCase().includes(text) || i.id.toLowerCase().includes(text))
}

</script>