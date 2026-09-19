# 核心流程 Dogfood 證據表

本表用於 Goal #152 的一週真實使用驗證。請在相關 PR 的 exact-head
自動化檢查通過後，以每次操作為單位，記錄去識別化的核心流程證據；本表不改變產品行為。

搭配以下文件使用：

- `docs/production-ux-verification.md`
- `docs/release-candidate-qa.md`
- `docs/core-flow-smoke-tests.md`
- `docs/accessibility-checklist.md`

不得記錄姓名、聯絡方式、錄音、自由文字病史或其他可識別個人資料。請使用隨機執行
編號，只記錄實際觀察。未執行的證據軌必須填寫 `Pending / Not run`；自動化、
腳本瀏覽器、CI、Preview 或 production 證據不得冒充真人或實體裝置證據。

## 證據類別

| 類別 | 定義 |
|---|---|
| 本機自動化 | 本機 build、單元／回歸測試、audit 或靜態檢查 |
| 腳本瀏覽器 | 指定 viewport 的瀏覽器自動化；不是真人或實體裝置操作 |
| CI / Vercel | GitHub current-head checks 與部署狀態 |
| 真人 walkthrough | 由真人完成流程並回報實際結果 |
| 實體裝置 | 直接在指定實體裝置與瀏覽器執行 |
| Preview | 對 exact PR Preview URL 與 head SHA 執行 |
| Production | 對正式環境執行，且已核對 release SHA |

同一筆證據可同時屬於多個類別，例如「真人 walkthrough + 實體裝置 + Preview」。
不得推論未實際觀察的類別。

## 一週執行索引

每次嘗試都保留一列，包括失敗或中止的嘗試。

| 執行編號 | 日期時間與時區 | 證據類別 | 裝置／viewport | OS + 瀏覽器 | 環境 + URL | Build／head SHA | 語言 | 儲存路徑 | 結果 |
|---|---|---|---|---|---|---|---|---|---|
| `run-____` | `YYYY-MM-DD HH:MM TZ` | `Pending / Not run` |  |  | `Local / Preview / Production` |  | `zh-TW / English` | `Save Log / Save & Exit` | `Pass / Partial / Fail / Abandoned` |

## 單次執行紀錄

每次執行複製一份本節。

### 執行資訊

```text
執行編號：
日期時間與時區：
證據類別：本機自動化／腳本瀏覽器／CI-Vercel／真人 walkthrough／實體裝置／Preview／Production
裝置或 viewport：
OS 與瀏覽器版本：
環境與 URL：Local／Preview／Production
Build 或 exact head SHA：
語言：zh-TW／English
開始時的資料狀態：Fresh／Existing／Seeded test data
儲存路徑：Save Log／Save & Exit
結果：Pass／Partial／Fail／Abandoned
```

### 核心流程

每列填寫 `Pass`、`Partial`、`Fail` 或 `Not reached`，並附一則簡短、可觀察的事實。

| 步驟 | 結果 | 可觀察證據 |
|---|---|---|
| Today 顯示清楚的下一步 |  |  |
| Start 進入預期的 safety／pain-before 流程 |  |  |
| Do 的動作、組數、指示與停止控制可用 |  |  |
| Save Log 或 Save & Exit 接受一次明確操作 |  |  |
| Confirm 清楚顯示儲存狀態 |  |  |
| Confirm 顯示 pain before／after |  |  |
| Confirm 顯示完成組數／預期組數 |  |  |
| Confirm 顯示一個可理解的下一步 |  |  |
| Records 顯示剛儲存的訓練 |  |  |
| 重新整理後紀錄仍存在 |  |  |

### 儲存完整性與復原

```text
明確的儲存操作次數：
執行前的新紀錄數：
執行後的新紀錄數：
預期增量：1
實際增量：
是否出現重複紀錄：Yes／No
若有重複，完整操作順序：

是否刻意測試 storage failure：Yes／No／Not applicable
失敗時沒有顯示已儲存成功：Pass／Fail／Not run
失敗後仍可 retry：Pass／Fail／Not run
storage 恢復後 retry 正好新增一筆：Pass／Fail／Not run
備註：
```

不得在 production 真實資料上刻意製造 storage failure。需要故障注入時，請使用受控的
本機或 Preview 測試 profile。

### 三秒確認理解度

不要預先解釋畫面，請真人測試者約在三秒內回答。記錄實際答案或 `Not run`；不得將
自動化 assertion 當成真人證據。

```text
是否知道訓練已儲存：Yes／No／Unsure／Not run
是否理解 pain before -> after：Yes／No／Unsure／Not run
是否理解完成組數：Yes／No／Unsure／Not run
是否理解下一步：Yes／No／Unsure／Not run
是否需要他人解釋：Yes／No／Not run
簡短去識別化備註：
```

### Records 真實性

| 檢查 | 結果 | 可觀察證據 |
|---|---|---|
| 目前 body area 是 progress focus |  |  |
| 其他 body area 資料未混入 trend |  |  |
| future-dated 資料不影響 focus、count、trend 或 latest outcome |  |  |
| invalid-date 資料不影響 focus、count、trend 或 latest outcome |  |  |
| 資料不足時不宣稱改善或惡化 |  |  |

future／invalid dates 必須使用受控、去識別化的測試資料。不得只為測試而修改真人的歷史紀錄。

### Safety 與 routing regression

| 檢查 | 結果 | 可觀察證據 |
|---|---|---|
| SafetyGate 無法繞過 |  |  |
| Pain `>= 6` 阻擋訓練 |  |  |
| Red flag 阻擋訓練 |  |  |
| SessionRouteGuard 阻擋不安全的直接 session 入口 |  |  |
| 開始前必須填寫 pain-before |  |  |
| 儲存前必須填寫 pain-after |  |  |

Safety blocking 僅使用合成輸入。本表不是醫療建議，也不得要求測試者刻意引發疼痛或症狀。

### Friction 紀錄

只計算實際觀察到的事件。請填 `0`、數字或 `Not observed`。

```text
Hesitation 次數：
Wrong action 次數：
Scroll-search 次數：
Recovery 嘗試次數：
Need explanation 次數：
是否中止流程：Yes／No
第一個 friction 點：
測試者原本預期：
```

### 本次證據界線

```text
本機自動化：Pass／Partial／Fail／Pending／Not run
腳本瀏覽器：Pass／Partial／Fail／Pending／Not run
CI / Vercel：Pass／Partial／Fail／Pending／Not run
真人 walkthrough：Pass／Partial／Fail／Pending／Not run
實體裝置：Pass／Partial／Fail／Pending／Not run
Preview：Pass／Partial／Fail／Pending／Not run
Production：Pass／Partial／Fail／Pending／Not run
證據連結或參照：
```

## 一週彙整

只在預定 dogfood 期間結束後填寫。PR merged、green tests 或一次成功的自動化流程都不等於
portfolio success。

```text
Dogfood 期間：
涵蓋的 exact heads／release SHA：
總嘗試數：
完成核心流程數：
中止流程數：
Duplicate-save failures：
False saved-success states：
Storage failure -> retry failures：
三秒確認理解度 failures：
Body-area isolation failures：
Future／invalid-date truth failures：
Safety 或 routing regressions：
最常見 friction：

Verdict：Pass／Partial Pass／Fail
最大且已有證據的 bottleneck：
下一步：繼續 dogfood／建立一個 scoped P0／不新增 product scope
證據界線與仍 Pending 的項目：
```

只有當本表找出更大且重複出現的 friction，才建立新的產品 P0；否則 Body-first Training
Entry 與其他 feature idea 都不得進入目前的 portfolio WIP。
