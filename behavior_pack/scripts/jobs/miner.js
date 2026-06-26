export const JOB_ID = "miner";
export const JOB_META = {
  name: "\u9271\u592b",
  tag: "[\u9271]",
  color: "\u00A77",
  description: "\u9271\u77f3\u3092\u63a1\u6398\u3057\u3066XP\u3068\u5831\u916c\u3092\u7372\u5f97"
};

export const BREAK_REWARDS = {
  // 石系
  "minecraft:stone":                    { xp: [0.3, 0.8],  coins: [0.01, 0.05] },
  "minecraft:cobblestone":              { xp: [0.3, 0.8],  coins: [0.01, 0.05] },
  "minecraft:mossy_cobblestone":        { xp: [0.5, 1.0],  coins: [0.02, 0.08] },
  "minecraft:smooth_stone":             { xp: [0.3, 0.8],  coins: [0.01, 0.05] },
  "minecraft:stone_bricks":             { xp: [0.3, 0.8],  coins: [0.01, 0.05] },
  "minecraft:cracked_stone_bricks":     { xp: [0.3, 0.8],  coins: [0.01, 0.05] },
  "minecraft:mossy_stone_bricks":       { xp: [0.5, 1.0],  coins: [0.02, 0.08] },
  "minecraft:chiseled_stone_bricks":    { xp: [0.5, 1.0],  coins: [0.02, 0.08] },
  "minecraft:granite":                  { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:polished_granite":         { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:diorite":                  { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:polished_diorite":         { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:andesite":                 { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:polished_andesite":        { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:calcite":                  { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:tuff":                     { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:tuff_bricks":              { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:chiseled_tuff":            { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:polished_tuff":            { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:dripstone_block":          { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:pointed_dripstone":        { xp: [0.3, 0.8],  coins: [0.01, 0.05] },
  // 深層岩系
  "minecraft:deepslate":                { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:cobbled_deepslate":        { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:polished_deepslate":       { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  "minecraft:deepslate_bricks":         { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  "minecraft:deepslate_tiles":          { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  "minecraft:chiseled_deepslate":       { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  "minecraft:cracked_deepslate_bricks": { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  "minecraft:cracked_deepslate_tiles":  { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  // 砂岩
  "minecraft:sandstone":                { xp: [0.4, 1.0],  coins: [0.01, 0.06] },
  "minecraft:red_sandstone":            { xp: [0.4, 1.0],  coins: [0.01, 0.06] },
  "minecraft:smooth_sandstone":         { xp: [0.4, 1.0],  coins: [0.01, 0.06] },
  "minecraft:smooth_red_sandstone":     { xp: [0.4, 1.0],  coins: [0.01, 0.06] },
  "minecraft:chiseled_sandstone":       { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:chiseled_red_sandstone":   { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  // 石炭
  "minecraft:coal_ore":                 { xp: [2.0, 4.0],  coins: [0.5, 1.5]  },
  "minecraft:deepslate_coal_ore":       { xp: [2.5, 4.5],  coins: [0.6, 1.8]  },
  // 鉄
  "minecraft:iron_ore":                 { xp: [4.0, 7.0],  coins: [1.5, 3.0]  },
  "minecraft:deepslate_iron_ore":       { xp: [4.5, 7.5],  coins: [1.8, 3.5]  },
  // 銅
  "minecraft:copper_ore":               { xp: [3.0, 5.5],  coins: [1.0, 2.5]  },
  "minecraft:deepslate_copper_ore":     { xp: [3.5, 6.0],  coins: [1.2, 2.8]  },
  // 金
  "minecraft:gold_ore":                 { xp: [5.0, 9.0],  coins: [2.0, 4.5]  },
  "minecraft:deepslate_gold_ore":       { xp: [5.5, 9.5],  coins: [2.2, 5.0]  },
  // レッドストーン
  "minecraft:redstone_ore":             { xp: [4.0, 8.0],  coins: [1.5, 3.5]  },
  "minecraft:deepslate_redstone_ore":   { xp: [4.5, 8.5],  coins: [1.8, 4.0]  },
  // ラピスラズリ
  "minecraft:lapis_ore":                { xp: [4.0, 8.0],  coins: [1.5, 3.5]  },
  "minecraft:deepslate_lapis_ore":      { xp: [4.5, 8.5],  coins: [1.8, 4.0]  },
  // ダイヤ
  "minecraft:diamond_ore":              { xp: [12.0, 18.0], coins: [6.0, 10.0] },
  "minecraft:deepslate_diamond_ore":    { xp: [13.0, 20.0], coins: [7.0, 12.0] },
  // エメラルド
  "minecraft:emerald_ore":              { xp: [16.0, 24.0], coins: [10.0, 15.0]},
  "minecraft:deepslate_emerald_ore":    { xp: [18.0, 26.0], coins: [12.0, 18.0]},
  // ネザー
  "minecraft:netherrack":               { xp: [0.3, 0.8],  coins: [0.01, 0.04] },
  "minecraft:basalt":                   { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:smooth_basalt":            { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:polished_basalt":          { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  "minecraft:blackstone":               { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:polished_blackstone":      { xp: [0.6, 1.4],  coins: [0.03, 0.1]  },
  "minecraft:polished_blackstone_bricks":{ xp: [0.7, 1.5], coins: [0.04, 0.12] },
  "minecraft:nether_bricks":            { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:red_nether_bricks":        { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:nether_quartz_ore":        { xp: [4.0, 7.0],  coins: [1.5, 3.0]  },
  "minecraft:nether_gold_ore":          { xp: [5.0, 9.0],  coins: [2.0, 4.5]  },
  "minecraft:ancient_debris":           { xp: [25.0, 35.0], coins: [15.0, 25.0]},
  "minecraft:glowstone":                { xp: [1.5, 3.0],  coins: [0.3, 1.0]  },
  "minecraft:magma":                    { xp: [1.0, 2.5],  coins: [0.1, 0.5]  },
  "minecraft:soul_sand":                { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  "minecraft:soul_soil":                { xp: [0.5, 1.2],  coins: [0.02, 0.08] },
  // エンド
  "minecraft:end_stone":                { xp: [1.0, 2.5],  coins: [0.1, 0.5]  },
  "minecraft:end_stone_bricks":         { xp: [1.2, 2.8],  coins: [0.15, 0.6] },
  // その他
  "minecraft:obsidian":                 { xp: [3.0, 6.0],  coins: [1.0, 3.0]  },
  "minecraft:crying_obsidian":          { xp: [3.0, 6.0],  coins: [1.0, 3.0]  },
  "minecraft:amethyst_block":           { xp: [2.0, 4.5],  coins: [0.5, 2.0]  },
  "minecraft:budding_amethyst":         { xp: [3.0, 6.0],  coins: [1.0, 3.0]  },
  "minecraft:amethyst_cluster":         { xp: [1.5, 3.5],  coins: [0.3, 1.2]  },
  "minecraft:large_amethyst_bud":       { xp: [1.0, 2.5],  coins: [0.2, 0.8]  },
  "minecraft:medium_amethyst_bud":      { xp: [0.8, 2.0],  coins: [0.1, 0.5]  },
  "minecraft:small_amethyst_bud":       { xp: [0.5, 1.5],  coins: [0.05, 0.3] },
};
