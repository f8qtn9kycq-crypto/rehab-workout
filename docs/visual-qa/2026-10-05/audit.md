# 第一輪 Exercise Visual QA audit — 2026-10-05

**Verdict：Partial Pass（audit 已完成；圖片品質尚未全部驗收通過）。**

本 PR 是 Tier 0：新增規格與 audit 證據，不修改圖片、exercise data、mapping、session 或安全邏輯。以下產品發現是既有 main 的待修問題，不代表本文件 PR 改壞產品，也不會自動回溯撤銷已合併 PR。

## 審查基準與方法

- 審查 main：`3e09c78e2bfd65aa650937147635d19c4ea208bf`（#180）。
- 圖片批次：#175（`761c68a`）與 #177（`f52a3a0`），43 張 runtime PNG；#180 新增的 canonical aliases 也納入檢查。
- Style reference：現行 v2 source sheets、#177 的 320×184 geometry，以及既有 `visual-contract.md`。#160 是歷史基準，不覆蓋後續已接受的視覺調整。
- Reference examples：`benchPress.png`（器材）、`hip-sit-to-stand.png`（全身）、`hip-clamshell.png`／`knee-straight-leg-raise.png`（地板）、`upper-trap-stretch.png`（上半身）。參考圖片只用來比較畫法，不預設其動作與 mapping 全部正確。
- 執行者：Codex，單一 AI 的非盲視覺／文字一致性 screening。不是實際物理治療師／教練審查，也不是獨立人類驗收。
- 對照 `src/data/exercises.ts` 的姿勢、器材、steps／cautions；未查證外部臨床來源，不將「看起來合理」寫成臨床正確。
- 精確 asset path、source cell／override、alias、SHA-256 與逐張結果：[asset-key.csv](asset-key.csv)。匿名排列使用固定 seed `20261005`；只是可重現排序，沒有盲測結果。

## 四個 gate 結果

| Gate | 本輪結果 | 證據／限制 |
| --- | --- | --- |
| Visual consistency | FAIL | 臀橋輪廓較同批地板動作粗；42 張未見明顯整體畫法落差，但僅為 screening，未宣稱獨立視覺驗收 |
| Movement accuracy | FAIL | 6 個 catalog aliases 器材／姿勢不符；另有 7 張圖與文字 steps 明確不符 |
| Safety representation | NOT VERIFIED | 肩前彎過頭示範與目前受控範圍不符；需要內容／安全 review。單腳平衡支撐需進一步確認 |
| Mobile rendering | NOT VERIFIED | 43/43 PNG 尺寸正確，component 使用 40:23；本輪未重新執行 320／375px runtime walkthrough，不能用檔案尺寸代替畫面驗收 |

14 張有具體修正條件（13 張 movement mismatch + 1 張 style mismatch）；其餘 29 張保持 PENDING，不等於已通過全部 gate。沒有確認 SafetyGate、疼痛門檻、route 或資料損失的 P0。

## 具體發現與最小修正

### F1 — P1：canonical aliases 共用到不同器材／姿勢的圖片

**File:** `src/data/movementArtManifest.json`、`src/data/exercises.ts`，以及 6 張 quick assets。

**Behavior:**

| Alias | 文字內容 | 實際圖片 |
| --- | --- | --- |
| `catalog-bench-press` | 啞鈴胸推 | 槓鈴胸推 |
| `catalog-shoulder-press` | 有靠背椅的坐姿啞鈴肩推 | 站姿槓鈴肩推 |
| `catalog-squat` | 椅子深蹲、輕觸椅面 | 槓鈴深蹲，沒有椅子 |
| `catalog-lat-pulldown` | 彈力帶下拉 | 拉力機下拉 |
| `catalog-seated-row` | 彈力帶坐姿划船 | 拉力機坐姿划船 |
| `catalog-leg-extension` | 椅子上單側膝伸直 | 雙側訓練機膝伸直 |

