import type { EssenceData, EssenceName, Essences } from "./essence";
import type { Memories, MemoryData, MemoryName } from "./memories";
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
    remaining_pool: T extends "memory" ? number : 0 | 1;
}

type Memory = Item<"memory">;
type Essence = Item<"essence">;

export function mapMemory(id: MemoryName, m: Memories): Memory;
export function mapMemory(id: undefined, m: Memories): undefined;
export function mapMemory(id: MemoryName | undefined, m: Memories): Memory | undefined;
export function mapMemory(id: MemoryName | undefined, m: Memories): Memory | undefined {
    if (id === undefined) {
        return undefined;
    }
    const data = m[id];
    const max_pool = data.rarity == "Character" ? (data.traveler == "Hero_Bismuth" ? 2 : 1) : 4;
    return {
        id,
        data,
        max_pool,
        kind: "memory",
        remaining_pool: max_pool,
    };
}

export function mapEssence(id: EssenceName, e: Essences): Essence;
export function mapEssence(id: undefined, e: Essences): undefined;
export function mapEssence(id: EssenceName | null | undefined, e: Essences): Essence | undefined;
export function mapEssence(id: EssenceName | null | undefined, e: Essences): Essence | undefined {
    if (id === undefined || id === null) {
        return undefined;
    }
    return {
        id,
        data: e[id],
        kind: "essence",
        max_pool: 1,
        remaining_pool: 1,
    };
}

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
        return `<span style="color: ${color}; line-height: 22.4px">${content}</span>`;
    });

    const spriteRx = /<sprite=([0-9]+)>/gm;
    desc = desc.replace(spriteRx, (_match, _spriteId) => {
        return `<img src="/build-of-dreams/data/!Sprites/${_spriteId}.png" height="22" width="22" style="display: inline; vertical-align: middle" />`;
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
    compareItem,
    itemType,
    renderDescription,
};
