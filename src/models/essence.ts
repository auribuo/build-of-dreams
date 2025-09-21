import type essences from "../../public/data/en-US/essences.json";
import { mapEssence, type Essence } from "./item";
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

const essencesToList = (essences: Essences): Essence[] => {
    return Object.keys(essences).map((id) => mapEssence(id as EssenceName, essences));
};

export { type EssenceName, type EssenceData, type Essences, essencesToList };
