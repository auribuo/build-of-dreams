import type memories from "../../public/data/en-US/memories.json";
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
    travelerMemoryLocation: "Q" | "R" | "";
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

export { type MemoryName, type MemoryData, type Memories };
