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
  return "\u00A7a" + "|".repeat(filled) + "\u00A78" + "|".repeat(width - filled) + "\u00A7r";
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
      "\u00A7e\u25a0 Jobs \u30e1\u30cb\u30e5\u30fc\u00A7r\n\n" +
      "\u00A77\u5c31\u8077\u4e2d\u00A7f: " + activeJobs.length + " \u00A77/ \u00A7f" + cfg.system.job_limit + "\n" +
      "\u00A77\u6b8b\u9ad8\u00A7f: \u00A7a" + sym + bal.toFixed(2) + "\u00A7r\n\n" +
      "\u00A77\u884c\u52d5\u306b\u5fdc\u3058\u3066XP\u3068" + sym + "\u304c\u5f97\u3089\u308c\u307e\u3059\u3002"
    );

  form.button(">> \u8077\u696d\u4e00\u89a7 / \u5c31\u8077");
  form.button(">> \u81ea\u5206\u306e\u30b9\u30c6\u30fc\u30bf\u30b9");
  form.button(">> \u9000\u8077\u3059\u308b");

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
    .title("\u8077\u696d\u4e00\u89a7")
    .body(
      "\u00A7e\u25a0 \u8077\u696d\u4e00\u89a7\u00A7r\n\n" +
      "\u00A77\u5c31\u8077\u4e2d\u00A7f: " + activeJobs.length + " \u00A77/ \u00A7f" + cfg.system.job_limit + "\n" +
      "\u00A77\u8077\u696d\u3092\u30bf\u30c3\u30d7\u3057\u3066\u8a73\u7d30\u3092\u78ba\u8a8d"
    );

  for (const jobId of jobIds) {
    const job = getJob(jobId);
    const isActive = activeJobs.includes(jobId);
    if (isActive) {
      const prog = getXPProgress(player, jobId);
      form.button(job.tag + " " + job.name + " [Lv." + prog.level + "] <<\u5c31\u8077\u4e2d>>");
    } else {
      form.button(job.tag + " " + job.name);
    }
  }
  form.button("<< \u623b\u308b");

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

  let body = job.color + "\u25a0 " + job.tag + " " + job.name + "\u00A7r\n\u00A77" + job.description + "\u00A7r\n\n";

  if (isActive) {
    const prog = getXPProgress(player, jobId);
    const jd = loadPlayerData(player).jobs[jobId];
    body +=
      "\u00A77\u30ec\u30d9\u30eb\u00A7f: \u00A7e" + prog.level + "\u00A7r\n" +
      "\u00A77XP\u00A7f: \u00A7b" + xpStr(prog.xp, prog.needed) + "\u00A7r\n" +
      makeProgressBar(prog.percent) + " \u00A7f" + prog.percent + "%\n" +
      "\u00A77\u7dcf\u7372\u5f97\u00A7f: \u00A7a" + sym + jd.totalEarned.toFixed(2) + "\u00A7r\n";
  } else {
    body += "\u00A77\u2015\u2015 \u5831\u916c\u4f8b \u2015\u2015\u00A7r\n";
    let count = 0;
    outer:
    for (const actionType of Object.keys(job.actions)) {
      for (const [target, reward] of Object.entries(job.actions[actionType])) {
        const label = target.replace("minecraft:", "").replace(/_/g, " ");
        const xpVal = Array.isArray(reward.xp) ? reward.xp[0].toFixed(1) + "~" + reward.xp[1].toFixed(1) : String(reward.xp);
        const coinVal = Array.isArray(reward.coins) ? sym + reward.coins[0] + "~" + sym + reward.coins[1] : (reward.coins > 0 ? sym + reward.coins : "\u00A78-\u00A7r");
        body += "\u00A77 " + label + "\u00A7r: \u00A7b+" + xpVal + "XP \u00A7a" + coinVal + "\u00A7r\n";
        if (++count >= 6) break outer;
      }
    }
    body += "\u00A77\u306a\u3069...";
  }

  const form = new ActionFormData().title(job.tag + " " + job.name).body(body);

  if (isActive) {
    form.button("[ \u9000\u8077\u3059\u308b ]");
    form.button("<< \u623b\u308b");
    const result = await form.show(player);
    if (result.canceled || result.selection === undefined) return;
    if (result.selection === 0) await confirmLeaveJob(player, jobId);
    else await showJobListMenu(player);
  } else {
    const atLimit = activeJobs.length >= cfg.system.job_limit;
    form.button(atLimit ? "[ \u5c31\u8077\u4e0d\u53ef (\u4e0a\u9650" + cfg.system.job_limit + ") ]" : "[ \u5c31\u8077\u3059\u308b! ]");
    form.button("<< \u623b\u308b");
    const result = await form.show(player);
    if (result.canceled || result.selection === undefined) return;
    if (result.selection === 0 && !atLimit) {
      joinJob(player, jobId);
      player.sendMessage("\u00A7a[Jobs] " + job.tag + " " + job.name + "\u00A7a\u306b\u5c31\u8077\u3057\u307e\u3057\u305f\uff01");
    }
    await showJobListMenu(player);
  }
}

