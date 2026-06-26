export const JOB_ID = "woodcutter";
export const JOB_META = {
  name: "木こり",
  tag: "[木]",
  color: "§6",
  description: "木を伐採してXPと報酬を獲得"
};


// [xp_min, xp_max], [coin_min, coin_max]
export const BREAK_REWARDS = {
  // 普通の木
  "minecraft:oak_log":          { xp: [2.0, 4.5],  coins: [0.5, 1.5] },
  "minecraft:spruce_log":       { xp: [2.0, 4.5],  coins: [0.5, 1.5] },
  "minecraft:birch_log":        { xp: [2.0, 4.5],  coins: [0.5, 1.5] },
  "minecraft:jungle_log":       { xp: [3.0, 5.5],  coins: [0.8, 2.0] },
  "minecraft:acacia_log":       { xp: [2.0, 4.5],  coins: [0.5, 1.5] },
  "minecraft:dark_oak_log":     { xp: [3.0, 5.5],  coins: [0.8, 2.0] },
  "minecraft:mangrove_log":     { xp: [3.0, 5.5],  coins: [0.8, 2.0] },
  "minecraft:cherry_log":       { xp: [3.0, 5.5],  coins: [0.8, 2.0] },
  "minecraft:pale_oak_log":     { xp: [3.0, 5.5],  coins: [0.8, 2.0] },
  // 剥いた木
  "minecraft:stripped_oak_log":       { xp: [2.5, 5.0], coins: [0.6, 1.8] },
  "minecraft:stripped_spruce_log":    { xp: [2.5, 5.0], coins: [0.6, 1.8] },
  "minecraft:stripped_birch_log":     { xp: [2.5, 5.0], coins: [0.6, 1.8] },
  "minecraft:stripped_jungle_log":    { xp: [3.5, 6.0], coins: [1.0, 2.5] },
  "minecraft:stripped_acacia_log":    { xp: [2.5, 5.0], coins: [0.6, 1.8] },
  "minecraft:stripped_dark_oak_log":  { xp: [3.5, 6.0], coins: [1.0, 2.5] },
  "minecraft:stripped_mangrove_log":  { xp: [3.5, 6.0], coins: [1.0, 2.5] },
  "minecraft:stripped_cherry_log":    { xp: [3.5, 6.0], coins: [1.0, 2.5] },
  "minecraft:stripped_pale_oak_log":  { xp: [3.5, 6.0], coins: [1.0, 2.5] },

  // ネザー系
  "minecraft:crimson_stem":     { xp: [4.0, 7.0],  coins: [1.5, 3.0] },
  "minecraft:warped_stem":      { xp: [4.0, 7.0],  coins: [1.5, 3.0] },
  "minecraft:stripped_crimson_stem": { xp: [4.5, 7.5], coins: [1.8, 3.5] },
  "minecraft:stripped_warped_stem":  { xp: [4.5, 7.5], coins: [1.8, 3.5] },
  // 竹・葉
  "minecraft:bamboo_block":     { xp: [1.0, 2.5],  coins: [0.2, 0.8] },
  "minecraft:stripped_bamboo_block": { xp: [1.2, 3.0], coins: [0.3, 1.0] },
  "minecraft:oak_leaves":       { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:spruce_leaves":    { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:birch_leaves":     { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:jungle_leaves":    { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:acacia_leaves":    { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:dark_oak_leaves":  { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:mangrove_leaves":  { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:cherry_leaves":    { xp: [0.5, 1.0],  coins: 0 },
  "minecraft:azalea_leaves":    { xp: [0.3, 0.8],  coins: 0 },
  "minecraft:flowering_azalea_leaves": { xp: [0.5, 1.0], coins: [0.0, 0.3] },
};
