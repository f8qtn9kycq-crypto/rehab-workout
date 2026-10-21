# 弓步轉體伸展 QA（後膝離地更正）

## 範圍與來源

- 動作 ID：`catalog-worlds-greatest-stretch`；runtime `public/exercise-visuals/movements/catalog-worlds-greatest-stretch.png`。
- 新 SHA-256：`e56a03e5ed57bd48325bf88ad1938fa8d0997ca6fb5d713d52aa8323106caadf`。
- 舊 hash `f364e6edaeadfd77b28a333dfbf8d15c96c0e5a44bb9ba174cb73b9cfa5a27cd` 的跪地姿勢不符合使用者指定示範，動作準確性 FAIL；舊動作／安全呈現 Pass 撤回，不沿用至新圖。
- source：`scripts/assets/movement-art-sources/overrides/worlds-greatest-stretch/` 的 PNG 與 framing sidecar；沿用 maxWidth 110、maxHeight 126，由既有 normalizer 重建，未直接手改 runtime。
- baseline：八張封存 quick 圖不變，hash 稽核通過；沒有核准地板動作 control。
- 命名比較包：`comparison-native.png`、`comparison-mobile-390.png`、`comparison-mobile-375.png`、`comparison-mobile-320.png`；既有 comparison helper 的暫存 scoped 副本僅選此新圖，未改 repo helper。
- 2026-10-21 重測本機 browser picker：新圖寬 236／291／306px（320／375／390 viewport），載入 320×184，40:23，無水平溢出；原 quick 圖寬 238／293／308px。mobile-measurements.json 綁定本次新 hash，僅此範圍，不是完整手機矩陣。

## 四項分開判定

| 項目 | 結果 | 證據與界線 |
|---|---|---|
| 風格一致性 | NOT VERIFIED | 新圖與八張封存圖在 native／手機尺寸並列；服裝、白底、簡化輪廓與單分隔線維持。感知比例、手部細節與線條仍待真人驗收，沒有 blind test。 |
| 動作準確性 | Pass（父代理靜態檢視） | 兩格都為前腳踩穩、後腿向後伸展、後膝離地、後腳前掌支撐、對側手支撐；左右格為下肘與轉體。0:12 原影片提供後腿支撐姿勢核對；並非專業臨床核准。 |
| 安全呈現 | Pass（父代理靜態檢視） | 未以後膝或小腿著地支撐；無額外負重、不要求下肘碰地。文字說明支撐能力、不能穩定時退出、疼痛與紅旗停止門檻。不代表個人適用性。 |
| 手機呈現 | Pass（本機 browser） | 320／375／390px 詳情與 picker 圖片載入、比例及無 overflow；搜尋／選取沿用 canonical 圖。未操作實體 iPhone Safari。 |

## 本機驗證

- `npm test`、`npm run build`、`audit:exercise-coverage`、`audit:safety-i18n`、`audit:movement-art`、`audit:movement-art-sources`、`git diff --check` 通過。
- 47/47 canonical coverage；40 effective overrides 可 byte-for-byte 重建；既有 bundle 大小提醒仍在。只有此動作的來源與 runtime 圖被修改。
- 既有分類 P1 一併修正：canonical catalog-only mobility 缺少 kind 時屬 rehab；不改明確 kind 優先序、不改非 catalog-only 復健分類、不改寫舊 storage。新增 regression 驗證此動作增加 rehab day 且 strength day=0，bench press 仍屬 strength，明確 kind 與輸入不可變性保持。
- 中英文主步驟均已改成後膝離地；detail／regression／progression 不再引導跪地主版本。保留每側次數、下肘停留、App 回合／休息的原有來源邊界。
- 真人風格、實體 iPhone Safari、production NOT VERIFIED。CI 與必要 AI review 綁定最終 head 留在 PR；舊 head 證據不冒充本次結果。

## 真人 walkthrough

在當前 PR head 的 Preview 開啟 `/exercise/catalog-worlds-greatest-stretch?mode=all`，核對後膝離地及後腳前掌支撐；再於 `/logs/new` 搜尋 world／弓步轉體，選取核對同圖，不必保存。與比較包核對線條、比例、兩格動作與支撐。

回報 `head SHA / 裝置瀏覽器 / 風格 Pass或Fail / 動作 Pass或Fail / 裁切溢出 Pass或Fail / 具體觀察`。

## 生成 prompt

使用 built-in imagegen；Image 1 是舊來源 edit target，Image 2 是封存 quick sheet 的風格參考。只改後腿支撐與相應姿勢，prompt 如下：

Use case: precise-object-edit. Image 1 is the existing Rehab Workout exercise source to correct. Image 2 is the frozen quick-sheet STYLE reference only. Correct World's Greatest Stretch to the actual REAR-KNEE-OFF-FLOOR lunge version. Two equal panels on white, simple man in plain T-shirt and shorts, simplified small head/hairline and economical hands/shoes, restrained dark sketch outlines matching reference, no anatomy/shading/text/arrows/outer frame; one thin light gray center divider. Preserve same character, same front leg and left-to-right phase sequence. BOTH panels: right front foot (viewer left) stays flat, knee bent; LEFT REAR LEG EXTENDS LONG BACKWARD toward viewer right, knee lifted CLEARLY OFF THE FLOOR, supported ONLY by curled rear toes/ball of foot, rear heel lifted; no rear shin or knee touches floor, no kneeling. The pelvis is a LOW RUNNER'S LUNGE, torso inclines forward, not upright tall half-kneel. Left supporting palm stays firmly planted inside right front foot. LEFT panel: right elbow lowers gently toward inside of front foot, chest inclined forward, NOT forcing elbow contact. RIGHT panel: SAME foot stance and extended rear leg with knee off floor, left palm planted, chest rotates toward front-leg side and right hand reaches diagonally up; not maximal twist, no lumbar overarch. Exactly two anatomically connected arms and legs per figure. Keep stance length, character size, stroke style and whitespace consistent between phases. Entire front foot, rear toes and raised hand visible. Generous reference-like whitespace; no enlargement to fill box. This is a narrow pose correction, not a redesign.
