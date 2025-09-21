import memories from "../../public/data/en-US/memories.json";
import { mapMemory, type Memory } from "./item";
import type { Rarity } from "./rarity";
import type { TravelerName } from "./travelers";

type MemoryName = keyof typeof memories;
type MemoryData = {
    name: string;
    cooldownTime: number;
    maxCharges: number;
    addedCharges: number;
    description: string;
    rawDesc: string;
    rawDescVars: {
        rendered: string;
        format: string;
        raw: string;
        scalingType: "basic" | "unknown";
        data: {
            basicConstant: number;
            basicAP: number;
            basicAD: number;
            basicLvl: number;
            basicAddedMultiplierPerLevel: number;
        };
    }[];
    shortDescription: string;
    rarity: Rarity;
    type: "Normal" | "Ultimate";
    traveler: TravelerName | "";
    travelerMemoryLocation: "Q" | "R" | "Movement" | "";
    tags: string[];
    image: `${MemoryName}.png`;
    lore: string;
    achievementKey: string;
    achievementName: string;
    achievementDescription: string;
};

type Memories = {
    [K in MemoryName]: MemoryData;
};

const memoriesToList = (memories: Memories): Memory[] => {
    return Object.keys(memories).map((id) => mapMemory(id as MemoryName, memories));
};

export { type MemoryName, type MemoryData, type Memories, memoriesToList };
