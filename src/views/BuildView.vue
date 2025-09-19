<template>
    <div class="p-6">
        <div @click="copyBuild()">
            {{ traveler?.data.name }}
        </div>
        <div v-for="(socket, idx) in traveler!.loadout.memories" :key="idx" @drop="onMemorySocketDrop(idx)"
            class="border-2 rounded-lg" @dragover.prevent="" @dragleave="">
            <div v-if="socket.slot" @click="onMemoryUnsocket(idx)" class="cursor-pointer">
                {{ socket.slot!.data.name }}
                <NDivider vertical></NDivider>
                <span v-html="renderDescription(socket.slot?.data.description, false)"></span>
            </div>
            <div v-else>Empty</div>
            <div class="border-1">
                <div v-for="(eSocket, eIdx) in socket.essences" :key="eIdx" @drop="onEssenceSocketDrop(idx, eIdx)">
                    <div v-if="eSocket.slot" @click="onEssenceUnsocket(idx, eIdx)">
                        {{ eSocket.slot!.data.name }}
                        <NDivider vertical></NDivider>
                        <span v-html="renderDescription(eSocket.slot?.data.description, false)"></span>
                    </div>
                    <div v-else>
                        Empty
                    </div>
                </div>
            </div>
        </div>
    </div>
    <NGrid cols="2" item-responsive class="px-6" x-gap="20">
        <NGridItem span="1">
            Memories
            <ItemDragList :per-line="4" class="max-h-[50vh] overflow-y-auto" v-model="draggingMemory"
                :item-list="memoryList">
            </ItemDragList>
        </NGridItem>
        <NGridItem span="1">
            Essences
            <ItemDragList :per-line="4" class="max-h-[50vh] overflow-y-auto" v-model="draggingEssence"
                :item-list="essenceList">
            </ItemDragList>
        </NGridItem>
    </NGrid>
</template>

<script async setup lang="ts">
import { reactive, ref, watch, type Reactive } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

import { compareItem, mapEssence, mapMemory, renderDescription, type Essence, type Memory } from '../models/item';
import { defaultQ, defaultR, initTraveler, serializeBuild, type BuildTraveler, type SerializedTraveler, type Travelers } from '../models/travelers';
import { type Essences } from '../models/essence';
import { type Memories } from '../models/memories';
import ItemDragList from '../components/ItemDragList.vue';
import { NDivider, NGrid, NGridItem } from 'naive-ui';
import LZString from "lz-string"
import { EssenceSocket, MemorySocket } from '../models/socket';


const { locale } = useI18n()

const draggingMemory = ref<{ item: Memory, index: number }>();
const draggingEssence = ref<{ item: Essence, index: number }>();

const onMemorySocketDrop = (socketId: number) => {
    if (draggingMemory.value && traveler!.loadout.memories[socketId].canSocket(draggingMemory.value.item)) {
        traveler!.loadout.memories[socketId].slot = draggingMemory.value.item
        memoryList.value![draggingMemory.value.index].remaining_pool -= 1
    }
    draggingMemory.value = undefined
}

const onEssenceSocketDrop = (socketId: number, essenceId: number) => {
    if (draggingEssence.value && traveler!.loadout.memories[socketId].essences[essenceId].canSocket(draggingEssence.value.item)) {
        traveler!.loadout.memories[socketId].essences[essenceId].slot = draggingEssence.value.item
        essenceList.value![draggingEssence.value.index].remaining_pool -= 1
    }
    draggingEssence.value = undefined
}

const onMemoryUnsocket = (socketId: number) => {
    const index = memoryList.value!.findIndex((v) => {
        return v.id === traveler!.loadout.memories[socketId].slot!.id
    })
    memoryList.value![index].remaining_pool += 1
    traveler!.loadout.memories[socketId].slot = undefined
}

const onEssenceUnsocket = (socketId: number, essenceId: number) => {
    const index = essenceList.value!.findIndex((v) => {
        return v.id === traveler!.loadout.memories[socketId].essences[essenceId].slot!.id
    })
    essenceList.value![index].remaining_pool += 1
    traveler!.loadout.memories[socketId].essences[essenceId].slot = undefined
}

const copyBuild = async () => {
    if (traveler) {
        await navigator.clipboard.writeText(serializeBuild(traveler))
    }
}

const travelers = ref<Travelers>()
const essences = ref<Essences>()
const memories = ref<Memories>()
const essenceList = ref<Essence[]>()
const memoryList = ref<Memory[]>()

