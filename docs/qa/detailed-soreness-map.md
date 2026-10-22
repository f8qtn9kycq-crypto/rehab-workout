# 詳細痠痛地圖正式整合驗證

## 範圍與風險

Tier 3：新增 v2 儲存相容層與正背面／中央紀錄。沿用已確認原型 `detailed-soreness-refined.html`（SHA-256 `25c78098dce900ece63473c798c2842c759fdc73b62816007dd98aa00cb21c22`）的畫風、原圖比例與37 ID／95路徑。不重新設計人體、不推定疼痛來源。原型視覺已由使用者確認；真人專業解剖定位、實體 iPhone Safari、VoiceOver、production 均 NOT VERIFIED。

程式不包含 PR #230 的趨勢／匯出／備份還原；保留 main 既有0–10存檔與未知不可存規則。SafetyGate、SafetyRouteGuard、pain≥6、紅旗、推薦、訓練資料與其他紀錄鍵不變。舊的 tissue 值維持 muscle／joint 作相容分組，顯示另以肌肉群／深層參照／肌腱／筋膜／關節周圍／其他位置區分。

## 儲存與回退契約

- v1 `rehab.sorenessEntries.v1`：唯讀，原始 bytes 不改寫。舊紀錄標示「舊紀錄·未區分正背面」，沿用原部位名稱、左右、UUID、日期、0值、症狀及備註；不推測 view 或中央。
- v2 `rehab.sorenessEntries.v2`：`{schemaVersion:2,entries,deletedLegacyIds}`。新 regions 必須含合法 `view:F|B`、side:left|right|center；中央僅 B 的 jNeck／jThoracic／jLumbar。每筆最多95個合法身份，UI／儲存身份皆包含 view。
- 每次寫入前重讀兩鍵；v2 entries 在前，再依原順序接上未刪除的 v1 entries。有效紀錄合計最多200筆，備註上限500字。
- 刪除新紀錄移除 v2 entry；刪除舊紀錄加入 v2 tombstone。跨鍵 UUID 衝突、任一鍵損毀或讀取錯誤時拒絕寫入；不偷偷覆蓋。v2 一次 setItem 更新，quota 失敗保留失敗前兩鍵 bytes。
- 清除本機資料涵蓋兩鍵。舊版程式回退仍可讀 v1，但看不到 v2 新增紀錄或刪除標記；原始內容保留，不把回退描述成完整雙向同步。
- 不做資料搬移或背景寫入，正常讀取本身不產生 v2。沒有擴大本機資料匯出或雲端範圍。

## 地圖與互動

- 詳細地圖與動作庫／紀錄篩選共用 `bodyMapGeometry.json`，線稿位於高亮上方，使用同座標裁切與 useId；左右／正背面95個位置各自校準，沒有執行時鏡射。
- 保留六種放大、未知／0／1–3／4–5／6–10色階、多選與深層參照。原生下拉與展開的位置按鈕可完成所有選取；編輯器以視圖、側別、位置命名。
- 點圖先檢查人體輪廓，再收集所有命中候選；不讓 SVG paint order 決定醫學語意。虛線只標觀察區，不畫成深層肌肉完整邊界。
- 原型幾何量測：95 paths的原始面積最低98.81%落在人體內，最終顯示另經人體裁切，同面同分類未測得有面積相交。這是工程量測，不是臨床正確率。

## 驗證與證據

- `npm run build`、完整 `npm test`、`npm run audit:safety-i18n`、`git diff --check`：PASS。既有 >500kB bundle 提示保留，未宣稱效能改善。
- `test:soreness` 包含新的 `soreness-v2-storage-regression.mjs`：全部95個合法新位置與非法組合、legacy74身份、日期／UUID／severity／症狀／備註、0與unknown、兩鍵混讀、tombstone、capacity、corrupt/read/quota bytes保留、讀取／quota retry、clock rollback與clear兩鍵 PASS。
- `scripts/detailed-soreness-browser-qa.mjs`：Chromium／WebKit 各95組實際選取與設定程度、正背面不同分數、中央存檔、未知不可存、多實例ID與狀態隔離、六種放大、深層參照、滑鼠命中、原生按鈕Space、保存／reload／舊紀錄刪除後reload、legacy原始bytes不變、英文無中文洩漏、直接 session→safety PASS。
- 手機320／375／390與桌面1280px無水平溢出；native selects實測至少44px。結果 `output/playwright/detailed-soreness-results.json`；375px截圖同目錄。
- 本機 Playwright CLI 曾因套件載入／網路限制不可用，使用已安裝的 Playwright library 與既有 Chromium／WebKit。這是瀏覽器自動化，不是實體 iPhone 或真人 walkthrough；WebKit完整Tab導覽與VoiceOver仍NOT VERIFIED。
- 瀏覽器腳本以本機Vite dev server執行（預設4180），Playwright安裝路徑及browser executable可透過環境變數指定；不將驗證 fixture 加入正式路由。
- 沒有變更 exercise data/filter/recommendation，因此詳細地圖 PR 不另產生 exercise coverage 報告；相依 #234 同步main後已重跑47動作涵蓋率。

## 37 ID完整性與專業來源對照

觀察區的位置名稱不代表精確組織辨識；原有37 ID與原視圖選項皆保留。前臂掌背方向與深層結構仍不能單從穿衣圖推定。

