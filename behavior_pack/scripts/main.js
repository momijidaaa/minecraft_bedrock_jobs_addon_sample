import { world, system, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server";
import { showMainMenu, showStatusMenu } from "./ui.js";
import { getConfig } from "./configLoader.js";
import { registerAPIHandlers } from "./api.js";
import { registerBreakEvents, registerKillEvents, registerFishEvents, registerPlaceEvents } from "./events.js";
import { getBalance } from "./playerData.js";

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {

  customCommandRegistry.registerCommand({
    name: "jobaddon:jobs",
    description: "Jobs\u30e1\u30cb\u30e5\u30fc\u3092\u958b\u304f",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  }, (origin) => {
    const player = origin.sourceEntity;
    if (!player || player.typeId !== "minecraft:player")
      return { status: CustomCommandStatus.Failure, message: "\u30d7\u30ec\u30a4\u30e4\u30fc\u306e\u307f" };
    system.run(async () => await showMainMenu(player));
    return { status: CustomCommandStatus.Success };
  });

  customCommandRegistry.registerCommand({
    name: "jobaddon:status",
    description: "\u8077\u696d\u30b9\u30c6\u30fc\u30bf\u30b9\u3092\u78ba\u8a8d",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  }, (origin) => {
    const player = origin.sourceEntity;
    if (!player || player.typeId !== "minecraft:player")
      return { status: CustomCommandStatus.Failure, message: "\u30d7\u30ec\u30a4\u30e4\u30fc\u306e\u307f" };
    system.run(async () => await showStatusMenu(player));
    return { status: CustomCommandStatus.Success };
  });

  const balCallback = (origin) => {
    const player = origin.sourceEntity;
    if (!player || player.typeId !== "minecraft:player")
      return { status: CustomCommandStatus.Failure, message: "\u30d7\u30ec\u30a4\u30e4\u30fc\u306e\u307f" };
    const bal = getBalance(player);
    const currency = getConfig().currency.symbol;
    
    player.sendMessage("\u00A76[Jobs] \u00A7f\u6b8b\u9ad8: \u00A7a" + currency + bal.toFixed(2));
    return { status: CustomCommandStatus.Success };
  };

  customCommandRegistry.registerCommand({
    name: "jobaddon:balance",
    description: "\u6b8b\u9ad8\u3092\u78ba\u8a8d\u3059\u308b",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  }, balCallback);

  customCommandRegistry.registerCommand({
    name: "jobaddon:bal",
    description: "\u6b8b\u9ad8\u3092\u78ba\u8a8d\u3059\u308b (\u77ed\u7e2e)",
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
      "\u00A76[Jobs] \u00A7f/jobaddon:jobs \u3067\u8077\u696d\u30e1\u30cb\u30e5\u30fc  " +
      "/jobaddon:bal \u3067\u6b8b\u9ad8\u78ba\u8a8d"
    );
  }, 60);
});

console.log("[Jobs] \u8d77\u52d5\u5b8c\u4e86");
