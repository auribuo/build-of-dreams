import type { Item } from "./item";

class ItemSocket<T extends "essence" | "memory"> {
    private kind: T;
    public slot: Item<T> | undefined;
    constructor(kind: T) {
        this.kind = kind;
    }
    canSocket: (item: Item<T>) => boolean = (item): boolean => {
        if (this.slot !== undefined) {
            return false;
        }
        return this.kind === item.type;
    };
}

class EssenceSocket extends ItemSocket<"essence"> {
    constructor() {
        super("essence");
    }
}

class MemorySocket extends ItemSocket<"memory"> {
    constructor() {
        super("memory");
    }
    public essences: [EssenceSocket, EssenceSocket, EssenceSocket] = [
        new EssenceSocket(),
        new EssenceSocket(),
        new EssenceSocket(),
    ];
}

export { ItemSocket, EssenceSocket, MemorySocket };
