import type travelers from "../../public/data/en-US/travelers.json";
import { MemorySocket } from "./socket";
import type { Memories, MemoryName } from "./memories";
import { mapMemory, type Item, type ItemId, type Memory } from "./item";
import LZString from "lz-string";
import type { Reactive } from "vue";

type TravelerName = keyof typeof travelers;
type TravelerData = {
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
};

type Travelers = {
    [K in TravelerName]: TravelerData;
};

type Traveler = {
    id: TravelerName;
    data: TravelerData;
};

type BuildTraveler = Traveler & {
    loadout: {
        memories: [MemorySocket, MemorySocket, MemorySocket, MemorySocket];
        dash: Item<"memory">;
        passive: Item<"memory">;
    };
};

type SerializedEssenceSocket = {
    i: ItemId<"essence"> | undefined;
};
type SerializedMemorySocket = {
    i: ItemId<"memory"> | undefined;
    e: [SerializedEssenceSocket, SerializedEssenceSocket, SerializedEssenceSocket];
};

type SerializedTraveler = {
    i: TravelerName;
    l: {
        m: [SerializedMemorySocket, SerializedMemorySocket, SerializedMemorySocket, SerializedMemorySocket];
        d: ItemId<"memory">;
        p: ItemId<"memory">;
    };
};

const serializeBuild = <T extends BuildTraveler | Reactive<BuildTraveler>>(traveler: T): string => {
    const ser: SerializedTraveler = {
        i: traveler.id,
        l: {
            m: [
                {
                    i: traveler.loadout.memories[0].slot?.id,
                    e: [
                        { i: traveler.loadout.memories[0].essences[0].slot?.id },
                        { i: traveler.loadout.memories[0].essences[1].slot?.id },
                        { i: traveler.loadout.memories[0].essences[2].slot?.id },
                    ],
                },
                {
                    i: traveler.loadout.memories[1].slot?.id,
                    e: [
                        { i: traveler.loadout.memories[1].essences[0].slot?.id },
                        { i: traveler.loadout.memories[1].essences[1].slot?.id },
                        { i: traveler.loadout.memories[1].essences[2].slot?.id },
                    ],
                },
                {
                    i: traveler.loadout.memories[2].slot?.id,
                    e: [
                        { i: traveler.loadout.memories[2].essences[0].slot?.id },
                        { i: traveler.loadout.memories[2].essences[1].slot?.id },
                        { i: traveler.loadout.memories[2].essences[2].slot?.id },
                    ],
                },
                {
                    i: traveler.loadout.memories[3].slot?.id,
                    e: [
                        { i: traveler.loadout.memories[3].essences[0].slot?.id },
                        { i: traveler.loadout.memories[3].essences[1].slot?.id },
                        { i: traveler.loadout.memories[3].essences[2].slot?.id },
                    ],
                },
            ],
            d: traveler.loadout.dash.id,
            p: traveler.loadout.passive.id,
        },
    };
    const s = JSON.stringify(ser);
    return LZString.compressToBase64(s);
};

const initTraveler = (id: TravelerName, travelers: Travelers, memories: Memories): BuildTraveler => {
    return {
        id: id,
        data: travelers[id],
        loadout: {
            memories: [
                new MemorySocket(travelers[id].loadoutQ.map((id) => mapMemory([id, memories[id]]))[0]),
                new MemorySocket(),
                new MemorySocket(),
                new MemorySocket(travelers[id].loadoutR.map((id) => mapMemory([id, memories[id]]))[0]),
            ],
            dash: travelers[id].loadoutMovement.map((id) => mapMemory([id, memories[id]]))[0]!,
            passive: travelers[id].loadoutTrait.map((id) => mapMemory([id, memories[id]]))[0]!,
        },
    };
};

const defaultQ = (traveler: TravelerName, travelers: Travelers, memories: Memories): Memory => {
    return travelers[traveler].loadoutQ.map((id) => mapMemory([id, memories[id]]))[0];
};

const defaultR = (traveler: TravelerName, travelers: Travelers, memories: Memories): Memory => {
    return travelers[traveler].loadoutR.map((id) => mapMemory([id, memories[id]]))[0];
};

export {
    type TravelerName,
    type TravelerData,
    type Travelers,
    type Traveler,
    type BuildTraveler,
    type SerializedTraveler,
    initTraveler,
    serializeBuild,
    defaultQ,
    defaultR,
};
