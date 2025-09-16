import type { EssenceData, EssenceName } from "./essence";
import type { MemoryData, MemoryName } from "./memories";
import { compareRarity } from "./rarity";

const itemTypes = ["essence", "memory"] as const;
type ItemType = (typeof itemTypes)[number];
type ItemId<T extends ItemType> = T extends "memory" ? MemoryName : EssenceName;
type ItemData<T extends ItemType> = T extends "memory" ? MemoryData : EssenceData;

interface Item<T extends ItemType> {
    id: ItemId<T>;
    name: string;
    description: string;
    data: ItemData<T>;
    type: T;
    max_pool: T extends "memory" ? 1 | 2 | 4 : 1;
    remaining_pool: T extends "memory" ? 0 | 1 | 2 | 3 | 4 : 0 | 1;
}

type Memory = Item<"memory">;
type Essence = Item<"essence">;

const mapMemory = (kv: [string, MemoryData]): Memory => {
    const max_pool = kv[1].rarity == "Character" ? (kv[1].traveler == "Hero_Bismuth" ? 2 : 1) : 4;
    return {
        id: kv[0] as MemoryName,
        name: kv[1].name,
        data: kv[1],
        description: kv[1].description,
        type: "memory",
        max_pool: max_pool,
        remaining_pool: max_pool,
    };
};

const mapEssence = (kv: [string, EssenceData]): Essence => {
    return {
        id: kv[0] as EssenceName,
        name: kv[1].name,
        data: kv[1],
        description: kv[1].description,
        type: "essence",
        max_pool: 1,
        remaining_pool: 1,
    };
};

const compareItem = <T extends ItemType>(a: Item<T>, b: Item<T>): number => {
    const rc = compareRarity(a.data.rarity, b.data.rarity);
    if (rc === 0) {
        return a.name.localeCompare(b.name);
    }
    return rc;
};

export { itemTypes, type ItemType, type Item, type Essence, type Memory, mapEssence, mapMemory, compareItem };
