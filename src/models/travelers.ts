import type travelers from "../../public/data/en-US/travelers.json";
import { type MemorySocket } from "./socket";
import { memoriesToList, type Memories, type MemoryName } from "./memories";
import {
    compareItem,
    mapEssence,
    mapMemory,
    type Essence,
    type Item,
    type ItemId,
    type ItemType,
    type Memory,
} from "./item";
import LZString from "lz-string";
import { ref, type Reactive, type Ref } from "vue";
import { essencesToList, type Essences } from "./essence";

type TravelerName = keyof typeof travelers;
interface TravelerData {
    name: string;
    subtitle: string;
    description: string;
    color: string;
    image: `${TravelerName}.png`;
    baseStats: {
        attackDamage: number;
        abilityPower: number;
        maxHealth: number;
        maxMana: number;
        healthRegen: number;
        manaRegen: number;
        critAmp: number;
        critChance: number;
        abilityHaste: number;
        tenacity: number;
        fireEffectAmp: number;
        coldEffectAmp: number;
        lightEffectAmp: number;
        darkEffectAmp: number;
        armor: number;
    };
    scalingStats: {
        attackDamageFlat: number;
        attackDamagePercentage: number;
        abilityPowerFlat: number;
        abilityPowerPercentage: number;
        maxHealthFlat: number;
        maxHealthPercentage: number;
        maxManaFlat: number;
        maxManaPercentage: number;
        healthRegenFlat: number;
        healthRegenPercentage: number;
        manaRegenFlat: number;
        manaRegenPercentage: number;
        attackSpeedPercentage: number;
        critAmpFlat: number;
        critAmpPercentage: number;
        critChanceFlat: number;
        critChancePercentage: number;
        abilityHasteFlat: number;
        abilityHastePercentage: number;
        tenacityFlat: number;
        tenacityPercentage: number;
        attackRangeFlat: number;
        attackRangePercentage: number;
        movementSpeedPercentage: number;
        fireEffectAmpFlat: number;
        coldEffectAmpFlat: number;
        lightEffectAmpFlat: number;
        darkEffectAmpFlat: number;
        armorFlat: number;
        armorPercentage: number;
        everyFourAttackStartIndexFlat: number;
    };
    loadoutQ: MemoryName[];
    loadoutR: MemoryName[];
    loadoutTrait: MemoryName[];
    loadoutMovement: MemoryName[];
    achievementKey: string; // TODO
    achievementName: string;
    achievementDescription: string;
}

type Travelers = {
    [K in TravelerName]: TravelerData;
};

interface Traveler {
    id: TravelerName;
    data: TravelerData;
}

interface BuildTraveler extends Traveler {
    loadout: {
        memories: [MemorySocket, MemorySocket, MemorySocket, MemorySocket];
        dash: Item<"memory">;
        passive: Item<"memory">;
    };
}

type SerializedEssenceSocket = ItemId<"essence"> | undefined;
type SerializedMemorySocket = {
    i: ItemId<"memory"> | undefined;
    e: [SerializedEssenceSocket, SerializedEssenceSocket, SerializedEssenceSocket];
};

type SerializedTraveler = {
    i: TravelerName;
    m: [SerializedMemorySocket, SerializedMemorySocket, SerializedMemorySocket, SerializedMemorySocket];
    d: ItemId<"memory">;
    p: ItemId<"memory">;
};

const serializeBuild = <T extends BuildTraveler | Reactive<BuildTraveler>>(traveler: T): string => {
    const ser: SerializedTraveler = {
        i: traveler.id,
        m: [
            {
                i: traveler.loadout.memories[0].slot?.id,
                e: [
                    traveler.loadout.memories[0].essences[0].slot?.id,
                    traveler.loadout.memories[0].essences[1].slot?.id,
                    traveler.loadout.memories[0].essences[2].slot?.id,
                ],
            },
            {
                i: traveler.loadout.memories[1].slot?.id,
                e: [
                    traveler.loadout.memories[1].essences[0].slot?.id,
                    traveler.loadout.memories[1].essences[1].slot?.id,
                    traveler.loadout.memories[1].essences[2].slot?.id,
                ],
            },
            {
                i: traveler.loadout.memories[2].slot?.id,
                e: [
                    traveler.loadout.memories[2].essences[0].slot?.id,
                    traveler.loadout.memories[2].essences[1].slot?.id,
                    traveler.loadout.memories[2].essences[2].slot?.id,
                ],
            },
            {
                i: traveler.loadout.memories[3].slot?.id,
                e: [
                    traveler.loadout.memories[3].essences[0].slot?.id,
                    traveler.loadout.memories[3].essences[1].slot?.id,
                    traveler.loadout.memories[3].essences[2].slot?.id,
                ],
            },
        ],
        d: traveler.loadout.dash.id,
        p: traveler.loadout.passive.id,
    };
    const s = JSON.stringify(ser);
    return LZString.compressToBase64(s);
};