**Risk:** 相同 ID、相同 asset URL 只能證明一致使用，不能證明示範正確。使用者可能照圖選錯器材或姿勢；catalogOnly 也不免除閱讀內容的正確性。

**Acceptance criterion:** 逐 alias 對照文字與圖。保留既有 strength assets 的語意；在 canonical entry 有專屬正確圖之前，移除不精確的 alias 並保留文字 fallback，是最低風險修正。不要為配合圖片而靜默改寫復健／catalog 指示；若決定改內容，另走 Tier 3 review。

### F2 — P1：肩前彎的結束高度不符

**File:** `public/exercise-visuals/movements/shoulder-flexion.png`；library v2 cell (0,0)。

**Behavior:** A07 右圖雙臂高舉過頭；steps 指定向前平舉至肩膀高度。

**Risk:** 圖片暗示更大的預設 ROM，與受控、無痛範圍的文字意圖不一致。

**Acceptance criterion:** 只修正右圖為向前、肩膀高度的終點；保留人物比例、視角與左右起訖順序。內容／安全 reviewer 確認圖文一致。

### F3 — P1：肩胛收縮被畫成站姿抬臂

**File:** `public/exercise-visuals/movements/shoulder-scapular-squeeze.png`；library v2 cell (1,0)。

**Behavior:** A39 站立並抬臂；steps 為坐直、雙手放大腿、肩胛向後下夾緊。

**Risk:** 使用者可能將另一種肩部動作當成指定的肩胛控制。

**Acceptance criterion:** 兩圖使用相同坐姿、手放大腿；呈現肩胛放鬆／收縮的差異，不靠抬臂製造差異。

### F4 — P1：肩內外旋的起始姿勢與阻力不清楚

**File:** `public/exercise-visuals/movements/shoulder-external-rotation-band.png`、`shoulder-internal-rotation-band.png`；library v2 cells (2,0)、(4,0)。

**Behavior:** A03／A23 左圖手臂垂下，沒有文字要求的屈肘 90 度起始；外旋未見彈力帶／毛巾，內旋左圖也沒有連續阻力路徑。

**Risk:** 不易辨認前臂旋轉與整隻手臂外展，可能誤學動作。

**Acceptance criterion:** 兩階段皆保持手肘彎曲貼近軀幹、阻力路徑連續；只改前臂方向。與 written steps 對照並由內容 reviewer 確認。

### F5 — P1：腳踝內翻外翻的 setup 不符

**File:** `public/exercise-visuals/movements/ankle-band-inversion-eversion.png`；library v2 cell (3,5)。

**Behavior:** A05 坐在椅上；文字指定坐地、雙腿伸直。兩階段足部方向差異在原尺寸下也不清楚。

**Risk:** 示範 setup 與文字不同，且使用者難以辨識要移動哪個關節。

**Acceptance criterion:** 依既有步驟呈現坐地伸腿、腳掌帶子位置及內／外翻的可見差異；不靠箭頭或文字補救。若要採椅坐版本，需另行內容決策。

### F6 — P1：胸椎伸展的手部位置不符

**File:** `public/exercise-visuals/movements/shoulder-neck-thoracic-extension-chair.png`；library v2 cell (3,3)。

**Behavior:** A11 雙手置於頭後／頭上；文字指定雙手交叉胸前、眼睛平視。

**Risk:** 示範可能把胸椎活動混成手施力的頸部動作。

**Acceptance criterion:** 雙手交叉胸前、眼睛平視；椅子與支撐穩定，延展由上背表現。保持其他畫法不變。

### F7 — P1：直膝抬腿的起始支撐腿不符

**File:** `public/exercise-visuals/movements/knee-straight-leg-raise.png`；library v2 cell (2,4)。

**Behavior:** A08 左圖兩腿伸直；文字要求一腳膝彎、另一腳伸直。

**Risk:** 使用者難以依圖找到正確起始支撐姿勢。

