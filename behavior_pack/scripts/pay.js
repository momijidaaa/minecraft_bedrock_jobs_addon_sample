// scripts/pay.js
import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { getBalance, addBalance } from "./playerData.js";
import { getConfig } from "./configLoader.js";

export async function showPayMenu(player) {
  const cfg = getConfig();
  const sym = cfg.currency.symbol;

  const others = world.getAllPlayers().filter(p => p.id !== player.id);

  if (others.length === 0) {
    player.sendMessage("§c[Jobs] §f他にプレイヤーがいません。");
    return;
  }

  const selectForm = new ActionFormData()
    .title("Pay - 送金先を選択")
    .body(
      "§e自分の残高§f: §a" + sym + getBalance(player).toFixed(2) + "§r\n\n" +
      "§7送金するプレイヤーを選んでください"
    );

  for (const target of others) {
    const bal = getBalance(target);
    selectForm.button(target.name + "  §7(" + sym + bal.toFixed(2) + ")");
  }
  selectForm.button("<< キャンセル");

  const selectResult = await selectForm.show(player);
  if (selectResult.canceled || selectResult.selection === undefined) return;
  if (selectResult.selection === others.length) return;

  const target = others[selectResult.selection];

  const myBal = getBalance(player);
  const amountForm = new ModalFormData()
    .title("Pay - 送金額を入力")
    .textField(
      target.name + " に送金する金額（残高: " + sym + myBal.toFixed(2) + "）",
      "0.00"
    );

  const amountResult = await amountForm.show(player);
  if (amountResult.canceled || amountResult.formValues === undefined) return;

  const input = String(amountResult.formValues[0]).trim();
  const amount = parseFloat(input);

  if (isNaN(amount) || amount <= 0) {
    player.sendMessage("§c[Jobs] 正しい金額を入力してください。");
    return;
  }

  const decimals = cfg.system.coin_decimals ?? 2;
  const finalAmount = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);

  if (getBalance(player) < finalAmount) {
    player.sendMessage("§c[Jobs] 残高が足りません。（残高: " + sym + myBal.toFixed(2) + "）");
    return;
  }

  const confirmForm = new MessageFormData()
    .title("Pay - 確認")
    .body(
      "以下の内容で送金しますか？\n\n" +
      "§7送金先§f: §e" + target.name + "§r\n" +
      "§7金額§f: §a" + sym + finalAmount.toFixed(decimals) + "§r\n" +
      "§7送金後残高§f: §a" + sym + (getBalance(player) - finalAmount).toFixed(decimals)
    )
    .button1("送金する")
    .button2("キャンセル");

  const confirmResult = await confirmForm.show(player);
  if (confirmResult.canceled || confirmResult.selection !== 0) return;

  if (getBalance(player) < finalAmount) {
    player.sendMessage("§c[Jobs] 残高が足りません。");
    return;
  }

  addBalance(player, -finalAmount);
  addBalance(target, finalAmount);

  player.sendMessage(
    "§a[Jobs] §e" + target.name + "§f に §a" + sym + finalAmount.toFixed(decimals) + "§f を送金しました。" +
    "（残高: §a" + sym + getBalance(player).toFixed(decimals) + "§f）"
  );
  target.sendMessage(
    "§a[Jobs] §e" + player.name + "§f から §a" + sym + finalAmount.toFixed(decimals) + "§f を受け取りました。" +
    "（残高: §a" + sym + getBalance(target).toFixed(decimals) + "§f）"
  );
}
