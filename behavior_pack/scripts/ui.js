import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { getConfig } from "./configLoader.js";
import { ALL_JOBS } from "./jobs/index.js";
import {
  loadPlayerData, getXPProgress, getActiveJobs,
  joinJob, leaveJob, getBalance
} from "./playerData.js";

function getJob(jobId) {
  const cfg = getConfig();
  const def = ALL_JOBS[jobId];
  if (!def) return null;
  const jobCfg = cfg.jobs[jobId] ?? {};
  return { id: jobId, ...def.meta, xp_rate: jobCfg.xp_rate ?? 1.0, coin_rate: jobCfg.coin_rate ?? 1.0, actions: def.actions };
}

function enabledJobIds() {
  const cfg = getConfig();
  return Object.keys(ALL_JOBS).filter(id => cfg.jobs[id]?.enabled !== false);
}

function makeProgressBar(percent, width = 16) {
  const filled = Math.round((percent / 100) * width);
  return "§a" + "|".repeat(filled) + "§8" + "|".repeat(width - filled) + "§r";
}

function xpStr(xp, needed) {
  return xp.toFixed(1) + " / " + needed;
}

export async function showMainMenu(player) {
  const cfg = getConfig();
  const activeJobs = getActiveJobs(player);
  const bal = getBalance(player);
  const sym = cfg.currency.symbol;

  const form = new ActionFormData()
    .title("Jobs")
    .body(
      "§e■ Jobs メニュー§r\n\n" +
      "§7就職中§f: " + activeJobs.length + " §7/ §f" + cfg.system.job_limit + "\n" +
      "§7残高§f: §a" + sym + bal.toFixed(2) + "§r\n\n" +
      "§7行動に応じてXPと" + sym + "が得られます。"
    );

  form.button(">> 職業一覧 / 就職");
  form.button(">> 自分のステータス");
  form.button(">> 退職する");

  const result = await form.show(player);
  if (result.canceled || result.selection === undefined) return;
  if (result.selection === 0) await showJobListMenu(player);
  else if (result.selection === 1) await showStatusMenu(player);
  else await showLeaveMenu(player);
}

export async function showJobListMenu(player) {
  const cfg = getConfig();
  const activeJobs = getActiveJobs(player);
  const jobIds = enabledJobIds();

  const form = new ActionFormData()
    .title("職業一覧")
    .body(
      "§e■ 職業一覧§r\n\n" +
      "§7就職中§f: " + activeJobs.length + " §7/ §f" + cfg.system.job_limit + "\n" +
      "§7職業をタップして詳細を確認"
    );

  for (const jobId of jobIds) {
    const job = getJob(jobId);
    const isActive = activeJobs.includes(jobId);
    if (isActive) {
      const prog = getXPProgress(player, jobId);
      form.button(job.tag + " " + job.name + " [Lv." + prog.level + "] <<就職中>>");
    } else {
      form.button(job.tag + " " + job.name);
    }
  }
  form.button("<< 戻る");

  const result = await form.show(player);
  if (result.canceled || result.selection === undefined) return;
  if (result.selection === jobIds.length) { await showMainMenu(player); return; }
  await showJobDetailMenu(player, jobIds[result.selection]);
}

