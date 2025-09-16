import type { Rarity } from "./rarity";
import memories from "../../data/memories.json";
import essences from "../../data/essences.json";

const itemTypes = ["essence", "memory"] as const;
type ItemType = (typeof itemTypes)[number];
type MemoryName = keyof typeof memories;
type EssenceName = keyof typeof essences;
type ItemId<T extends ItemType> = T extends "memory" ? `mem.${MemoryName}` : `ess.${EssenceName}`;
type ItemName<T extends ItemType> = T extends "memory" ? MemoryName : EssenceName;

interface Item<T extends ItemType> {
    name: ItemName<T>;
    id: ItemId<T>;
    description: string;
    rarity: Rarity;
    type: T;
}

type Memory = Item<"memory">;
type Essence = Item<"essence">;

const memory = (m: Omit<Memory, "type">): Memory => {
    return {
        ...m,
        type: "memory",
    };
};

const essence = (e: Omit<Essence, "type">): Essence => {
    return {
        ...e,
        type: "essence",
    };
};
export { itemTypes, type ItemType, type Item, type Essence, type Memory, essence, memory };
