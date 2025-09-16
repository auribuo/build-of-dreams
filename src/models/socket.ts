import type { Item } from "./item";

class ItemSocket<T extends "essence" | "memory"> {
    private kind: T;
    public slot: Item<T> | undefined;
    constructor(kind: T, initialItem: Item<T> | undefined) {
        this.kind = kind;
        this.slot = initialItem;
    }
    canSocket: (item: Item<T>) => boolean = (item): boolean => {
        if (this.slot !== undefined) {
            return false;
        }
        return this.kind === item.type;
    };
}

class EssenceSocket extends ItemSocket<"essence"> {
    constructor(initialItem: Item<"essence"> | undefined = undefined) {
        super("essence", initialItem);
    }
}

class MemorySocket extends ItemSocket<"memory"> {
    constructor(initialItem: Item<"memory"> | undefined = undefined) {
        super("memory", initialItem);
    }
    public essences: [EssenceSocket, EssenceSocket, EssenceSocket] = [
        new EssenceSocket(),
        new EssenceSocket(),
        new EssenceSocket(),
    ];
}

export { ItemSocket, EssenceSocket, MemorySocket };
