# Jobs Addon

職業システムアドオン for Minecraft Bedrock Edition  
Script API製 / @minecraft/server 2.7.0 + @minecraft/server-ui 2.0.0

---

## インストール

```
behavior_pack/
  manifest.json
  config.json
  scripts/
    main.js
    configLoader.js
    events.js
    playerData.js
    ui.js
    api.js
    jobs/
      index.js
      woodcutter.js
      miner.js
      farmer.js
      hunter.js
      fisherman.js
      builder.js
```

behavior_pack フォルダをワールドに適用するだけ。

---

## コマンド

| コマンド | 説明 |
|---|---|
| `/jobaddon:jobs` | 職業メニューを開く |
| `/jobaddon:status` | ステータス画面を開く |
| `/jobaddon:balance` | 残高を確認する |
| `/jobaddon:bal` | 残高を確認する（短縮形） |

---

## 職業一覧

| ID | 名前 | 報酬トリガー |
|---|---|---|
| `woodcutter` | 木こり | 原木・葉の破壊 |
| `miner` | 鉱夫 | 石系・鉱石の破壊 |
| `farmer` | 農夫 | 成熟した作物の破壊 |
| `hunter` | 狩人 | モブ・ボスの撃破 |
| `fisherman` | 漁師 | 釣り |
| `builder` | 建築家 | ブロックの初回設置（土系除外） |

---

## config.json の設定項目

`behavior_pack/config.json` を編集。**数値と true/false のみ変更可**。  
ブロック・モブのリストや報酬値は `scripts/jobs/` 内の各ファイルで管理。

### system

| キー | デフォルト | 説明 |
|---|---|---|
| `job_limit` | `3` | 同時就職できる職業数 |
| `max_level` | `50` | レベル上限 |
| `announce_levelup` | `true` | レベルアップ時にチャット通知 |
| `levelup_sound` | `"random.levelup"` | レベルアップ時のサウンドID |
| `actionbar_reward_display` | `true` | 報酬をアクションバーに表示 |
| `coin_decimals` | `2` | 残高・報酬の小数点桁数 |
| `xp_formula_base` | `100` | Lv1→2に必要なXP |
| `xp_formula_multiplier` | `1.5` | レベルごとの必要XP倍率 |
| `global_xp_rate` | `1.0` | 全職業XP倍率（2.0で2倍） |
| `global_coin_rate` | `1.0` | 全職業コイン倍率 |
| `levelup_title` | `true` | レベルアップ時にタイトル表示 |
| `levelup_title_color` | `"§e"` | タイトルの色コード |
| `levelup_subtitle_color` | `"§f"` | サブタイトルの色コード |

### currency

| キー | デフォルト | 説明 |
|---|---|---|
| `name` | `"¥"` | 通貨の名称 |
| `symbol` | `"¥"` | UI・通知に使う記号 |

### jobs

各職業に以下のキーを設定できる。

| キー | 説明 |
|---|---|
| `enabled` | `false` にするとその職業が無効化される |
| `xp_rate` | この職業のXP倍率（`global_xp_rate` と掛け算） |
| `coin_rate` | この職業のコイン倍率（`global_coin_rate` と掛け算） |

```json
"jobs": {
  "miner": { "enabled": true, "xp_rate": 1.5, "coin_rate": 2.0 }
}
```

---

## 外部アドオンとの連携（scriptEvents API）

Jobs Addon は `system.afterEvents.scriptEventReceive` でイベントを受け付ける。  
レスポンスは `world.getDynamicProperty("jobs:res:<eventId>")` で取得。

### 送信側の基本形

```js
import { system } from "@minecraft/server";

system.sendScriptEvent("jobs:addXP", JSON.stringify({
  playerName: "Steve",
  jobId: "miner",
  xp: 50,
  coins: 10
}));
```

### イベント一覧

#### `jobs:addXP`
指定プレイヤーの指定職業にXPとコインを付与。就職していない場合は無視される。

```json
{ "playerName": "Steve", "jobId": "miner", "xp": 50, "coins": 10 }
```

レスポンス（`jobs:res:addXP`）:
```json
{
  "playerName": "Steve",
  "jobId": "miner",
  "leveledUp": false,
  "newLevel": 3,
  "currentXP": 42.5,
  "neededXP": 225,
  "gainedXP": 50,
  "gainedCoins": 10,
  "_ts": 1234567890
}
```

#### `jobs:getPlayerData`
プレイヤーの全職業データを取得。

```json
{ "playerName": "Steve" }
```

レスポンス（`jobs:res:getPlayerData`）:
```json
{
  "playerName": "Steve",
  "jobs": {
    "miner": { "level": 3, "xp": 42.5, "coinBuffer": 0.3, "totalEarned": 158.7 }
  }
}
```

#### `jobs:getJobLevel`
特定職業のレベル・XP進捗を取得。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

