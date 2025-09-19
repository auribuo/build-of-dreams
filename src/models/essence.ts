import type essences from "../../public/data/en-US/essences.json";
import type { Rarity } from "./rarity";

type EssenceName = keyof typeof essences;
type EssenceData = {
    name: string;
    description: string;
    rawDesc: string;
    rawDescVars: {
        rendered: string;
        format: string;
        raw: string;
        scalingType: string;
        data: {
            basicConstant: number;
            basicAP: number;
            basicAD: number;
            basicLvl: number;
            basicAddedMultiplierPerLevel: number;
        };
    }[];
    rarity: Rarity;
    tags: string[];
    image: `${EssenceName}.png`;
    lore: string;
    achievementKey: "";
    achievementName: "";
    achievementDescription: "";
};

type Essences = {
    [K in EssenceName]: EssenceData;
};

export { type EssenceName, type EssenceData, type Essences };
