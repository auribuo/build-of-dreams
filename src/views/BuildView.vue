<template>
    <NFlex vertical class="px-3 pt-3 max-h-screen">
        <NSpace>
            <NSelect title="Character" class="min-w-[300px]" v-model:value="selectedTraveler"
                @update-value="updateTraveler"
                :options="Object.keys(travelers!).map(t => { return { label: travelers![t as TravelerName].name, value: t } })">
            </NSelect>
            <NButton @click="copyBuild">Copy build</NButton>
            <NButton @click="readBuild().then(b => loadBuild(b))">Load build</NButton>
            <NButton @click="resetBuild()">Clear build</NButton>
        </NSpace>
        <NGrid cols="5" x-gap="30">
            <NGridItem span="2">
                <NGrid cols="1" x-gap="20" y-gap="20">
                    <NGridItem class="h-[200px] p-3"
                        :style="{ borderWidth: '1px', borderStyle: 'solid', 'border-color': theme.dividerColor }">
                        <div class="text-xl font-bold" :style="{ color: theme.primaryColor }">
                            Passive
                        </div>
                        <div class="flex flex-row items-start gap-x-5 mt-3">
                            <div v-for="(item, index) in traveler.data.loadoutTrait"
                                @click="traveler.loadout.passive = mapMemory([item, memories![item]])">
                                <NImage width="40" height="40" lazy class="rounded-[50%]" preview-disabled
                                    :src="`/build-of-dreams/data/!Images/${memories![item].image}`"
                                    :class="selectedPassive == index ? 'border-[1px]' : 'opacity-30'">
                                </NImage>
                            </div>
                        </div>
                        <div class="font-bold">{{ memories![traveler.loadout.passive.id].name }}</div>
                        <div>
                            <NEllipsis class="max-h-[70px]">
                                <span v-html="renderDescription(memories![traveler.loadout.passive.id].description)">
                                </span>
                            </NEllipsis>
                        </div>
                    </NGridItem>
                    <NGridItem class="h-[200px] p-3"
                        :style="{ borderWidth: '1px', borderStyle: 'solid', 'border-color': theme.dividerColor }">
                        <div class="text-xl font-bold" :style="{ color: theme.primaryColor }">
                            Dash
                        </div>
                        <div class="flex flex-row items-start gap-x-5 mt-3">
                            <div v-for="(item, index) in traveler.data.loadoutMovement"
                                @click="traveler.loadout.dash = mapMemory([item, memories![item]])">
                                <NImage width="40" height="40" lazy class="rounded-[50%]" preview-disabled
                                    :src="`/build-of-dreams/data/!Images/${memories![item].image}`"
                                    :class="selectedDash == index ? 'border-[1px]' : 'opacity-30'">
                                </NImage>
                            </div>
                        </div>
                        <div class="font-bold">{{ memories![traveler.loadout.dash.id].name }}</div>
                        <div>
                            <NEllipsis class="max-h-[70px] text-wrap">
                                <span v-html="renderDescription(memories![traveler.loadout.dash.id].description)">
                                </span>
                            </NEllipsis>
                        </div>
                    </NGridItem>
                </NGrid>
            </NGridItem>
            <NGridItem span="3">
                <NGrid cols="2" x-gap="20" y-gap="20">
                    <NGridItem :style="{ borderWidth: '1px', borderStyle: 'solid', 'border-color': theme.dividerColor }"
                        class="h-[200px] rounded-sm p-3 flex items-start flex-col"
                        v-for="(socket, idx) in traveler!.loadout.memories" :key="idx">
                        <div class="font-bold text-lg mb-3" :style="{ color: theme.primaryColor }">
                            Memory {{ idx + 1 }}
                        </div>
                        <div class="flex flex-row">
                            <div class="flex w-[80px] align-center items-center flex-col py-auto"
                                @drop="onMemorySocketDrop(idx)" @dragover.prevent="" @dragleave="">
                                <div v-if="socket.slot" @click="onMemoryUnsocket(idx)"
                                    class="align-center items-center flex flex-col cursor-pointer hover:line-through hover:decoration-red-500">
                                    <NImage width="70" height="70" preview-disabled lazy
                                        :src="`/build-of-dreams/data/!Images/${socket.slot.data.image}`"
                                        draggable="false" class="rounded-lg z-0 object-cover mx-auto">
                                    </NImage>
                                    <div class="text-center mt-3 font-bold0">
                                        {{ socket.slot!.data.name }}
                                    </div>
                                </div>
                                <NEmpty v-else>
                                    Empty
                                </NEmpty>
                            </div>
                            <!-- <div class="flex flex-1 flex-col ml-3"> -->
                            <div vertical class="flex flex-col ml-3 flex-1">
                                <div v-for="(eSocket, eIdx) in socket.essences" :key="eIdx"
                                    @drop="onEssenceSocketDrop(idx, eIdx)" @dragover.prevent="" @dragend.prevent=""
                                    class="pb-2 mb-2"
                                    :style="{ borderBottomWidth: '1px', borderBottomColor: theme.dividerColor, borderBottomStyle: 'solid' }">
                                    <div class="flex items-center flex-row hover:line-through cursor-pointer hover:decoration-red-500"
                                        v-if="eSocket.slot" @click="onEssenceUnsocket(idx, eIdx)">
                                        <NImage width="30" height="30" preview-disabled lazy
                                            :src="`/build-of-dreams/data/!Images/${eSocket.slot.data.image}`"
                                            draggable="false" class="rounded-lg z-0 object-cover mx-auto">
                                        </NImage>
                                        <span :class="`ml-2 font-bold flex-1`">
                                            {{ eSocket.slot!.data.name }}
                                        </span>
                                    </div>
                                    <div v-else :style="{ color: theme.textColorDisabled }">
                                        Empty
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NGridItem>
                </NGrid>
            </NGridItem>
        </NGrid>
        <NTabs type="segment" animated class="flex-1">
            <NTabPane name="memories" tab="Memories" display-directive="if">
                <!-- <NFlex class="w-full mb-3">
                    <NInput class="flex-1 w-1/2"></NInput>
                    <NSelect @update-value="filterMemoryTags" class="flex-1 w-1/2" multiple :options="memoryTagSet">
                    </NSelect>
                </NFlex> -->
                <ItemDragList :per-line="4" class="max-h-[50vh] overflow-y-auto" v-model="draggingMemory"
                    :item-list="memoryList">
                </ItemDragList>
            </NTabPane>
            <NTabPane name="essences" tab="Essences">
                <ItemDragList :per-line="4" class="max-h-[50vh] overflow-y-auto" v-model="draggingEssence"
                    :item-list="essenceList">
                </ItemDragList>
            </NTabPane>
        </NTabs>
    </NFlex>