const deserializeMemory = (
    serTrav: SerializedTraveler,
    memories: Memories,
    essences: Essences,
    memoryId: 0 | 1 | 2 | 3
): MemorySocket => {
    return {
        slot: mapMemory(serTrav.m[memoryId].i, memories),
        essences: [
            { slot: mapEssence(serTrav.m[memoryId].e[0], essences) },
            { slot: mapEssence(serTrav.m[memoryId].e[1], essences) },
            { slot: mapEssence(serTrav.m[memoryId].e[2], essences) },
        ],
    };
};

const deserializeBuild = (
    serTrav: SerializedTraveler,
    memories: Memories,
    essences: Essences,
    travelers: Travelers
): BuildTraveler => {
    return {
        id: serTrav.i,
        data: travelers[serTrav.i],
        loadout: {
            dash: mapMemory(serTrav.d, memories),
            passive: mapMemory(serTrav.p, memories),
            memories: [
                deserializeMemory(serTrav, memories, essences, 0),
                deserializeMemory(serTrav, memories, essences, 1),
                deserializeMemory(serTrav, memories, essences, 2),
                deserializeMemory(serTrav, memories, essences, 3),
            ],
        },
    };
};

function emptyMemory(memories: Memories, id?: MemoryName | undefined): MemorySocket {
    if (id) {
        return {
            slot: mapMemory(id, memories!),
            essences: [{ slot: undefined }, { slot: undefined }, { slot: undefined }],
        };
    } else {
        return {
            slot: undefined,
            essences: [{ slot: undefined }, { slot: undefined }, { slot: undefined }],
        };
    }
}

const initTraveler = (id: TravelerName, travelers: Travelers, memories: Memories): BuildTraveler => {
    return {
        id: id,
        data: travelers[id],
        loadout: {
            memories: [
                emptyMemory(memories, travelers[id].loadoutQ[0]),
                emptyMemory(memories),
                emptyMemory(memories),
                emptyMemory(memories, travelers[id].loadoutR[0]),
            ],
            dash: travelers[id].loadoutMovement.map((id) => mapMemory(id, memories))[0]!,
            passive: travelers[id].loadoutTrait.map((id) => mapMemory(id, memories))[0]!,
        },
    };
};

class LoadoutManager {
    private traveler: Ref<BuildTraveler>;
    public essenceList: Ref<Essence[]>;
    public memoryList: Ref<Memory[]>;
    public onTravelerChange: ((t: BuildTraveler) => void) | undefined = undefined;
    constructor(traveler: Ref<BuildTraveler>, memories: Memories, essences: Essences) {
        this.traveler = traveler;
        this.memoryList = ref(LoadoutManager.computeMemoryList(this.traveler, memories));
        this.essenceList = ref(LoadoutManager.computeEssenceList(this.traveler, essences));
    }

    private static computeMemoryList(t: Ref<BuildTraveler>, memories: Memories): Memory[] {
        const list = memoriesToList(memories)
            .map((m) => {
                if (this.hasTravelerEquipped(t, m)) {
                    return {
                        ...m,
                        remaining_pool: m.remaining_pool - 1,
                    };
                }
                return m;
            })
            .filter((m) => {
                if (m.data.rarity == "Identity") {
                    return false;
                }
                if (m.data.rarity == "Character") {
                    if (m.data.travelerMemoryLocation == "Movement") {
                        return false;
                    }
                    return m.data.traveler == t.value.id;
                }
                return true;
            });
        list.sort(compareItem);
        t.value.loadout.memories.forEach((m) => {
            if (m.slot && m.slot.data.rarity == "Character") {
                if (t.value.data.loadoutQ.includes(m.slot.id)) {
                    t.value.data.loadoutQ
                        .filter((i) => i != m.slot!.id)
                        .forEach((i) => list[list.findIndex((l) => l.id == i)].remaining_pool--);
                } else {
                    t.value.data.loadoutR
                        .filter((i) => i != m.slot!.id)
                        .forEach((i) => list[list.findIndex((l) => l.id == i)].remaining_pool--);
                }
            }
        });
        return list;
    }

    private static computeEssenceList(t: Ref<BuildTraveler>, essences: Essences): Essence[] {
        return essencesToList(essences).map((e) => {
            if (this.hasTravelerEquipped(t, e)) {
                return {
                    ...e,
                    remaining_pool: 0,
                };
            }
            return e;
        });
    }

    private static hasTravelerEquipped(t: Ref<BuildTraveler>, item: Item<ItemType>): boolean {
        if (item.kind == "memory") {
            return t.value.loadout.memories.some((m) => m.slot?.id == item.id);
        } else {
            return t.value.loadout.memories.some((m) => m.essences.some((e) => e.slot?.id == item.id));
        }
    }

    public hasEquipped(item: Item<ItemType>): boolean {
        return LoadoutManager.hasTravelerEquipped(this.traveler, item);
    }

    public canEquip(item: Item<"memory"> | undefined): boolean {
        if (!item) {
            return true;
        }
        if (item.data.rarity == "Character") {
            return item.data.traveler == this.traveler.value.id;
        }
        return true;
    }

