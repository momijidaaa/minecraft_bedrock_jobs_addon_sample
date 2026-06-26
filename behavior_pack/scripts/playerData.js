import { getConfig, xpForLevel } from "./configLoader.js";

const DATA_KEY = "jobs:playerData";
const BAL_KEY  = "jobs:balance";
const PLACED_KEY = "jobs:placedBlocks";

function getDefaultData() {
  return { jobs: {} };
}

export function loadPlayerData(player) {
  try {
    const raw = player.getDynamicProperty(DATA_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw);
  } catch { return getDefaultData(); }
}

export function savePlayerData(player, data) {
  player.setDynamicProperty(DATA_KEY, JSON.stringify(data));
}

export function getBalance(player) {
  try {
    const v = player.getDynamicProperty(BAL_KEY);
    return typeof v === "number" ? v : 0;
  } catch { return 0; }
}

export function addBalance(player, amount) {
  const current = getBalance(player);
  player.setDynamicProperty(BAL_KEY, current + amount);
}

export function setBalance(player, amount) {
  player.setDynamicProperty(BAL_KEY, amount);
}

function getPlacedSet(player) {
  try {
    const raw = player.getDynamicProperty(PLACED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}

function savePlacedSet(player, set) {
  let arr = Array.from(set);
  if (arr.length > 5000) arr = arr.slice(arr.length - 5000);
  player.setDynamicProperty(PLACED_KEY, JSON.stringify(arr));
}

export function isNewBlock(player, x, y, z) {
  const key = x + "," + y + "," + z;
  const set = getPlacedSet(player);
  if (set.has(key)) return false;
  set.add(key);
  savePlacedSet(player, set);
  return true;
}

export function hasJob(player, jobId) {
  return !!loadPlayerData(player).jobs[jobId];
}

export function getActiveJobs(player) {
  return Object.keys(loadPlayerData(player).jobs);
}

export function joinJob(player, jobId) {
  const data = loadPlayerData(player);
  if (data.jobs[jobId]) return false;
  data.jobs[jobId] = { level: 1, xp: 0.0, coinBuffer: 0.0, totalEarned: 0.0 };
  savePlayerData(player, data);
  return true;
}

export function leaveJob(player, jobId) {
  const data = loadPlayerData(player);
  if (!data.jobs[jobId]) return false;
  delete data.jobs[jobId];
  savePlayerData(player, data);
  return true;
}

export function getJobData(player, jobId) {
  const data = loadPlayerData(player);
  if (!data.jobs[jobId]) data.jobs[jobId] = { level: 1, xp: 0.0, coinBuffer: 0.0, totalEarned: 0.0 };
  return { data, jobData: data.jobs[jobId] };
}

export function getXPProgress(player, jobId) {
  const { jobData } = getJobData(player, jobId);
  const maxLevel = getConfig().system.max_level;
  if (jobData.level >= maxLevel) return { level: maxLevel, xp: 0, needed: 0, percent: 100 };
  const needed = xpForLevel(jobData.level);
  const percent = Math.min(100, Math.floor((jobData.xp / needed) * 100));
  return { level: jobData.level, xp: jobData.xp, needed, percent };
}

export function resolveRandom(val) {
  if (Array.isArray(val)) {
    const [min, max] = val;
    return min + Math.random() * (max - min);
  }
  return Number(val) || 0;
}

export function addJobReward(player, jobId, xpRaw, coinsRaw, xpRate, coinRate) {
  const cfg = getConfig();
  const { data, jobData } = getJobData(player, jobId);

  const _xpRate   = (cfg.system.global_xp_rate  ?? 1) * (xpRate  ?? 1);
  const _coinRate  = (cfg.system.global_coin_rate ?? 1) * (coinRate ?? 1);
  const decimals  = cfg.system.coin_decimals ?? 2;

  const gainedXP    = resolveRandom(xpRaw)   * _xpRate;
  const gainedCoins = resolveRandom(coinsRaw) * _coinRate;

  jobData.xp          += gainedXP;
  jobData.coinBuffer   = (jobData.coinBuffer  ?? 0) + gainedCoins;
  jobData.totalEarned  = (jobData.totalEarned ?? 0) + gainedCoins;

  addBalance(player, gainedCoins);

  let leveledUp = false;
  const maxLevel = cfg.system.max_level;
  while (jobData.level < maxLevel) {
    const needed = xpForLevel(jobData.level);
    if (jobData.xp >= needed) {
      jobData.xp -= needed;
      jobData.level++;
      leveledUp = true;
    } else break;
  }

  data.jobs[jobId] = jobData;
  savePlayerData(player, data);

  const neededXP = jobData.level < maxLevel ? xpForLevel(jobData.level) : 0;
  return {
    leveledUp,
    newLevel: jobData.level,
    currentLevel: jobData.level,
    currentXP: jobData.xp,
    neededXP,
    gainedXP:    Math.round(gainedXP * 100) / 100,
    gainedCoins: Math.round(gainedCoins * Math.pow(10, decimals)) / Math.pow(10, decimals)
  };
}

export function getAllJobsData(player) {
  return loadPlayerData(player).jobs;
}