| ID | 新顯示位置 | 分類 | 來源 |
|---|---|---|---|
| `scm` | 頸前外側 | 肌肉群 | S4 |
| `traps` | 肩頸交界 | 肌肉群 | S2、S4 |
| `chest` | 胸前 | 肌肉群 | S2 |
| `deltoid` | 肩前外側 | 肌肉群 | S2 |
| `biceps` | 上臂前側 | 肌肉群 | S2 |
| `forearmF` | 前臂前側 | 肌肉群 | S2 |
| `abs` | 腹前側 | 肌肉群 | S7 |
| `obliques` | 側腹 | 肌肉群 | S7 |
| `hipFlexor` | 髖前／鼠蹊附近 | 深層參照 | S3、S8 |
| `quads` | 大腿前側 | 肌肉群 | S3、S8 |
| `adductors` | 大腿內側 | 肌肉群 | S8 |
| `itBand` | 大腿外側 | 筋膜 | S9 |
| `shin` | 小腿前外側 | 肌肉群 | S10 |
| `rhomboid` | 肩胛骨內側／肩胛間 | 深層參照 | S2 |
| `lats` | 背部外側 | 肌肉群 | S2 |
| `erector` | 中下背脊柱旁 | 肌肉群 | S4 |
| `rearDelt` | 肩後外側 | 肌肉群 | S2 |
| `rotator` | 肩胛骨後外側 | 深層參照 | S1 |
| `triceps` | 上臂後側 | 肌肉群 | S2 |
| `forearmE` | 前臂後側 | 肌肉群 | S2 |
| `gluteMax` | 臀後側 | 肌肉群 | S8、S11 |
| `gluteMed` | 髖外上側 | 肌肉群 | S8、S11 |
| `hamstrings` | 大腿後側 | 肌肉群 | S3、S8 |
| `calf` | 小腿後側 | 肌肉群 | S3、S8 |
| `achilles` | 後腳跟上方 | 肌腱 | S12 |
| `jNeck` | 頸部旁側 | 其他位置 | S5 |
| `jShoulder` | 肩關節周圍 | 關節周圍 | S1、S6 |
| `jElbow` | 手肘周圍 | 關節周圍 | S6 |
| `jWrist` | 手腕周圍 | 關節周圍 | S6 |
| `jHand` | 手部／手指區 | 其他位置 | S6 |
| `jThoracic` | 胸椎旁 | 其他位置 | S5 |
| `jLumbar` | 腰椎旁 | 其他位置 | S5 |
| `jSI` | 骨盆後側 | 關節周圍 | S13 |
| `jHip` | 髖前／髖關節周圍 | 關節周圍 | S14 |
| `jKnee` | 膝關節周圍 | 關節周圍 | S6 |
| `jAnkle` | 踝關節周圍 | 關節周圍 | S6、S12 |
| `jFoot` | 足部區域 | 其他位置 | S3、S6 |

## 來源

以下僅採用必要的解剖／職責資訊，不從衛教運動方案推導新劑量。

- S1：[AAOS：Rotator Cuff Tears／Anatomy](https://www.orthoinfo.org/diseases--conditions/rotator-cuff-tears/)。
- S2：[OpenStax：肩帶及上肢肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs)。
- S3：[OpenStax：骨盆帶及下肢肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs)。
- S4：[OpenStax：頭頸背部肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back)。
- S5：[OpenStax：脊柱](https://openstax.org/books/anatomy-and-physiology-2e/pages/7-3-the-vertebral-column)。
- S6：[OpenStax：滑液關節解剖](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints) 及 [手足骨骼](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb)、[下肢骨骼](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-4-bones-of-the-lower-limb)。
- S7：[OpenStax：腹壁與胸廓肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax)。
- S8：[UAMS 醫學院：下肢肌肉表](https://medicine.uams.edu/neuroscience/education/medical-school-courses/human-structure-module/anatomy-tables/muscle-tables/muscles-of-the-lower-limb/)。
- S9：[AAOS：Iliotibial Band Anatomy](https://www.orthoinfo.org/diseases--conditions/iliotibial-band-it-band-syndrome/)；交叉參考 [StatPearls：Iliotibial Band](https://www.ncbi.nlm.nih.gov/books/NBK537097/)。
- S10：[University of Washington：脛前肌圖譜文字](https://rad.uw.edu/muscle-atlas/tibialis-anterior)。
- S11：[ACE：Glute Goals／Anatomy of the Glutes](https://www.acefitness.org/resources/pros/expert-articles/9061/glute-goals-an-evidence-based-glute-workout/)。
- S12：[AAOS：Achilles Tendon／Anatomy](https://www.orthoinfo.org/diseases--conditions/achilles-tendon-rupture-tear)。
- S13：[APTA ChoosePT：薦髂關節觀察與評估](https://www.choosept.com/guide/physical-therapy-guide-sacroiliac-joint-dysfunction)。
- S14：[AAOS：Hip Anatomy](https://www.orthoinfo.org/diseases--conditions/acetabular-fractures/)。
- S15：[ACE Personal Trainer Manual：Role and Scope of Practice](https://www.acefitness.org/academy/AcademyElitePDFs/ACE_PT5th_Manual_Ch1.pdf)。

## 委派與審查界線

儲存子任務指定 gpt-6-astra／high；實際模型 NOT VERIFIED（工具未提供獨立執行身分證據）。repo／子任務均Tier 3，原因為資料相容與避免遺失；可寫範圍限storage、clear-key清單與兩支回歸。交付專屬測試PASS；父代理檢查差異並完成build、完整tests、兩瀏覽器實際存刪／reload與legacy bytes不變。整合返工為UI型別與名稱對應，未改儲存設計。

PR建立／head改變後觸發Codex、Claude與ChatGPT PM synthesis，精確head結果與阻塞留PR。請求不等於完成，AI補充審查不是正式GitHub APPROVE；必要結果Pending時不合併。