    public loadTraveler(newTraveler: BuildTraveler, memories: Memories) {
        this.traveler.value.id = newTraveler.id;
        this.traveler.value.data = newTraveler.data;
        this.traveler.value.loadout.memories = newTraveler.loadout.memories;
        this.traveler.value.loadout.dash = newTraveler.loadout.dash;
        this.traveler.value.loadout.passive = newTraveler.loadout.passive;
        this.memoryList.value = LoadoutManager.computeMemoryList(this.traveler, memories);
        this.triggerChange();
    }

    public changeTraveler(newTraveler: TravelerName, travelers: Travelers, memories: Memories) {
        if (this.traveler.value.id == newTraveler) {
            return;
        }
        this.traveler.value.id = newTraveler;
        this.traveler.value.data = travelers[newTraveler];
        this.traveler.value.loadout.memories.forEach((ms, i) => {
            if (!this.canEquip(ms.slot)) {
                this.socket(undefined, i);
            }
        });
        this.traveler.value.loadout.dash = mapMemory(travelers[newTraveler].loadoutMovement[0], memories);
        this.traveler.value.loadout.passive = mapMemory(travelers[newTraveler].loadoutTrait[0], memories);
        this.memoryList.value = LoadoutManager.computeMemoryList(this.traveler, memories);
        this.triggerChange();
    }

    private triggerChange() {
        if (this.onTravelerChange) {
            this.onTravelerChange(this.traveler.value);
        }
    }

    public memory(slot: number) {
        return this.traveler.value.loadout.memories[slot].slot;
    }

    public get(slot: number): Item<"memory"> | undefined;
    public get(slot: [number, number]): Item<"essence"> | undefined;
    public get(slot: number | [number, number]): Item<ItemType> | undefined {
        if (slot instanceof Array) {
            return this.traveler.value.loadout.memories[slot[0]].essences[slot[1]].slot;
        }
        return this.traveler.value.loadout.memories[slot].slot;
    }

    private addToPool(item: Item<ItemType> | ItemId<ItemType>) {
        const id = item instanceof Object ? item.id : item;
        const kind = item instanceof Object ? item.kind : item.startsWith("Gem") ? "essene" : "memory";
        if (kind == "memory") {
            this.memoryList.value[this.memoryList.value.findIndex((m) => m.id == id)].remaining_pool++;
        } else {
            this.essenceList.value[this.essenceList.value.findIndex((m) => m.id == id)].remaining_pool++;
        }
    }

    private removeFromPool(item: Item<ItemType> | ItemId<ItemType>) {
        const id = item instanceof Object ? item.id : item;
        const kind = item instanceof Object ? item.kind : item.startsWith("Gem") ? "essene" : "memory";
        if (kind == "memory") {
            this.memoryList.value[this.memoryList.value.findIndex((m) => m.id == id)].remaining_pool--;
        } else {
            this.essenceList.value[this.essenceList.value.findIndex((m) => m.id == id)].remaining_pool--;
        }
    }

    public socket(item: Item<"memory"> | undefined, slot: number): void;
    public socket(item: Item<"essence"> | undefined, slot: [number, number]): void;
    public socket(item: Item<ItemType> | undefined, slot: number | [number, number]): void {
        if (slot instanceof Array) {
            const essence = item as Item<"essence"> | undefined;
            const replaced = this.traveler.value.loadout.memories[slot[0]].essences[slot[1]].slot;
            this.traveler.value.loadout.memories[slot[0]].essences[slot[1]].slot = essence;
            if (replaced) {
                this.addToPool(replaced);
            }
            if (essence) {
                this.removeFromPool(essence);
            }
        } else {
            const memory = item as Item<"memory"> | undefined;
            const replaced = this.traveler.value.loadout.memories[slot].slot;
            this.traveler.value.loadout.memories[slot].slot = memory;
            if (replaced) {
                this.addToPool(replaced);
                if (replaced.data.rarity == "Character") {
                    if (this.traveler.value.data.loadoutQ.includes(replaced.id)) {
                        this.traveler.value.data.loadoutQ
                            .filter((i) => i != replaced.id)
                            .forEach((i) => this.addToPool(i));
                    } else {
                        this.traveler.value.data.loadoutR
                            .filter((i) => i != replaced.id)
                            .forEach((i) => this.addToPool(i));
                    }
                }
            }
            if (memory) {
                this.removeFromPool(memory);
                if (memory.data.rarity == "Character") {
                    if (this.traveler.value.data.loadoutQ.includes(memory.id)) {
                        this.traveler.value.data.loadoutQ
                            .filter((i) => i != memory.id)
                            .forEach((i) => this.removeFromPool(i));
                    } else {
                        this.traveler.value.data.loadoutR
                            .filter((i) => i != memory.id)
                            .forEach((i) => this.removeFromPool(i));
                    }
                }
            }
        }
        this.triggerChange();
    }
}

export {
    type TravelerName,
    type TravelerData,
    type Travelers,
    type Traveler,
    type BuildTraveler,
    type SerializedTraveler,
    initTraveler,
    serializeBuild,
    deserializeBuild,
    LoadoutManager,
};
