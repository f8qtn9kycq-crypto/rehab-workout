# 弓步轉體伸展 QA

## 範圍與來源

- 新增 `catalog-worlds-greatest-stretch`；canonical runtime `public/exercise-visuals/movements/catalog-worlds-greatest-stretch.png`。
- SHA-256：`f364e6edaeadfd77b28a333dfbf8d15c96c0e5a44bb9ba174cb73b9cfa5a27cd`。
- source：`scripts/assets/movement-art-sources/overrides/worlds-greatest-stretch/` 的 PNG 與 framing sidecar。沿用 normalizer，maxWidth 110、maxHeight 126，非直接手改 runtime。
- baseline：`approved-style-baseline.json` 的八張封存參考，hash 稽核通過；無核准地板動作 control。沒有更改既有圖或 mapping。
- 命名比較包：同目錄 `comparison-native.png`、`comparison-mobile-390.png`、`comparison-mobile-375.png`、`comparison-mobile-320.png`。由既有 `create-movement-art-review.py` 的暫存 scoped 副本僅選新 ID 產生，未改 repo helper。mobile-measurements.json 記錄本機 browser picker 實測寬度並綁定圖片 hash；不是完整手機矩陣或真人證據。

## 四項分開判定

| 項目 | 結果 | 證據與界線 |
|---|---|---|
| 風格一致性 | NOT VERIFIED | 已與八張封存圖在 native／手機尺寸並列；T-shirt、短褲、白底、簡化輪廓與單分隔線維持。頭身比例、手部細節與感知人物比例仍待真人驗收；沒有 anonymous blind test。 |
| 動作準確性 | Pass（父代理靜態檢視） | 兩格前腳同側、後膝著地、另一手支撐，左格下肘、右格轉體；不宣稱專業臨床審查。完整連續五步仍需讀文字與影片。 |
| 安全呈現 | Pass（父代理靜態檢視） | 後膝著地、不負重、不要求手肘碰地；寫明支撐能力、降階及停止規則。無法從插圖推定動作對個人適用性。 |
| 手機呈現 | Pass（本機 browser） | 320／375／390px 詳情與補記 picker 無橫向溢出；新 PNG 成功載入，picker 實測寬 236／291／306px、比例 40:23；選取後沿用同 canonical 圖。不是實體 iPhone Safari。 |

## 本機驗證

- `npm run build`、`npm test`、`npm run audit:exercise-coverage`、`npm run audit:safety-i18n`、`npm run audit:movement-art`、`npm run audit:movement-art-sources`、`git diff --check` 通過。
- coverage 46/46；40 effective overrides 可 byte-for-byte 重建。既有 bundle >500 kB 提醒不屬新增失敗。
- browser 核對：中英文詳情、原影片 embed、五步／安全／調整可讀、catalog-only 無 guided start、英文 world 搜尋可選取補記。
- 未完成：真人視覺驗收、實體 iPhone Safari、production；CI 與必要 Claude 審查於 PR 記錄，不以此文件推定通過。

## 生成 prompt

Create ONE new two-phase exercise illustration source for Rehab Workout: World's greatest stretch, conservative rear-knee-on-floor version. Reference image is STYLE ONLY: match its simplified small-headed adult man, short hair, plain T-shirt and shorts, economical shoes and hands, restrained dark sketch outlines, no anatomical detail, no eyes/mouth, plain white background. Wide 40:23 composition split in two equal panels by a single light gray vertical divider; no text, no arrows, no outer frames, no shading. Each panel has one COMPLETE small full-body person centered with generous whitespace, same character and limb placement. Three-quarter FRONT view, right leg forward (viewer left), entire right foot planted, right knee bent roughly above ankle; left knee and shin REST ON FLOOR behind. LEFT panel: left palm firmly on floor inside right foot, right elbow gently lowered toward inside right ankle WITHOUT forcing elbow to ground, spine long. RIGHT panel: SAME knees and feet remain planted, left palm stays planted, chest gently rotates to right toward front leg, right arm reaches diagonally upward in comfortable rotation, not maximal end range; head follows chest with neutral neck. No rear knee hovering, no deep split or forced contortion. Match restrained figure scale of reference bench press/dip, not enlarged to fill panel. Precisely two arms and two legs each, anatomically continuous. This image depicts middle elbow-lowering and final thoracic-rotation stages; written instructions will describe setup and knee opening.

## 真人回報格式

在 PR 當前 head 的 Preview 開啟 `/exercise/catalog-worlds-greatest-stretch?mode=all` 及 `/logs/new`，搜尋 world／弓步轉體；對照比較包確認人物比例、線條、兩格動作與安全支撐，再選取確認同圖。

`head SHA / 裝置瀏覽器 / 風格 Pass或Fail / 動作 Pass或Fail / 裁切溢出 Pass或Fail / 具體觀察`。
