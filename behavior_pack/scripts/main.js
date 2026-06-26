import { world, system, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server";
import { showMainMenu, showStatusMenu } from "./ui.js";
import { getConfig } from "./configLoader.js";
import { registerAPIHandlers } from "./api.js";
import { registerBreakEvents, registerKillEvents, registerFishEvents, registerPlaceEvents } from "./events.js";
import { getBalance } from "./playerData.js";

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {

  customCommandRegistry.registerCommand({
    name: "jobaddon:jobs",
    description: "Jobsメニューを開く",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  }, (origin) => {
    const player = origin.sourceEntity;
    if (!player || player.typeId !== "minecraft:player")
      return { status: CustomCommandStatus.Failure, message: "プレイヤーのみ" };
    system.run(async () => await showMainMenu(player));
    return { status: CustomCommandStatus.Success };
  });

  customCommandRegistry.registerCommand({
    name: "jobaddon:status",
    description: "職業ステータスを確認",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  }, (origin) => {
    const player = origin.sourceEntity;
    if (!player || player.typeId !== "minecraft:player")
      return { status: CustomCommandStatus.Failure, message: "プレイヤーのみ" };
    system.run(async () => await showStatusMenu(player));
    return { status: CustomCommandStatus.Success };
  });

  const balCallback = (origin) => {
    const player = origin.sourceEntity;
    if (!player || player.typeId !== "minecraft:player")
      return { status: CustomCommandStatus.Failure, message: "プレイヤーのみ" };
    const bal = getBalance(player);
    const currency = getConfig().currency.symbol;

    player.sendMessage("§6[Jobs] §f残高: §a" + currency + bal.toFixed(2));
    return { status: CustomCommandStatus.Success };
  };

  customCommandRegistry.registerCommand({
    name: "jobaddon:balance",
    description: "残高を確認する",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  }, balCallback);

  customCommandRegistry.registerCommand({
    name: "jobaddon:bal",
    description: "残高を確認する (短縮)",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  }, balCallback);

});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  const player = event.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  if (event.id === "jobaddon:jobs") system.run(async () => await showMainMenu(player));
  else if (event.id === "jobaddon:status") system.run(async () => await showStatusMenu(player));
}, { namespaces: ["jobaddon"] });

registerBreakEvents();
registerKillEvents();
registerFishEvents();
registerPlaceEvents();
registerAPIHandlers();

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  system.runTimeout(() => {
    event.player.sendMessage(
      "§6[Jobs] §f/jobaddon:jobs で職業メニュー  /jobaddon:bal で残高確認"
    );
  }, 60);
});

console.log("[Jobs] 起動完了");
