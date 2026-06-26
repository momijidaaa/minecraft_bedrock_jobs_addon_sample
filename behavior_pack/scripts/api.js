/**
 * Jobs Addon - scriptEvents API
 *
 * 他アドオンから以下のイベントIDでsystem.sendScriptEvent()を呼べます。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 【送信側（外部アドオン）の使い方】
 *
 *   import { system } from "@minecraft/server";
 *   system.sendScriptEvent("jobs:addXP", JSON.stringify({
 *     playerName: "Steve",
 *     jobId: "miner",
 *     xp: 50,
 *     coins: 10
 *   }));
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 【受信（レスポンス）の受け取り方】
 *   Jobs Addon は結果を "jobs:response:<送信eventId>" として返します。
 *   例: "jobs:getPlayerData" に対して "jobs:response:getPlayerData" が届く
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 【イベント一覧】
 *
 *  jobs:addXP
 *    { playerName, jobId, xp, coins? }
 *    → プレイヤーに指定jobのXP(とcoins)を付与
 *
 *  jobs:getPlayerData
 *    { playerName }
 *    → response: { playerName, jobs: { [jobId]: { level, xp, totalEarned } } }
 *
 *  jobs:getJobLevel
 *    { playerName, jobId }
 *    → response: { playerName, jobId, level, xp, needed, percent }
 *
 *  jobs:hasJob
 *    { playerName, jobId }
 *    → response: { playerName, jobId, hasJob: bool }
 *
 *  jobs:joinJob
 *    { playerName, jobId }
 *    → プレイヤーを強制就職（JOB_LIMIT無視）
 *
 *  jobs:leaveJob
 *    { playerName, jobId }
 *    → プレイヤーを強制退職
 *
 *  jobs:registerJob
 *    { jobId, name, tag, color, description, xp_rate, coin_rate, actions }
 *    → カスタム職業を登録（ワールド再起動後も保持）
 *
 *  jobs:unregisterJob
 *    { jobId }
 *    → カスタム職業を削除
 *
 *  jobs:setRate
 *    { type: "global_xp" | "global_coin" | "job_xp" | "job_coin", jobId?, value }
 *    → レートを動的変更（再起動で元に戻る）
 */

import { world, system } from "@minecraft/server";
import { getConfig, registerCustomJob, unregisterCustomJob } from "./configLoader.js";
import {
  hasJob, getAllJobsData, getXPProgress,
  addJobReward, joinJob, leaveJob
} from "./playerData.js";

function findPlayer(name) {
  return world.getAllPlayers().find(p => p.name === name) ?? null;
}

function sendResponse(eventId, payload) {
  // scriptEventはプレイヤーへ直接送れないため world dynamic property 経由でレスポンスを渡す
  // 受信側はこのキーをポーリングして読む
  const key = `jobs:res:${eventId}`;
  try {
    world.setDynamicProperty(key, JSON.stringify({ ...payload, _ts: Date.now() }));
  } catch {}
}

export function registerAPIHandlers() {
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    const id = event.id;
    if (!id.startsWith("jobs:")) return;

    let payload = {};
    try {
      payload = event.message ? JSON.parse(event.message) : {};
    } catch {
      console.warn(`[Jobs API] JSON parse error: ${event.message}`);
      return;
    }

    system.run(() => handleEvent(id, payload));
  }, { namespaces: ["jobs"] });
}

