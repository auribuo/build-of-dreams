<template>
    <NFlex vertical class="px-3 pt-3 max-h-screen">
        <div class="flex items-start gap-3 sm:flex-row flex-col justify-center">
            <div :style="{
                width: '40px',
                height: '34px',
                backgroundColor: theme.primaryColor,
                maskImage: `url(/build-of-dreams/data/!Images/${traveler.data.image ?? 'Hero_Lacerta.png'})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'contain'
            }"></div>
            <NSelect title="Character" class="flex-1 min-w-full sm:min-w-1/3 sm:max-w-1/3"
                v-model:value="selectedTraveler" @update-value="updateTraveler"
                :options="Object.keys(travelers!).map(t => { return { label: travelers![t as TravelerName].name, value: t } })">
            </NSelect>
            <div class="flex items-start gap-3 w-full sm:w-2/3 sm:flex-row flex-col">
                <NButton class="min-w-full sm:min-w-auto" @click="shareBuild()">Share build</NButton>
                <NButton class="min-w-full sm:min-w-auto" @click="copyBuild">Copy build</NButton>
                <NButton class="min-w-full sm:min-w-auto" @click="readBuild()">
                    Load build
                </NButton>
                <NButton class="min-w-full sm:min-w-auto" @click="resetBuild()">Clear build</NButton>
            </div>
        </div>
        <StatsPanel v-if="traveler != undefined" :traveler="traveler"></StatsPanel>
        <NGrid cols="1 s:5" x-gap="30" y-gap="20" responsive="screen">
            <NGridItem span="2">
                <NGrid cols="1" x-gap="20" y-gap="20">
                    <NGridItem class="h-[200px] p-3"
                        :style="{ borderWidth: '1px', borderStyle: 'solid', 'border-color': theme.dividerColor }">
                        <div class="text-xl font-bold" :style="{ color: theme.primaryColor }">
                            Passive
                        </div>
                        <div class="flex flex-row items-start gap-x-5 mt-3">
                            <div v-for="(item, index) in traveler.data.loadoutTrait"
                                @click="traveler.loadout.passive = mapMemory(item, memories)">
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
                                @click="traveler.loadout.dash = mapMemory(item, memories)">
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
                <NGrid cols="1 s:2" x-gap="20" y-gap="20" responsive="screen">
                    <NGridItem :style="{ borderWidth: '1px', borderStyle: 'solid', 'border-color': theme.dividerColor }"
                        class="h-[200px] rounded-sm p-3 flex items-start flex-col"
                        v-for="(socket, idx) in traveler!.loadout.memories" :key="idx">
                        <div class="font-bold text-lg mb-3" :style="{ color: theme.primaryColor }">
                            Memory {{ idx + 1 }}
                        </div>
                        <div class="flex flex-row">
                            <div class="flex w-[80px] align-center items-center flex-col py-auto"
                                @click="onMemorySocketDrop(idx)" @drop="onMemorySocketDrop(idx)" @dragover.prevent=""
                                @dragleave="">
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
                                    @click="onEssenceSocketDrop(idx, eIdx)" @drop="onEssenceSocketDrop(idx, eIdx)"
                                    @dragover.prevent="" @dragend.prevent="" class="pb-2 mb-2"
                                    :style="{ borderBottomWidth: '1px', borderBottomColor: theme.dividerColor, borderBottomStyle: 'solid' }">
                                    <div class="flex items-center flex-row hover:line-through cursor-pointer hover:decoration-red-500"
                                        v-if="eSocket.slot && eSocket.slot.data" @click="onEssenceUnsocket(idx, eIdx)">
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
        <NTabs type="segment" animated>
            <NTabPane name="memories" tab="Memories" display-directive="if">
                <ItemDragList :per-line="4" v-model="draggingMemory" :item-list="loadoutManager.memoryList">
                </ItemDragList>
            </NTabPane>
            <NTabPane name="essences" tab="Essences">
                <ItemDragList :per-line="4" v-model="draggingEssence" :item-list="loadoutManager.essenceList">
                </ItemDragList>
            </NTabPane>
        </NTabs>
    </NFlex>
</template>

<script async setup lang="ts">
import { computed, ref } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

import {
    mapMemory,
    renderDescription,
    type Item,
} from '../models/item';
import {
    deserializeBuild,
    initTraveler,
    LoadoutManager,
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
    if (!draggingMemory.value) {
        return
    }
    loadoutManager.socket(draggingMemory.value, socketId)
    draggingMemory.value = undefined
}

const onEssenceSocketDrop = (socketId: number, essenceId: number) => {
    if (!draggingEssence.value) {
        return
    }
    loadoutManager.socket(draggingEssence.value, [socketId, essenceId])
    draggingEssence.value = undefined
}

const onMemoryUnsocket = (socketId: number) => {
    loadoutManager.socket(undefined, socketId)
}

const onEssenceUnsocket = (socketId: number, essenceId: number) => {
    loadoutManager.socket(undefined, [socketId, essenceId])
}

const readBuild = async () => {
    try {
        const build = await navigator.clipboard.readText()
        if (!build) {
            return
        }
        const decompressed = LZString.decompressFromBase64(build)
        if (decompressed) {
            try {
                const serTrav: SerializedTraveler = JSON.parse(decompressed)
                loadoutManager.loadTraveler(deserializeBuild(serTrav, memories, essences, travelers), memories)
                emit('characterChange', traveler.value as BuildTraveler)
                message.success("Loaded build")
            } catch (e) {
                console.error("Failed json", e, decompressed)
                message.error("An unexpected error occurred while loading the build")
            }
        } else {
            console.error("Failed lz", decompressed)
            message.error("Failed to read valid build from clipboard. Make sure you use 'Copy build'")
        }
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

const travelers = ((await axios.get<Travelers>(`/build-of-dreams/data/${locale.value}/travelers.json`)).data)
const essences = ((await axios.get<Essences>(`/build-of-dreams/data/${locale.value}/essences.json`)).data)
const memories = ((await axios.get<Memories>(`/build-of-dreams/data/${locale.value}/memories.json`)).data)


let traveler = ref<BuildTraveler>(initTraveler("Hero_Lacerta", travelers, memories));
const loadoutManager = new LoadoutManager(traveler, memories, essences)
const buildURI = window.location.search.substring(1).split("&").find(q => q.startsWith('build'))?.split("=").slice(1).reduce((acc, current) => { if (current == "") current = "="; return acc + current }) ?? ""
const build = decodeURIComponent(buildURI)
if (build) {
    const decompressed = LZString.decompressFromBase64(build)
    if (decompressed) {
        try {
            const serTrav: SerializedTraveler = JSON.parse(decompressed)
            loadoutManager.loadTraveler(deserializeBuild(serTrav, memories, essences, travelers), memories)
            emit('characterChange', traveler.value as BuildTraveler)
            message.success("Loaded build")
        } catch (e) {
            console.error("Failed json", e, decompressed)
            message.error("An unexpected error occurred while loading the build")
        }
    } else {
        console.error("Failed lz", decompressed)
        message.error("Failed to read valid build from clipboard. Make sure you use 'Copy build'")
    }
}
let selectedTraveler = computed(() => traveler.value?.data.name)
const selectedPassive = computed(() => traveler.value.data.loadoutTrait.indexOf(traveler.value.loadout.passive.id))
const selectedDash = computed(() => traveler.value.data.loadoutMovement.indexOf(traveler.value.loadout.dash.id))

loadoutManager.onTravelerChange = (traveler) => {
    history.pushState(null, "", `/build-of-dreams?build=${encodeURI(serializeBuild(traveler))}`)
}

const updateTraveler = (v: TravelerName) => {
    loadoutManager.changeTraveler(v, travelers, memories)
    emit("characterChange", traveler.value! as BuildTraveler);
}

const resetBuild = () => {
    traveler.value.loadout.memories.forEach((m, i) => {
        loadoutManager.socket(undefined, i)
        m.essences.forEach((_e, j) => loadoutManager.socket(undefined, [i, j]))
    })
}

const shareBuild = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/build-of-dreams?build=${serializeBuild(traveler.value)}`)
    message.success("Copied build URL to clipboard")
}
</script>