レスポンス（`jobs:res:getJobLevel`）:
```json
{
  "playerName": "Steve",
  "jobId": "miner",
  "level": 3,
  "xp": 42.5,
  "needed": 225,
  "percent": 18
}
```

#### `jobs:hasJob`
プレイヤーが職業に就いているか確認。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

レスポンス（`jobs:res:hasJob`）:
```json
{ "playerName": "Steve", "jobId": "miner", "hasJob": true }
```

#### `jobs:joinJob`
プレイヤーを強制的に就職させる（`job_limit` を無視）。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

レスポンス（`jobs:res:joinJob`）:
```json
{ "playerName": "Steve", "jobId": "miner", "success": true }
```

#### `jobs:leaveJob`
プレイヤーを強制的に退職させる。XP・レベルは失われる。

```json
{ "playerName": "Steve", "jobId": "miner" }
```

レスポンス（`jobs:res:leaveJob`）:
```json
{ "playerName": "Steve", "jobId": "miner", "success": true }
```

#### `jobs:registerJob`
カスタム職業を動的に追加。ワールド再起動後も保持される。

```json
{
  "jobId": "blacksmith",
  "name": "鍛冶屋",
  "tag": "[鍛]",
  "color": "§d",
  "description": "金属ブロックを扱う職業",
  "xp_rate": 1.0,
  "coin_rate": 1.0,
  "actions": {
    "break": {
      "minecraft:iron_block": { "xp": [8.0, 14.0], "coins": [3.0, 7.0] },
      "minecraft:gold_block":  { "xp": [12.0, 20.0], "coins": [6.0, 12.0] }
    }
  }
}
```

`actions` に指定できるキー:

| キー | 説明 |
|---|---|
| `break` | ブロック破壊で報酬 |
| `kill` | モブ撃破で報酬 |
| `place` | ブロック設置で報酬（初回のみ） |
| `fish` | 釣り（`junk`・`treasure` キーも使用可） |

報酬値は固定値 `5.0` または範囲 `[3.0, 8.0]` どちらでも可。

レスポンス（`jobs:res:registerJob`）:
```json
{ "jobId": "blacksmith", "success": true }
```

#### `jobs:unregisterJob`
カスタム職業を削除。

```json
{ "jobId": "blacksmith" }
```

レスポンス（`jobs:res:unregisterJob`）:
```json
{ "jobId": "blacksmith", "success": true }
```

#### `jobs:setRate`
倍率をランタイムで変更（ワールド再起動でリセット）。

```json
{ "type": "global_xp",   "value": 2.0 }
{ "type": "global_coin", "value": 0.5 }
{ "type": "job_xp",   "jobId": "miner",  "value": 1.5 }
{ "type": "job_coin", "jobId": "hunter", "value": 3.0 }
```

`type` に指定できる値: `global_xp` / `global_coin` / `job_xp` / `job_coin`

レスポンス（`jobs:res:setRate`）:
```json
{ "type": "global_xp", "value": 2.0, "success": true }
```

### レスポンスの受け取り方

```js
import { world, system } from "@minecraft/server";

system.sendScriptEvent("jobs:getJobLevel", JSON.stringify({
  playerName: "Steve",
  jobId: "miner"
}));

// 5tick後に読む
system.runTimeout(() => {
  const raw = world.getDynamicProperty("jobs:res:getJobLevel");
  if (!raw) return;
  const res = JSON.parse(raw);
  console.log(`Lv.${res.level}  XP: ${res.xp}/${res.needed}`);
}, 5);
```

> **注意**: レスポンスは上書き方式のため、複数プレイヤーから同時リクエストが来ると最後の結果だけ残る。マルチプレイで使う場合は `_ts` タイムスタンプで照合すること。

---

## 報酬値を変更したい場合

`scripts/jobs/` 内の各ファイルを直接編集する。

```js
// 範囲指定（ランダム）
"minecraft:diamond_ore": { xp: [20.0, 30.0], coins: [10.0, 20.0] }

// 固定値
"minecraft:diamond_ore": { xp: 15, coins: 8 }

// コインなし
"minecraft:stone": { xp: [0.3, 0.8], coins: 0 }

// 農夫の成熟度チェック
"minecraft:wheat": { xp: [2.0, 4.0], coins: [0.5, 1.5], require_age: 7, age_state: "growth" }
```

---

## データ保存先

Dynamic Property に保存。ワールドを削除しない限り永続する。

| キー | 種別 | 内容 |
|---|---|---|
| `jobs:playerData` | プレイヤー | 職業レベル・XP・総獲得コイン |
| `jobs:balance` | プレイヤー | 現在の残高（小数） |
| `jobs:placedBlocks` | プレイヤー | 設置済み座標（建築家重複防止、最大5000件） |
| `jobs:customJobs` | ワールド | 外部登録のカスタム職業 |
| `jobs:res:*` | ワールド | APIレスポンス |