</template>

<script async setup lang="ts">
import { computed, reactive, ref, watch, type Reactive } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

import {
    compareItem,
    mapEssence,
    mapMemory,
    renderDescription,
    type Essence,
    type Item,
    type Memory
} from '../models/item';
import {
    changeTraveler,
    deserializeBuild,
    initTraveler,
    serializeBuild,
    type BuildTraveler,
    type SerializedTraveler,
    type TravelerName,
    type Travelers
} from '../models/travelers';
import { type Essences } from '../models/essence';
import { type Memories } from '../models/memories';
import ItemDragList from '../components/ItemDragList.vue';
import {
    NFlex,
    NButton,
    NImage,
    NSelect,
    NSpace,
    NTabPane,
    NTabs,
    useThemeVars,
    NGrid,
    NGridItem,
    NEmpty,
    NEllipsis,
    useMessage,
} from 'naive-ui';
import LZString from "lz-string"


const { locale } = useI18n()
const theme = useThemeVars()
const message = useMessage()

const draggingMemory = ref<Item<"memory">>();
const draggingEssence = ref<Item<"essence">>();

const emit = defineEmits<{
    (e: 'characterChange', t: BuildTraveler): void
}>()

const onMemorySocketDrop = (socketId: number) => {
    if (draggingMemory.value && traveler.value.loadout.memories[socketId].canSocket(draggingMemory.value)) {
        traveler.value.loadout.memories[socketId].slot = draggingMemory.value
        memoryList.value![memoryList.value.findIndex(item => item.id == draggingMemory.value?.id)].remaining_pool -= 1
    }
    draggingMemory.value = undefined
}

const onEssenceSocketDrop = (socketId: number, essenceId: number) => {
    if (draggingEssence.value && traveler.value.loadout.memories[socketId].essences[essenceId].canSocket(draggingEssence.value)) {
        traveler.value.loadout.memories[socketId].essences[essenceId].slot = draggingEssence.value
        essenceList.value![essenceList.value.findIndex(e => e.id == draggingEssence.value?.id)].remaining_pool -= 1
    }
    draggingEssence.value = undefined
}

