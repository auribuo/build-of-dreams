const rarities = ["Common", "Rare", "Epic", "Legendary", "Unique", "Character", "Identity"] as const;
type Rarity = (typeof rarities)[number];

const compareRarity = (a: Rarity, b: Rarity): number => {
    return rarities.indexOf(a) - rarities.indexOf(b);
};

export { rarities, type Rarity, compareRarity };
