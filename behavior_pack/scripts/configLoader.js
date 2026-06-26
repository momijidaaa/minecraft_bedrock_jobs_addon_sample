import { world } from "@minecraft/server";

const CUSTOM_JOBS_KEY = "jobs:customJobs";

const RAW_CONFIG = {
  system: {
    job_limit: 3,
    max_level: 50,
    announce_levelup: true,
    levelup_sound: "random.levelup",
    actionbar_reward_display: true,
    coin_decimals: 2,
    xp_formula_base: 100,
    xp_formula_multiplier: 1.5,
    global_xp_rate: 1.0,
    global_coin_rate: 1.0,
    levelup_title: true,
    levelup_title_color: "\u00A7e",
    levelup_subtitle_color: "\u00A7f"
  },
  currency: { name: "\u00A5", symbol: "\u00A5" },
  jobs: {
    woodcutter: { enabled: true, xp_rate: 1.0, coin_rate: 1.0 },
    miner:      { enabled: true, xp_rate: 1.0, coin_rate: 1.0 },
    farmer:     { enabled: true, xp_rate: 1.0, coin_rate: 1.0 },
    hunter:     { enabled: true, xp_rate: 1.0, coin_rate: 1.0 },
    fisherman:  { enabled: true, xp_rate: 1.0, coin_rate: 1.0 },
    builder:    { enabled: true, xp_rate: 1.0, coin_rate: 0.6 }
  }
};

let _config = null;

export function getConfig() {
  if (_config) return _config;
  _config = { ...RAW_CONFIG };
  return _config;
}

export function xpForLevel(level) {
  const c = getConfig().system;
  return Math.floor(c.xp_formula_base * Math.pow(c.xp_formula_multiplier, level - 1));
}

export function registerCustomJob(jobId, jobDef) {
  try {
    const raw = world.getDynamicProperty(CUSTOM_JOBS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[jobId] = jobDef;
    world.setDynamicProperty(CUSTOM_JOBS_KEY, JSON.stringify(map));
    return true;
  } catch { return false; }
}

export function unregisterCustomJob(jobId) {
  try {
    const raw = world.getDynamicProperty(CUSTOM_JOBS_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw);
    if (!map[jobId]) return false;
    delete map[jobId];
    world.setDynamicProperty(CUSTOM_JOBS_KEY, JSON.stringify(map));
    return true;
  } catch { return false; }
}
