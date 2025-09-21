import type { Item, ItemType } from "./item";

interface ItemSocket<T extends ItemType> {
    slot?: Item<T> | undefined;
}
interface EssenceSocket extends ItemSocket<"essence"> {}
interface MemorySocket extends ItemSocket<"memory"> {
    essences: [EssenceSocket, EssenceSocket, EssenceSocket];
}

export type { ItemSocket, EssenceSocket, MemorySocket };
