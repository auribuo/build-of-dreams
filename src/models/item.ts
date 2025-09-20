import type { EssenceData, EssenceName } from "./essence";
import type { MemoryData, MemoryName } from "./memories";
import { compareRarity } from "./rarity";

const itemTypes = ["essence", "memory"] as const;
type ItemType = (typeof itemTypes)[number];
type ItemId<T extends ItemType> = T extends "memory" ? MemoryName : EssenceName;
type ItemData<T extends ItemType> = T extends "memory" ? MemoryData : EssenceData;

interface Item<T extends ItemType> {
    id: ItemId<T>;
    data: ItemData<T>;
    kind: T;
    max_pool: T extends "memory" ? 1 | 2 | 4 : 1;
    remaining_pool: T extends "memory" ? 0 | 1 | 2 | 3 | 4 : 0 | 1;
}

type Memory = Item<"memory">;
type Essence = Item<"essence">;

const mapMemory = (kv: [string, MemoryData]): Memory => {
    const max_pool = kv[1].rarity == "Character" ? (kv[1].traveler == "Hero_Bismuth" ? 2 : 1) : 4;
    return {
        id: kv[0] as MemoryName,
        data: kv[1],
        kind: "memory",
        max_pool: max_pool,
        remaining_pool: max_pool,
    };
};

const mapEssence = (kv: [string, EssenceData]): Essence => {
    return {
        id: kv[0] as EssenceName,
        data: kv[1],
        kind: "essence",
        max_pool: 1,
        remaining_pool: 1,
    };
};

const compareItem = <T extends ItemType>(a: Item<T>, b: Item<T>): number => {
    const rc = compareRarity(a.data.rarity, b.data.rarity);
    if (rc === 0) {
        return a.data.name.localeCompare(b.data.name);
    }
    return rc;
};

const itemType = (id: ItemId<"essence" | "memory">): ItemType => {
    if (id.startsWith("Gem")) {
        return "essence";
    }
    return "memory";
};

type ItemList = Item<ItemType>[];

const renderDescription = (desc: string, breakLines: boolean = true): string => {
    const colorRx = /<color=([a-z]+|#[a-zA-Z0-9]{6})>(.+?)<\/color>/gm;
    desc = desc.replace(colorRx, (_match, color, content) => {
        return `<span style="color: ${color}">${content}</span>`;
    });

    const spriteRx = /<sprite=([0-9]+)>/gm;
    desc = desc.replace(spriteRx, (_match, _spriteId) => {
        return ""; // `<img src="/build-of-dreams/data/!Sprites/${_spriteId}.png" height="20" width="20" style="vertical-align: middle;" />`;
    });

    if (breakLines) {
        desc = desc.split(". ").join(". <br />");
    }
    return desc;
};

export {
    itemTypes,
    type ItemType,
    type Item,
    type ItemId,
    type Essence,
    type Memory,
    type ItemList,
    mapEssence,
    mapMemory,
    compareItem,
    itemType,
    renderDescription,
};
