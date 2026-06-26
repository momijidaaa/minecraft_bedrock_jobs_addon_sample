# Jobs Addon

職業システムアドオン for Minecraft Bedrock Edition

## インストール

behavior_pack フォルダをアドオンとして適用するだけ。

---

## config.json の設定項目

`behavior_pack/config.json` を編集してカスタマイズ可能。
変更後はワールドを再起動してください。

### system セクション

| キー | デフォルト | 説明 |
|------|-----------|------|
| job_limit | 3 | 同時就職できる職業数 |
| max_level | 50 | レベル上限 |
| chat_command | "/jobs" | メニューを開くコマンド |
| currency_item | "minecraft:emerald" | 報酬アイテムのID |
| currency_name | "エメラルド" | 報酬アイテムの表示名 |
| announce_levelup | true | レベルアップをチャットに通知 |
| levelup_sound | "random.levelup" | レベルアップ時のサウンド |
| actionbar_reward_display | true | 報酬をアクションバーに表示 |
| global_xp_rate | 1.0 | 全職業XP倍率 (2.0で2倍) |
| global_coin_rate | 1.0 | 全職業コイン倍率 |
| xp_formula.base | 100 | レベル1→2に必要なXP |
| xp_formula.multiplier | 1.5 | レベルごとの必要XP倍率 |

### jobs セクション

各職業に以下のフィールドが設定可能:

| キー | 説明 |
|------|------|
| enabled | false にすると職業が無効化される |
| name | 職業名（UI表示） |
| tag | UIや通知に使うタグ文字列 (例: "[木]") |
| color | §コードによる色 |
| description | 職業説明文 |
| xp_rate | この職業のXP倍率（global_xp_rateと掛け算） |
| coin_rate | この職業のコイン倍率 |
| actions.break | ブロック破壊報酬テーブル |
| actions.kill | エンティティ撃破報酬テーブル |
| actions.place | ブロック設置報酬テーブル |
| actions.fish | 釣り報酬テーブル |

#### actions テーブルの書き方

```json
"actions": {
  "break": {
    "minecraft:diamond_ore": { "xp": 15, "coins": 8 },
    "minecraft:wheat": { "xp": 3, "coins": 1, "require_age": 7, "age_state": "growth" }
  }
}
```

- `require_age` : この成熟度以上でないと報酬が得られない（農作物用）
- `age_state`   : 成熟度を保持するブロックステート名

---

## 他アドオンからの連携 (scriptEvents API)

### 基本的な使い方

```javascript
import { system } from "@minecraft/server";

// XPとコインを付与
system.sendScriptEvent("jobs:addXP", JSON.stringify({
  playerName: "Steve",
  jobId: "miner",
  xp: 50,
  coins: 10
}));
```

### 使用可能なイベント一覧

#### jobs:addXP
指定プレイヤーの指定職業にXPとコインを付与する。

```json
{ "playerName": "Steve", "jobId": "miner", "xp": 50, "coins": 10 }
```

#### jobs:getPlayerData
プレイヤーの全職業データを取得。結果は `jobs:res:getPlayerData` というDynamic Propertyに書き込まれる。

```json
{ "playerName": "Steve" }
```

#### jobs:getJobLevel
特定職業のレベル・XP進捗を取得。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

#### jobs:hasJob
プレイヤーが職業に就いているか確認。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

#### jobs:joinJob
プレイヤーを強制的に就職させる（job_limit を無視）。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

#### jobs:leaveJob
プレイヤーを強制的に退職させる。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

#### jobs:registerJob
カスタム職業を動的に追加する。ワールド再起動後も保持される。

```json
{
  "jobId": "blacksmith",
  "name": "鍛冶屋",
  "tag": "[鍛]",
  "color": "§d",
  "description": "アイテムをクラフトして報酬獲得",
  "xp_rate": 1.0,
  "coin_rate": 1.0,
  "actions": {
    "break": {
      "minecraft:iron_block": { "xp": 10, "coins": 5 }
    }
  }
}
```

#### jobs:unregisterJob
カスタム職業を削除する。

```json
{ "jobId": "blacksmith" }
```

#### jobs:setRate
倍率をランタイムで変更する（ワールド再起動でリセット）。

```json
{ "type": "global_xp", "value": 2.0 }
{ "type": "job_xp", "jobId": "miner", "value": 1.5 }
{ "type": "global_coin", "value": 0.5 }
{ "type": "job_coin", "jobId": "hunter", "value": 3.0 }
```

### レスポンスの受け取り方

Jobs Addon はレスポンスを `world.getDynamicProperty("jobs:res:<eventId>")` に書き込む。

```javascript
import { world, system } from "@minecraft/server";

system.sendScriptEvent("jobs:getJobLevel", JSON.stringify({
  playerName: "Steve",
  jobId: "miner"
}));

// 少し後に読む
system.runTimeout(() => {
  const raw = world.getDynamicProperty("jobs:res:getJobLevel");
  if (raw) {
    const res = JSON.parse(raw);
    console.log(`Lv.${res.level} XP:${res.xp}/${res.needed}`);
  }
}, 5);
```