if (!travelers.value) {
    const resp = await axios.get<Travelers>(`/build-of-dreams/data/${locale.value}/travelers.json`)
    travelers.value = resp.data
}
if (!memories.value) {
    const resp = await axios.get<Memories>(`/build-of-dreams/data/${locale.value}/memories.json`)
    memories.value = resp.data
}
if (!essences.value) {
    const resp = await axios.get<Essences>(`/build-of-dreams/data/${locale.value}/essences.json`)
    essences.value = resp.data
}

let traveler: Reactive<BuildTraveler>;
const decompressed = LZString.decompressFromBase64(window.location.search.split("&").find(q => q.startsWith('build'))?.split("=")[1])
if (decompressed) {
    const serTrav: SerializedTraveler = JSON.parse(decompressed)
    traveler = reactive<BuildTraveler>({
        id: serTrav.i,
        data: travelers.value[serTrav.i],
        loadout: {
            dash: mapMemory([serTrav.l.d, memories.value[serTrav.l.d]]),
            passive: mapMemory([serTrav.l.p, memories.value[serTrav.l.p]]),
            memories: [
                new MemorySocket(
                    serTrav.l.m[0].i ? mapMemory([serTrav.l.m[0].i, memories.value[serTrav.l.m[0].i]]) : defaultQ(serTrav.i, travelers.value, memories.value),
                    [
                        new EssenceSocket(
                            serTrav.l.m[0].e[0].i ? mapEssence([serTrav.l.m[0].e[0].i, essences.value[serTrav.l.m[0].e[0].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[0].e[1].i ? mapEssence([serTrav.l.m[0].e[1].i, essences.value[serTrav.l.m[0].e[1].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[0].e[2].i ? mapEssence([serTrav.l.m[0].e[2].i, essences.value[serTrav.l.m[0].e[2].i]]) : undefined
                        ),
                    ]
                ),
                new MemorySocket(
                    serTrav.l.m[1].i ? mapMemory([serTrav.l.m[1].i, memories.value[serTrav.l.m[1].i]]) : undefined,
                    [
                        new EssenceSocket(
                            serTrav.l.m[1].e[0].i ? mapEssence([serTrav.l.m[1].e[0].i, essences.value[serTrav.l.m[1].e[0].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[1].e[1].i ? mapEssence([serTrav.l.m[1].e[1].i, essences.value[serTrav.l.m[1].e[1].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[1].e[2].i ? mapEssence([serTrav.l.m[1].e[2].i, essences.value[serTrav.l.m[1].e[2].i]]) : undefined
                        ),
                    ]
                ),
                new MemorySocket(
                    serTrav.l.m[2].i ? mapMemory([serTrav.l.m[2].i, memories.value[serTrav.l.m[2].i]]) : undefined,
                    [
                        new EssenceSocket(
                            serTrav.l.m[2].e[0].i ? mapEssence([serTrav.l.m[2].e[0].i, essences.value[serTrav.l.m[2].e[0].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[2].e[1].i ? mapEssence([serTrav.l.m[2].e[1].i, essences.value[serTrav.l.m[2].e[1].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[2].e[2].i ? mapEssence([serTrav.l.m[2].e[2].i, essences.value[serTrav.l.m[2].e[2].i]]) : undefined
                        ),
                    ]
                ),
                new MemorySocket(
                    serTrav.l.m[3].i ? mapMemory([serTrav.l.m[3].i, memories.value[serTrav.l.m[3].i]]) : defaultR(serTrav.i, travelers.value, memories.value),
                    [
                        new EssenceSocket(
                            serTrav.l.m[3].e[0].i ? mapEssence([serTrav.l.m[3].e[0].i, essences.value[serTrav.l.m[3].e[0].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[3].e[1].i ? mapEssence([serTrav.l.m[3].e[1].i, essences.value[serTrav.l.m[3].e[1].i]]) : undefined
                        ),
                        new EssenceSocket(
                            serTrav.l.m[3].e[2].i ? mapEssence([serTrav.l.m[3].e[2].i, essences.value[serTrav.l.m[3].e[2].i]]) : undefined
                        ),
                    ]
                )
            ]
        }
    })
} else {
    traveler = reactive(initTraveler("Hero_Lacerta", travelers.value, memories.value))
}
watch(traveler, () => {
    history.pushState(null, "", `/build-of-dreams?build=${serializeBuild(traveler)}`)
})
const startingQ = traveler.loadout.memories[0].slot!
const startingR = traveler.loadout.memories[3].slot!
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
    return (traveler!.data.loadoutQ.concat(traveler!.data.loadoutR)).includes(m.id)
})
memoryList.value!.sort((a, b) => compareItem(a, b))
</script>