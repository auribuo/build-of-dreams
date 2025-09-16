const rarities = ["Common", "Rare", "Epic", "Legendary", "Unique", "Traveler"] as const;
type Rarity = (typeof rarities)[number];

export { rarities, type Rarity };
