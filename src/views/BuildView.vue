<template>
    <div class="p-6 space-y-6">
        <div id="memoryList" class="p-4 border-2 rounded-lg flex space-x-3 overflow-x-auto">
            <div v-for="(item, index) in memoryList" :key="item.id"
                class="p-2 border-2 bg-gray-200 select-none cursor-move flex flex-col items-center"
                :draggable="item.remaining_pool > 0" :class="{ 'text-red-400': item.remaining_pool == 0 }"
                @dragstart="onMemoryDrag(item, index)" @dragend="onMemoryDragEnd">
                {{ item.name }} {{ item.data.rarity }}
                <img :draggable="false" height="40" width="40" :src="`/data/!Images/${item.data.image}`"></img>
            </div>
        </div>

        <div id="essenceList" class="p-4 border-2 rounded-lg flex space-x-3 overflow-x-auto">
            <div v-for="(item, index) in essenceList" :key="item.id"
                class="p-2 border-2 bg-gray-200 select-none cursor-move flex flex-col items-center w-[200px]"
                :class="{ 'text-red-400': item.remaining_pool == 0 }" :draggable="item.remaining_pool > 0"
                @dragstart="onEssenceDrag(item, index)" @dragend="onEssenceDragEnd">
                {{ item.name }} {{ item.data.rarity }}
                <img height="40" width="40" :src="`/data/!Images/${item.data.image}`"></img>
            </div>
        </div>

        <div v-for="(socket, idx) in traveler!.loadout.memories" :key="idx" @drop="onMemorySocketDrop(idx)"
            class="border-2 rounded-lg" @dragover.prevent="" @dragleave="">
            <div v-if="socket.slot" @click="onMemoryUnsocket(idx)" class="cursor-pointer">
                {{ socket.slot!.name }}
            </div>
            <div v-else>Empty</div>
            <div class="border-1">
                <div v-for="(eSocket, eIdx) in socket.essences" :key="eIdx" @drop="onEssenceSocketDrop(idx, eIdx)">
                    <div v-if="eSocket.slot" @click="onEssenceUnsocket(idx, eIdx)">
                        {{ eSocket.slot!.name }}
                    </div>
                    <div v-else>
                        Empty
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script async setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

import { compareItem, mapEssence, mapMemory, type Essence, type Memory } from '../models/item';
import { initTraveler, type BuildTraveler, type Travelers } from '../models/travelers';
import { type Essences } from '../models/essence';
import { type Memories } from '../models/memories';

const { locale } = useI18n()

const draggingMemory = ref<{ item: Memory, index: number }>();
const draggingEssence = ref<{ item: Essence, index: number }>();

const onMemoryDrag = (item: Memory, index: number) => {
    draggingMemory.value = { item, index }
}

const onEssenceDrag = (item: Essence, index: number) => {
    draggingEssence.value = { item, index }
}

const onMemoryDragEnd = () => {
    draggingMemory.value = undefined;
};

const onEssenceDragEnd = () => {
    draggingEssence.value = undefined
}

const onMemorySocketDrop = (socketId: number) => {
    if (draggingMemory.value && traveler.value!.loadout.memories[socketId].canSocket(draggingMemory.value.item)) {
        traveler.value!.loadout.memories[socketId].slot = draggingMemory.value.item
        memoryList.value![draggingMemory.value.index].remaining_pool -= 1
    }
    draggingMemory.value = undefined
}

const onEssenceSocketDrop = (socketId: number, essenceId: number) => {
    if (draggingEssence.value && traveler.value!.loadout.memories[socketId].essences[essenceId].canSocket(draggingEssence.value.item)) {
        traveler.value!.loadout.memories[socketId].essences[essenceId].slot = draggingEssence.value.item
        essenceList.value![draggingEssence.value.index].remaining_pool -= 1
    }
    draggingEssence.value = undefined
}

const onMemoryUnsocket = (socketId: number) => {
    const index = memoryList.value!.findIndex((v) => {
        return v.id === traveler.value!.loadout.memories[socketId].slot!.id
    })
    memoryList.value![index].remaining_pool += 1
    traveler.value!.loadout.memories[socketId].slot = undefined
}

const onEssenceUnsocket = (socketId: number, essenceId: number) => {
    const index = essenceList.value!.findIndex((v) => {
        return v.id === traveler.value!.loadout.memories[socketId].essences[essenceId].slot!.id
    })
    essenceList.value![index].remaining_pool += 1
    traveler.value!.loadout.memories[socketId].essences[essenceId].slot = undefined
}

const travelers = ref<Travelers>()
const essences = ref<Essences>()
const memories = ref<Memories>()
const traveler = ref<BuildTraveler>()
const essenceList = ref<Essence[]>()
const memoryList = ref<Memory[]>()

try {
    if (!travelers.value) {
        const resp = await axios.get<Travelers>(`/data/${locale.value}/travelers.json`)
        travelers.value = resp.data
    }
    if (!memories.value) {
        const resp = await axios.get<Memories>(`/data/${locale.value}/memories.json`)
        memories.value = resp.data
    }
    if (!essences.value) {
        const resp = await axios.get<Essences>(`/data/${locale.value}/essences.json`)
        essences.value = resp.data
    }
    traveler.value = initTraveler("Hero_Lacerta", travelers.value, memories.value)
    const startingQ = traveler.value.loadout.memories[0].slot!
    const startingR = traveler.value.loadout.memories[3].slot!
    essenceList.value = Object.entries(essences.value).map(mapEssence)
    essenceList.value!.sort((a, b) => compareItem(a, b))
    memoryList.value = Object.entries(memories.value).map(mapMemory).map(m => {
        if (m.id == startingQ.id || m.id == startingR.id) {
            return {
                ...m,
                remaining_pool: 0 as const
            }
        }
        return m
    }).filter(m => {
        if (m.data.rarity !== "Character" && m.data.rarity !== "Identity") {
            return true
        }
        return (traveler.value!.data.loadoutQ.concat(traveler.value!.data.loadoutR)).includes(m.id)
    })
    memoryList.value!.sort((a, b) => compareItem(a, b))
} catch (e) {
    console.log(e)
}
</script>