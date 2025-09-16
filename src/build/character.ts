import type { Memory } from "./item";
import type { MemorySocket } from "./socket";

interface Passive {
    name: string;
    description: string;
}

interface Dash {
    name: string;
    description: string;
}

interface Character {
    memories: [MemorySocket, MemorySocket, MemorySocket, MemorySocket];
    passive: Passive;
    dash: Dash;
    intrinsics: {
        memories: [Memory[], Memory[]];
        passives: Passive[];
        dashes: Dash[];
    };
}

export { type Dash, type Passive, type Character };
