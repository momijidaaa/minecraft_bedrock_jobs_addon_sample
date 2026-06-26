import { world } from "@minecraft/server";
import { getConfig } from "./configLoader.js";
import { ALL_JOBS } from "./jobs/index.js";
import { hasJob, addJobReward, isNewBlock } from "./playerData.js";

function getJobDef(jobId) {
  const cfg = getConfig();
  const jobCfg = cfg.jobs[jobId] ?? {};
  const jobDef = ALL_JOBS[jobId];
  if (!jobDef) return null;
  return {
    ...jobDef.meta,
    id: jobId,
    xp_rate:   jobCfg.xp_rate   ?? 1.0,
    coin_rate: jobCfg.coin_rate  ?? 1.0,
    actions:   jobDef.actions
  };
}

function notifyReward(player, job, result) {
  const cfg = getConfig();
  const sym = cfg.currency.symbol;

  if (cfg.system.actionbar_reward_display) {
    let msg = job.color + job.tag + " \u00A7f+" + result.gainedXP + "XP";
    if (result.gainedCoins > 0) msg += " \u00A7a+" + sym + result.gainedCoins;
    msg += "  \u00A77" + result.currentXP.toFixed(1) + "/" + result.neededXP;
    player.onScreenDisplay.setActionBar(msg);
  }

  if (result.leveledUp) {
    if (cfg.system.levelup_title) {
      const tc = cfg.system.levelup_title_color ?? "\u00A7e";
      const sc = cfg.system.levelup_subtitle_color ?? "\u00A7f";
      // title: "レベルアップ！"  subtitle: "Lv.1 → Lv.2"
      player.runCommand(
        "titleraw @s title {\"rawtext\":[{\"text\":\"" + tc + "\u30ec\u30d9\u30eb\u30a2\u30c3\u30d7!\"}]}"
      );
      player.runCommand(
        "titleraw @s subtitle {\"rawtext\":[{\"text\":\"" + sc +
        job.tag + " Lv." + (result.newLevel - 1) + " \u2192 Lv." + result.newLevel + "\"}]}"
      );
    }
    if (cfg.system.announce_levelup) {
      player.sendMessage(
        "\u00A76[Jobs] " + job.color + job.tag + " " + job.name +
        " \u00A7fLv.\u00A7e" + (result.newLevel - 1) + " \u00A7f\u2192 Lv.\u00A7e" + result.newLevel
      );
    }
    player.playSound(cfg.system.levelup_sound ?? "random.levelup");
  }
}

export function registerBreakEvents() {
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    const blockId = event.brokenBlockPermutation.type.id;
    const cfg = getConfig();

    for (const jobId of Object.keys(ALL_JOBS)) {
      if (!(cfg.jobs[jobId]?.enabled ?? true)) continue;
      if (!hasJob(player, jobId)) continue;
      const job = getJobDef(jobId);
      const reward = job?.actions?.break?.[blockId];
      if (!reward) continue;

      if (reward.require_age !== undefined) {
        const age = event.brokenBlockPermutation.getState(reward.age_state ?? "age");
        if (age === undefined || age < reward.require_age) continue;
      }

      const result = addJobReward(player, jobId, reward.xp, reward.coins, job.xp_rate, job.coin_rate);
      notifyReward(player, job, result);
    }
  });
}

export function registerKillEvents() {
  world.afterEvents.entityDie.subscribe((event) => {
    const killer = event.damageSource?.damagingEntity;
    if (!killer || killer.typeId !== "minecraft:player") return;
    const mobId = event.deadEntity?.typeId;
    if (!mobId) return;
    const cfg = getConfig();

    for (const jobId of Object.keys(ALL_JOBS)) {
      if (!(cfg.jobs[jobId]?.enabled ?? true)) continue;
      if (!hasJob(killer, jobId)) continue;
      const job = getJobDef(jobId);
      const reward = job?.actions?.kill?.[mobId];
      if (!reward) continue;
      const result = addJobReward(killer, jobId, reward.xp, reward.coins, job.xp_rate, job.coin_rate);
      notifyReward(killer, job, result);
    }
  });
}

const fishCheckMap = new Map();

function snapInventory(player) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return {};
  const snap = {};
  for (let i = 0; i < inv.size; i++) {
    const item = inv.getItem(i);
    if (item) snap[item.typeId] = (snap[item.typeId] ?? 0) + item.amount;
  }
  return snap;
}

const FISH_IDS = new Set(["minecraft:cod","minecraft:salmon","minecraft:tropical_fish","minecraft:pufferfish"]);
const TREASURE_IDS = new Set(["minecraft:bow","minecraft:fishing_rod","minecraft:name_tag","minecraft:saddle","minecraft:nautilus_shell","minecraft:enchanted_book","minecraft:book"]);

function detectCatch(before, after) {
  for (const id of FISH_IDS) if ((after[id]??0) > (before[id]??0)) return id;
  for (const id of TREASURE_IDS) if ((after[id]??0) > (before[id]??0)) return "treasure";
  for (const [id, c] of Object.entries(after))
    if ((c??0) > (before[id]??0) && !FISH_IDS.has(id) && !TREASURE_IDS.has(id)) return "junk";
  return null;
}

export function registerFishEvents() {
  world.afterEvents.itemReleaseUse.subscribe((event) => {
    const player = event.source;
    if (!player || player.typeId !== "minecraft:player") return;
    if (!event.itemStack || event.itemStack.typeId !== "minecraft:fishing_rod") return;
    const cfg = getConfig();
    const activeJobId = Object.keys(ALL_JOBS).find(
      id => (cfg.jobs[id]?.enabled ?? true) && ALL_JOBS[id].actions?.fish && hasJob(player, id)
    );
    if (!activeJobId || fishCheckMap.has(player.id)) return;
    const before = snapInventory(player);
    fishCheckMap.set(player.id, true);
    setTimeout(() => {
      fishCheckMap.delete(player.id);
      if (!player.isValid()) return;
      const caught = detectCatch(before, snapInventory(player));
      if (!caught) return;
      const job = getJobDef(activeJobId);
      const reward = job?.actions?.fish?.[caught] ?? { xp: 0, coins: 0 };
      const result = addJobReward(player, activeJobId, reward.xp, reward.coins, job.xp_rate, job.coin_rate);
      notifyReward(player, job, result);
    }, 600);
  });
}

export function registerPlaceEvents() {
  world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    const cfg = getConfig();

    for (const jobId of Object.keys(ALL_JOBS)) {
      if (!(cfg.jobs[jobId]?.enabled ?? true)) continue;
      if (!hasJob(player, jobId)) continue;
      const job = getJobDef(jobId);
      const reward = job?.actions?.place?.[block.typeId];
      if (!reward) continue;
      if (!isNewBlock(player, block.x, block.y, block.z)) continue;
      const result = addJobReward(player, jobId, reward.xp, reward.coins, job.xp_rate, job.coin_rate);
      notifyReward(player, job, result);
    }
  });
}