**Acceptance criterion:** 左右兩階段皆保留非動作腿膝彎、腳掌著地；另一腿受控抬起，人物方向一致。

### F8 — P1：臀橋 contour 與同批地板圖不同

**File:** `scripts/assets/movement-art-sources/overrides/glute-bridge.png`、`public/exercise-visuals/movements/glute-bridge.png`。

**Behavior:** A04 頭、軀幹、大腿外輪廓較 A08／A09 明顯粗，體型與 contour 畫法也較簡化。

**Risk:** 可辨認來源風格差異，未達與既有圖一致的視覺目標；不是已證實的臨床危害。

**Acceptance criterion:** 優先局部 source edit，使輪廓筆觸接近兩個具名地板 reference；保留膝彎、腳掌支撐與左右橋式姿勢。再做匿名一致性 screening，不把「尺寸一致」當成 style pass。

### F9 — 待確認，不列成已證實 P1

A15 `ankle-single-leg-stand`、A31 `ankle-single-leg-reach` 雖有椅子，支撐手接觸在 contact sheet 中不夠清楚；A02 的 band anchor 看起來低於文字指定的胸口位置。下一輪在原圖與實際手機卡片上確認，證實不符後才開 targeted finding。靜態 stretch／isometric／heat care 也需具名內容 review，不能僅因兩階段相似判錯。

## 逐張審查

完整 43 列見 [asset-key.csv](asset-key.csv)：每張記錄 visual screening、movement gate、safety gate、mobile gate、disposition 與理由。`PASS (screening only)` 是畫法未見明顯落差，不代表四 gate PASS。所有 safety／mobile gate 仍標示 NOT VERIFIED。

## 匿名 packet 與盲測限制

提供只含 A01–A43 的圖片供 reviewer 先看；**不要先提供本報告或 asset-key.csv**。

- [Contact sheet 1](contact-1.png)
- [Contact sheet 2](contact-2.png)
- [Contact sheet 3](contact-3.png)
- [獨立 reviewer 回覆表](blind-response.csv)（全部 PENDING）

本批 43 張都經 #177 重產生，沒有同一現行 framing 下未改動的舊圖控制組。因此可進行匿名跨來源一致性 screening，但不能宣稱完成有效的「辨識新舊」blind test。後續新增圖片時凍結這批經確認的控制圖；按規格再建立候選／控制混合試驗。Codex 已看過來源鍵值，本輪不冒充獨立盲測 reviewer。

## 建議修正順序與驗證

1. F1：先隔離 6 個不精確 alias，驗證 canonical 圖文匹配及文字 fallback，不改寫既有存檔 ID。
2. F2／F3／F4／F6／F7：優先修復圖文與預設動作範圍落差，依 safety/content scope 提升 review tier。
3. F5 與 F8：校正 setup／動作可辨識性、輪廓一致性；再測手機尺寸與獨立匿名 screening。

圖片修改走既有 creation skill；generator 僅支援 macOS，本輪 Linux 未重產生圖片。未建立額外 skill，未執行合併。這份 audit 不以「需再確認」包裝成全部通過，也不要求文件 PR 等全部產品缺失修好才能合併。

## 本文件 PR 的驗證

- `npm run build`：PASS；既有大型 chunk 警告，沒有 build failure。
- `npm test`：PASS（含 manual-workout regression）。這證明既有程式 regression checks 通過，不能推論動作圖正確。
- 43 張 PNG：路徑存在、320×184、SHA-256 對照全部通過。
- 匿名 key／回覆表：43 個唯一 ID；14 EDIT／29 PENDING。
- `git diff --check`：PASS。
- 變更限於 docs、REVIEW 與 PR template；`src/`、runtime assets、generator、package／config 未變。SafetyGate、疼痛門檻、red flags、SessionRouteGuard、LocalStorage 與 recommendation 邏輯未修改。
- Exercise coverage audit 不適用：本次沒有改 exercise data、filters、recommendations 或 coverage docs。