const onMemoryUnsocket = (socketId: number) => {
    const index = memoryList.value!.findIndex((v) => {
        return v.id === traveler.value.loadout.memories[socketId].slot!.id
    })
    memoryList.value![index].remaining_pool += 1
    traveler.value.loadout.memories[socketId].slot = undefined
}

const onEssenceUnsocket = (socketId: number, essenceId: number) => {
    const index = essenceList.value!.findIndex((v) => {
        return v.id === traveler.value.loadout.memories[socketId].essences[essenceId].slot!.id
    })
    essenceList.value![index].remaining_pool += 1
    traveler.value.loadout.memories[socketId].essences[essenceId].slot = undefined
}

const readBuild = async () => {
    try {
        return await navigator.clipboard.readText()
    } catch {
        message.error("Failed to read build from clipboard")
        return ""
    }
}

const copyBuild = async () => {
    if (traveler.value) {
        await navigator.clipboard.writeText(serializeBuild(traveler.value))
        message.success("Copied build to clipboard")
    }
}

const travelers = ref<Travelers>((await axios.get<Travelers>(`/build-of-dreams/data/${locale.value}/travelers.json`)).data)
const essences = ref<Essences>((await axios.get<Essences>(`/build-of-dreams/data/${locale.value}/essences.json`)).data)
const memories = ref<Memories>((await axios.get<Memories>(`/build-of-dreams/data/${locale.value}/memories.json`)).data)

const loadBuild = (build: string) => {
    const decompressed = LZString.decompressFromBase64(build)
    if (decompressed) {
        const serTrav: SerializedTraveler = JSON.parse(decompressed)
        traveler.value = deserializeBuild(serTrav, memories.value!, essences.value!, travelers.value!)
        emit('characterChange', traveler.value as BuildTraveler)
        message.success("Loaded build")
    }
}

let traveler = ref<Reactive<BuildTraveler>>(reactive(initTraveler("Hero_Lacerta", travelers.value, memories.value)));
let selectedTraveler = computed(() => traveler.value?.data.name)
loadBuild(window.location.search.substring(1).split("&").find(q => q.startsWith('build'))?.split("=").slice(1).reduce((acc, current) => { if (current == "") current = "="; return acc + current }) ?? "")
watch(traveler, () => {
    history.pushState(null, "", `/build-of-dreams?build=${serializeBuild(traveler.value)}`)
})
const selectedPassive = computed(() => traveler.value.data.loadoutTrait.indexOf(traveler.value.loadout.passive.id))
const selectedDash = computed(() => traveler.value.data.loadoutMovement.indexOf(traveler.value.loadout.dash.id))
const startingQ = traveler.value.loadout.memories[0].slot!
const startingR = traveler.value.loadout.memories[3].slot!

const essenceList = ref<Essence[]>(Object.entries(essences.value).map(mapEssence))
essenceList.value!.sort((a, b) => compareItem(a, b))

const memoryList = ref<Memory[]>(Object.entries(memories.value).map(mapMemory).map(m => {
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
    return (traveler.value.data.loadoutQ.concat(traveler.value.data.loadoutR)).includes(m.id)
}))
memoryList.value.sort((a, b) => compareItem(a, b))

// const memoryTagSet = computed(() => {
//     return [...new Set(memoryList.value.map(m => m.data.tags).flat())].map(i => { return { label: i, value: i } })
// })

const updateTraveler = (v: TravelerName) => {
    traveler.value = changeTraveler(traveler.value as BuildTraveler, v, travelers.value!, memories.value!)
    memoryList.value = Object.entries(memories.value!).map(mapMemory).map(m => {
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
        return (traveler.value.data.loadoutQ.concat(traveler.value.data.loadoutR)).includes(m.id)
    })
    memoryList.value!.sort((a, b) => compareItem(a, b))
    emit("characterChange", traveler.value! as BuildTraveler);
}

const resetBuild = () => {
    traveler.value.loadout.memories.forEach(m => {
        m.slot = undefined
        m.essences.forEach(e => e.slot = undefined)
    })
    window.history.pushState(null, "", "/build-of-dreams/")
}
</script>