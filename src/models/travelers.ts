import travelers from "../../public/data/en-US/travelers.json";
import { MemorySocket } from "./socket";
import type { Memories, MemoryName } from "./memories";
import { mapMemory } from "./item";

const travelerNames = Object.keys(travelers) as (keyof typeof travelers)[];
type TravelerName = (typeof travelerNames)[number];
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

interface Passive {
    name: string;
    description: string;
}

interface Dash {
    name: string;
    description: string;
}

type Traveler = {
    id: TravelerName;
    data: TravelerData;
};

type BuildTraveler = Traveler & {
    loadout: {
        memories: [MemorySocket, MemorySocket, MemorySocket, MemorySocket];
        dash: Dash;
        passive: Passive;
    };
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
            dash: travelers[id].loadoutMovement.map((id) => memories[id])[0]!,
            passive: travelers[id].loadoutTrait.map((id) => memories[id])[0]!,
        },
    };
};

export {
    travelerNames,
    type TravelerName,
    type TravelerData,
    type Travelers,
    type Traveler,
    type BuildTraveler,
    initTraveler,
};