async function confirmLeaveJob(player, jobId) {
  const job = getJob(jobId);
  const form = new MessageFormData()
    .title("\u9000\u8077\u78ba\u8a8d")
    .body(job.tag + " " + job.name + "\u3092\u9000\u8077\u3057\u307e\u3059\u304b\uff1f\n\u00A7cXP\u3068\u30ec\u30d9\u30eb\u306f\u5931\u308f\u308c\u307e\u3059\u3002")
    .button1("\u306f\u3044\u3001\u9000\u8077\u3059\u308b")
    .button2("\u30ad\u30e3\u30f3\u30bb\u30eb");
  const result = await form.show(player);
  if (result.canceled) return;
  if (result.selection === 0) {
    leaveJob(player, jobId);
    player.sendMessage("\u00A7c[Jobs] " + job.tag + " " + job.name + "\u00A7c\u3092\u9000\u8077\u3057\u307e\u3057\u305f\u3002");
  }
  await showJobListMenu(player);
}

export async function showStatusMenu(player) {
  const cfg = getConfig();
  const activeJobs = getActiveJobs(player);
  const bal = getBalance(player);
  const sym = cfg.currency.symbol;

  const form = new ActionFormData().title("\u30b9\u30c6\u30fc\u30bf\u30b9");

  if (activeJobs.length === 0) {
    form.body("\u00A77\u307e\u3060\u8077\u696d\u304c\u3042\u308a\u307e\u305b\u3093\u3002\n\u8077\u696d\u4e00\u89a7\u304b\u3089\u5c31\u8077\u3057\u307e\u3057\u3087\u3046\uff01");
    form.button("<< \u623b\u308b");
    const result = await form.show(player);
    if (!result.canceled) await showMainMenu(player);
    return;
  }

  let body =
    "\u00A7e\u25a0 \u30b9\u30c6\u30fc\u30bf\u30b9\u00A7r\n\n" +
    "\u00A77\u6b8b\u9ad8\u00A7f: \u00A7a" + sym + bal.toFixed(2) + "\u00A7r\n\n";

  for (const jobId of activeJobs) {
    const job = getJob(jobId);
    if (!job) continue;
    const prog = getXPProgress(player, jobId);
    const jd = loadPlayerData(player).jobs[jobId];
    body +=
      job.color + job.tag + " " + job.name + " \u00A7eLv." + prog.level + "\u00A7r\n" +
      "  \u00A77XP\u00A7f: \u00A7b" + xpStr(prog.xp, prog.needed) + "\u00A7r\n" +
      "  " + makeProgressBar(prog.percent) + " \u00A7f" + prog.percent + "%\n" +
      "  \u00A77\u7dcf\u7372\u5f97\u00A7f: \u00A7a" + sym + jd.totalEarned.toFixed(2) + "\u00A7r\n\n";
  }

  form.body(body);
  for (const jobId of activeJobs) {
    const job = getJob(jobId);
    if (!job) continue;
    const prog = getXPProgress(player, jobId);
    form.button(job.tag + " " + job.name + " Lv." + prog.level);
  }
  form.button("<< \u623b\u308b");

  const result = await form.show(player);
  if (result.canceled || result.selection === undefined) return;
  if (result.selection < activeJobs.length) await showJobDetailMenu(player, activeJobs[result.selection]);
  else await showMainMenu(player);
}

export async function showLeaveMenu(player) {
  const activeJobs = getActiveJobs(player);
  if (activeJobs.length === 0) {
    player.sendMessage("\u00A77[Jobs] \u5c31\u8077\u4e2d\u306e\u8077\u696d\u304c\u3042\u308a\u307e\u305b\u3093\u3002");
    return;
  }

  const form = new ActionFormData()
    .title("\u9000\u8077\u3059\u308b")
    .body("\u9000\u8077\u3057\u305f\u3044\u8077\u696d\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\uff1a");

  for (const jobId of activeJobs) {
    const job = getJob(jobId);
    if (!job) continue;
    const prog = getXPProgress(player, jobId);
    form.button(job.tag + " " + job.name + " Lv." + prog.level);
  }
  form.button("<< \u623b\u308b");

  const result = await form.show(player);
  if (result.canceled || result.selection === undefined) return;
  if (result.selection < activeJobs.length) await confirmLeaveJob(player, activeJobs[result.selection]);
  else await showMainMenu(player);
}