export async function showJobDetailMenu(player, jobId) {
  const cfg = getConfig();
  const job = getJob(jobId);
  if (!job) return;

  const activeJobs = getActiveJobs(player);
  const isActive = activeJobs.includes(jobId);
  const sym = cfg.currency.symbol;

  let body = job.color + "■ " + job.tag + " " + job.name + "§r\n§7" + job.description + "§r\n\n";

  if (isActive) {
    const prog = getXPProgress(player, jobId);
    const jd = loadPlayerData(player).jobs[jobId];
    body +=
      "§7レベル§f: §e" + prog.level + "§r\n" +
      "§7XP§f: §b" + xpStr(prog.xp, prog.needed) + "§r\n" +
      makeProgressBar(prog.percent) + " §f" + prog.percent + "%\n" +
      "§7総獲得§f: §a" + sym + jd.totalEarned.toFixed(2) + "§r\n";
  } else {
    body += "§7―― 報酬例 ――§r\n";
    let count = 0;
    outer:
    for (const actionType of Object.keys(job.actions)) {
      for (const [target, reward] of Object.entries(job.actions[actionType])) {
        const label = target.replace("minecraft:", "").replace(/_/g, " ");
        const xpVal = Array.isArray(reward.xp) ? reward.xp[0].toFixed(1) + "~" + reward.xp[1].toFixed(1) : String(reward.xp);
        const coinVal = Array.isArray(reward.coins) ? sym + reward.coins[0] + "~" + sym + reward.coins[1] : (reward.coins > 0 ? sym + reward.coins : "§8-§r");
        body += "§7 " + label + "§r: §b+" + xpVal + "XP §a" + coinVal + "§r\n";
        if (++count >= 6) break outer;
      }
    }
    body += "§7など...";
  }

  const form = new ActionFormData().title(job.tag + " " + job.name).body(body);

  if (isActive) {
    form.button("[ 退職する ]");
    form.button("<< 戻る");
    const result = await form.show(player);
    if (result.canceled || result.selection === undefined) return;
    if (result.selection === 0) await confirmLeaveJob(player, jobId);
    else await showJobListMenu(player);
  } else {
    const atLimit = activeJobs.length >= cfg.system.job_limit;
    form.button(atLimit ? "[ 就職不可 (上限" + cfg.system.job_limit + ") ]" : "[ 就職する! ]");
    form.button("<< 戻る");
    const result = await form.show(player);
    if (result.canceled || result.selection === undefined) return;
    if (result.selection === 0 && !atLimit) {
      joinJob(player, jobId);
      player.sendMessage("§a[Jobs] " + job.tag + " " + job.name + "§aに就職しました！");
    }
    await showJobListMenu(player);
  }
}

async function confirmLeaveJob(player, jobId) {
  const job = getJob(jobId);
  const form = new MessageFormData()
    .title("退職確認")
    .body(job.tag + " " + job.name + "を退職しますか？\n§cXPとレベルは失われます。")
    .button1("はい、退職する")
    .button2("キャンセル");
  const result = await form.show(player);
  if (result.canceled) return;
  if (result.selection === 0) {
    leaveJob(player, jobId);
    player.sendMessage("§c[Jobs] " + job.tag + " " + job.name + "§cを退職しました。");
  }
  await showJobListMenu(player);
}

export async function showStatusMenu(player) {
  const cfg = getConfig();
  const activeJobs = getActiveJobs(player);
  const bal = getBalance(player);
  const sym = cfg.currency.symbol;

  const form = new ActionFormData().title("ステータス");

  if (activeJobs.length === 0) {
    form.body("§7まだ職業がありません。\n職業一覧から就職しましょう！");
    form.button("<< 戻る");
    const result = await form.show(player);
    if (!result.canceled) await showMainMenu(player);
    return;
  }

  let body =
    "§e■ ステータス§r\n\n" +
    "§7残高§f: §a" + sym + bal.toFixed(2) + "§r\n\n";

  for (const jobId of activeJobs) {
    const job = getJob(jobId);
    if (!job) continue;
    const prog = getXPProgress(player, jobId);
    const jd = loadPlayerData(player).jobs[jobId];
    body +=
      job.color + job.tag + " " + job.name + " §eLv." + prog.level + "§r\n" +
      "  §7XP§f: §b" + xpStr(prog.xp, prog.needed) + "§r\n" +
      "  " + makeProgressBar(prog.percent) + " §f" + prog.percent + "%\n" +
      "  §7総獲得§f: §a" + sym + jd.totalEarned.toFixed(2) + "§r\n\n";
  }

  form.body(body);
  for (const jobId of activeJobs) {
    const job = getJob(jobId);
    if (!job) continue;
    const prog = getXPProgress(player, jobId);
    form.button(job.tag + " " + job.name + " Lv." + prog.level);
  }
  form.button("<< 戻る");

  const result = await form.show(player);
  if (result.canceled || result.selection === undefined) return;
  if (result.selection < activeJobs.length) await showJobDetailMenu(player, activeJobs[result.selection]);
  else await showMainMenu(player);
}

export async function showLeaveMenu(player) {
  const activeJobs = getActiveJobs(player);
  if (activeJobs.length === 0) {
    player.sendMessage("§7[Jobs] 就職中の職業がありません。");
    return;
  }

  const form = new ActionFormData()
    .title("退職する")
    .body("退職したい職業を選んでください：");

  for (const jobId of activeJobs) {
    const job = getJob(jobId);
    if (!job) continue;
    const prog = getXPProgress(player, jobId);
    form.button(job.tag + " " + job.name + " Lv." + prog.level);
  }
  form.button("<< 戻る");

  const result = await form.show(player);
  if (result.canceled || result.selection === undefined) return;
  if (result.selection < activeJobs.length) await confirmLeaveJob(player, activeJobs[result.selection]);
  else await showMainMenu(player);
}
