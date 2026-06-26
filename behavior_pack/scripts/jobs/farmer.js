export const JOB_ID = "farmer";
export const JOB_META = {
  name: "\u8fb2\u592b",
  tag: "[\u8fb2]",
  color: "\u00A7a",
  description: "\u4f5c\u7269\u3092\u53ce\u7a6b\u3057\u3066XP\u3068\u5831\u916c\u3092\u7372\u5f97"
};

// require_age: その成熟度以上でないと報酬なし
// age_state: ブロックステートのキー名
export const BREAK_REWARDS = {
  "minecraft:wheat":            { xp: [2.0, 4.0], coins: [0.5, 1.5], require_age: 7, age_state: "growth" },
  "minecraft:carrots":          { xp: [2.0, 4.0], coins: [0.5, 1.5], require_age: 7, age_state: "growth" },
  "minecraft:potatoes":         { xp: [2.0, 4.0], coins: [0.5, 1.5], require_age: 7, age_state: "growth" },
  "minecraft:beetroot":         { xp: [2.0, 4.0], coins: [0.5, 1.5], require_age: 3, age_state: "growth" },
  "minecraft:melon_block":      { xp: [3.5, 6.5], coins: [1.0, 3.0] },
  "minecraft:pumpkin":          { xp: [3.5, 6.5], coins: [1.0, 3.0] },
  "minecraft:sweet_berry_bush": { xp: [1.5, 3.0], coins: [0.3, 1.2], require_age: 3, age_state: "growth" },
  "minecraft:nether_wart":      { xp: [3.0, 5.5], coins: [1.0, 2.5], require_age: 3, age_state: "age" },
  "minecraft:cocoa":            { xp: [2.0, 4.0], coins: [0.5, 1.5], require_age: 2, age_state: "cocoa_age" },
  "minecraft:cave_vines":       { xp: [1.0, 2.5], coins: [0.2, 0.8] },
  "minecraft:cave_vines_body_with_berries": { xp: [1.5, 3.0], coins: [0.4, 1.2] },
  "minecraft:torchflower_crop": { xp: [5.0, 8.0], coins: [2.0, 5.0], require_age: 1, age_state: "growth" },
  "minecraft:pitcher_crop":     { xp: [5.0, 8.0], coins: [2.0, 5.0], require_age: 4, age_state: "growth" },
  "minecraft:resin_clump":      { xp: [2.0, 4.0], coins: [0.8, 2.0] },
};