function handleEvent(id, payload) {
  const cfg = getConfig();

  switch (id) {

    case "jobs:addXP": {
      const { playerName, jobId, xp = 0, coins = 0 } = payload;
      const player = findPlayer(playerName);
      if (!player) return;
      if (!cfg.jobs[jobId]) {
        console.warn(`[Jobs API] addXP: unknown job "${jobId}"`);
        return;
      }
      if (!hasJob(player, jobId)) return;

      const coinRate = (cfg.system.global_coin_rate ?? 1) * (cfg.jobs[jobId]?.coin_rate ?? 1);
      const finalCoins = Math.floor(coins * coinRate);

      const result = addJobReward(player, jobId, xp, coins);
      if (result.coinsPaid > 0) {
        player.runCommand(`give @s ${cfg.system.currency_item} ${result.coinsPaid}`);
      }

      const job = cfg.jobs[jobId];
      if (cfg.system.actionbar_reward_display && (xp > 0 || result.gainedCoins > 0)) {
        let msg = `${job.color}${job.tag} §f+${result.gainedXP}XP`;
        if (result.gainedCoins > 0) msg += ` §6+${cfg.system.currency_name}${result.gainedCoins}`;
        player.onScreenDisplay.setActionBar(msg);
      }
      if (result.leveledUp && cfg.system.announce_levelup) {
        player.sendMessage(
          `§6** [Jobs] ${job.color}${job.tag} ${job.name} §fがレベル §e${result.newLevel} §fになりました！ **`
        );
        player.playSound(cfg.system.levelup_sound ?? "random.levelup");
      }

      sendResponse("addXP", { playerName, jobId, ...result });
      break;
    }

    case "jobs:getPlayerData": {
      const { playerName } = payload;
      const player = findPlayer(playerName);
      if (!player) { sendResponse("getPlayerData", { error: "player not found" }); return; }
      const jobs = getAllJobsData(player);
      sendResponse("getPlayerData", { playerName, jobs });
      break;
    }

    case "jobs:getJobLevel": {
      const { playerName, jobId } = payload;
      const player = findPlayer(playerName);
      if (!player) { sendResponse("getJobLevel", { error: "player not found" }); return; }
      const prog = getXPProgress(player, jobId);
      sendResponse("getJobLevel", { playerName, jobId, ...prog });
      break;
    }

    case "jobs:hasJob": {
      const { playerName, jobId } = payload;
      const player = findPlayer(playerName);
      if (!player) { sendResponse("hasJob", { error: "player not found" }); return; }
      sendResponse("hasJob", { playerName, jobId, hasJob: hasJob(player, jobId) });
      break;
    }

    case "jobs:joinJob": {
      const { playerName, jobId } = payload;
      const player = findPlayer(playerName);
      if (!player || !cfg.jobs[jobId]) return;
      const ok = joinJob(player, jobId);
      if (ok) {
        const job = cfg.jobs[jobId];
        player.sendMessage(`§a[Jobs] ${job.color}${job.tag} ${job.name}§aに就職しました！`);
      }
      sendResponse("joinJob", { playerName, jobId, success: ok });
      break;
    }

    case "jobs:leaveJob": {
      const { playerName, jobId } = payload;
      const player = findPlayer(playerName);
      if (!player) return;
      const ok = leaveJob(player, jobId);
      sendResponse("leaveJob", { playerName, jobId, success: ok });
      break;
    }

    case "jobs:registerJob": {
      const { jobId, ...jobDef } = payload;
      if (!jobId) return;
      const ok = registerCustomJob(jobId, jobDef);
      sendResponse("registerJob", { jobId, success: ok });
      if (ok) console.log(`[Jobs API] カスタム職業登録: ${jobId}`);
      break;
    }

    case "jobs:unregisterJob": {
      const { jobId } = payload;
      if (!jobId) return;
      const ok = unregisterCustomJob(jobId);
      sendResponse("unregisterJob", { jobId, success: ok });
      break;
    }

    case "jobs:setRate": {
      const { type, jobId, value } = payload;
      if (typeof value !== "number") return;
      switch (type) {
        case "global_xp":   cfg.system.global_xp_rate = value; break;
        case "global_coin": cfg.system.global_coin_rate = value; break;
        case "job_xp":   if (jobId && cfg.jobs[jobId]) cfg.jobs[jobId].xp_rate = value; break;
        case "job_coin": if (jobId && cfg.jobs[jobId]) cfg.jobs[jobId].coin_rate = value; break;
      }
      sendResponse("setRate", { type, jobId, value, success: true });
      break;
    }

    default:
      console.warn(`[Jobs API] 未知のイベント: ${id}`);
  }
}
