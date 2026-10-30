# Strength／Rehab 的次層尋找分類

日期：2026-10-30。基準 main：`b3e719a91928752c149cfb6b8401b42032e76718`（C1 已交付）。本次使用者已授權實作、獨立 QA 聊天驗證、回傳 PM 綜整、修問題及通過後合併；不手動部署。

## 旅程與範圍

回饋要求兩種用途採不同分類。現行 Phase B 已有共同用途入口、搜尋與收藏；這次擴充同一份 `exercisePurposes.ts` 的可多標籤中繼資料，不另建動作庫。

- Strength：推／拉／下肢／核心／其他。下肢再分蹲、髖鉸鏈、弓步／踏階、單關節與其他。
- Rehab：沿用肩、髖、肩頸、膝、踝五個部位；功能有活動度、控制與穩定、肌力、伸展、平衡、照護與其他。
- Library 與 Manual 共用同一篩選函式及元件；Library 次分類保存在 URL，詳情返回保留。Manual 只保留當前選擇器狀態，不加進草稿或完成紀錄。
- 用途切換清除不適用的次分類；搜尋、收藏、結果範圍與既有安全推薦仍取交集。私人動作保留獨立入口，不根據 kind 猜分類。
- 未設定次分類者從「其他／尚未分類」找到；目前沒有明確髖鉸鏈動作，誠實顯示空結果及清除入口，不把臀橋、分腿蹲改名為髖鉸鏈，也不新增動作填滿空缺。
- 臀橋原有 detail／benefits 明列核心，故同時列下肢與核心；下肢模式歸其他。肩內外旋與 Y/T/W 不硬套成整體推拉，保留其他肌力入口。

分類為尋找標籤，不代表療效、個人適用性、當次目的或安全資格。原47個 ID 的 primaryPurpose／secondaryPurposes／rehabGroup 契約雜湊為 `bb9bac8c44ac5900dbdee75dfccbf103006bb32330510fb411a1219123ce9902`，回歸測試鎖定這份 b3e719a 契約；C1 歷史投影不重分類。

## 公開專業來源與使用邊界

- [ACE 教練教材](https://www.acefitness.org/continuing-education/certified/february-2021/7780/how-to-design-body-weight-training-workouts-using-the-ace-integrated-fitness-training-model/) 以動作模式討論蹲／髖鉸鏈、單腳、推、拉及旋轉，支持 Strength 用模式導航；本產品的四大群組與上下層關係是產品設計，不宣稱為唯一標準。
- [AAOS 膝部計畫](https://www.orthoinfo.org/recovery/knee-conditioning-program/)、[肩部計畫](https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program/) 同時涵蓋肌力與柔軟度，也強調個別專業指導；因此 Rehab 的肌力功能不等於改成 Strength 主要用途。
- [澳洲物理治療協會：平衡與移動](https://content.choose.physio/your-lifestage/ageing-well/balance-and-mobility)，內容由物理治療師 Cathie Sherrington 提供，支持將平衡、活動與控制分開辨識。單一使用者的訓練仍需依原評估及安全規則。

以上為2026-10-29查閱的公開專業資料，不代表開源授權或專家審定本 App。沒有複製圖文、劑量或處方。逐筆標籤以本 repo 既有描述／detail／steps／benefits 為依據，未改原動作內容。

## 47項逐 ID 對照

| 官方 ID／既有名稱 | 肌力分類 | 下肢模式 | 復健功能 | 既有內容依據 |
|---|---|---|---|---|
| `shoulder-flexion` 肩關節前彎運動 | — | — | 活動度 | 肩部活動度與僵硬 |
| `shoulder-scapular-squeeze` 肩胛骨收縮運動 | 拉 Pull | — | 控制與穩定、肌力 | 肩胛控制與上背肌力 |
| `shoulder-external-rotation-band` 肩關節外旋運動 | 其他／尚未分類 | — | 控制與穩定、肌力 | 旋轉肌袖與肩部穩定 |
| `shoulder-standing-arm-swings` 站姿擺臂 | — | — | 活動度 | 低負荷活動與熱身 |
| `shoulder-internal-rotation-band` 彈力帶肩內旋 | 其他／尚未分類 | — | 控制與穩定、肌力 | 肩部穩定與內旋肌訓練 |
| `hip-flexion-seated` 髖關節屈曲運動 | — | — | 活動度、控制與穩定 | 髖活動度與抬腿控制 |
| `hip-abduction` 髖關節外展運動 | 下肢 Legs | 單關節動作 | 控制與穩定、肌力 | 步態穩定與臀中肌 |
| `glute-bridge` 臀橋運動 | 下肢 Legs、核心／軀幹 | 其他下肢 | 控制與穩定、肌力 | 臀部肌力與骨盆控制 |
| `hip-clamshell` 蚌殼式 | 下肢 Legs | 單關節動作 | 控制與穩定、肌力 | 髖外側肌群與骨盆穩定 |
| `hip-sit-to-stand` 坐到站 | 下肢 Legs | 蹲 Squat | 控制與穩定、肌力 | 起身功能與下肢力量 |
| `shoulder-wall-slide` 牆壁滑行 | — | — | 活動度、控制與穩定 | 肩胛與肩部活動控制 |
| `shoulder-neck-chin-tuck` 下巴內收 | — | — | 控制與穩定 | 頸部位置與動作控制 |
| `neck-isometric` 頸椎等長收縮 | — | — | 控制與穩定、肌力 | 頸部穩定 |
| `upper-trap-stretch` 上斜方肌伸展 | — | — | 活動度、伸展 | 肩頸伸展 |
| `pec-doorway-stretch` 胸大肌伸展 | — | — | 活動度、伸展 | 胸前伸展 |
| `neck-heat-relax` 熱敷與放鬆擺位 | — | — | 照護與放鬆 | 放鬆照護，非運動 |
| `neck-rotation-stretch` 頸部旋轉伸展 | — | — | 活動度、伸展 | 頸部旋轉活動度 |
| `neck-wall-posture` 貼牆站立姿勢矯正 | — | — | 控制與穩定 | 身體對齊與控制 |
| `shoulder-neck-thoracic-extension-chair` 椅背胸椎伸展 | — | — | 活動度、伸展 | 胸椎活動 |
| `shoulder-neck-band-row-low` 低位彈力帶划船 | 拉 Pull | — | 控制與穩定、肌力 | 肩胛控制與上背耐力 |
| `shoulder-neck-serratus-wall-push` 牆面前鋸肌推牆 | 推 Push | — | 控制與穩定、肌力 | 低負荷肩胛控制 |
| `knee-rice-care` 膝蓋急性舒緩 RICE | — | — | 照護與放鬆 | 短期照護，非運動 |
| `knee-straight-leg-raise` 直膝抬腿 | 下肢 Legs | 單關節動作 | 控制與穩定、肌力 | 膝部支撐與股四頭肌 |
| `knee-wall-squat` 靠牆半蹲 | 下肢 Legs | 蹲 Squat | 控制與穩定、肌力 | 膝部穩定與下肢肌力 |
| `knee-hamstring-curl` 站姿腿後彎 | 下肢 Legs | 單關節動作 | 肌力 | 腿後肌訓練 |
| `knee-calf-raise` 膝痛友善小腿提踵 | 下肢 Legs | 單關節動作 | 控制與穩定、肌力 | 膝部長期管理與下肢支撐 |
| `ankle-circles` 坐姿腳踝畫圓 | — | — | 活動度 | 踝活動度 |
| `ankle-alphabet` 坐姿腳踝字母 | — | — | 活動度、控制與穩定 | 踝多方向控制 |
| `ankle-band-inversion-eversion` 彈力帶腳踝內翻外翻 | 下肢 Legs | 單關節動作 | 控制與穩定、肌力 | 踝側向力量與穩定 |
| `ankle-single-leg-stand` 單腳站立 | — | — | 控制與穩定、平衡 | 平衡與穩定 |
| `ankle-calf-raise` 站姿小腿提踵 | 下肢 Legs | 單關節動作 | 控制與穩定、肌力 | 踝支撐與小腿力量 |
| `ankle-gastrocnemius-stretch` 靠牆直膝小腿伸展 | — | — | 活動度、伸展 | 小腿伸展與踝活動度 |
| `ankle-soleus-stretch` 靠牆屈膝小腿伸展 | — | — | 活動度、伸展 | 深層小腿伸展與踝活動度 |
| `ankle-seated-soleus-raise` 坐姿屈膝提踵 | 下肢 Legs | 單關節動作 | 肌力 | 低負荷小腿力量 |
| `ankle-single-leg-reach` 單腳觸遠 | — | — | 控制與穩定、平衡 | 本體感覺與動態平衡 |
| `catalog-prone-ytw` 俯臥 Y／T／W | 其他／尚未分類 | — | 控制與穩定、肌力 | 肩胛與上背控制 |
| `catalog-bench-press` 啞鈴胸推 | 推 Push | — | — | 胸部與上肢推力 |
| `catalog-shoulder-press` 槓鈴肩推 | 推 Push | — | — | 上肢推力 |
| `catalog-side-squat` 側蹲（Side Squat） | 下肢 Legs | 蹲 Squat | — | 臀腿力量與側向控制 |
| `catalog-rear-foot-elevated-split-squat` 後腳抬高蹲（徒手／負重） | 下肢 Legs | 弓步／踏階 | — | 單側臀腿力量 |
| `catalog-squat` 負重深蹲 | 下肢 Legs | 蹲 Squat | — | 下肢負重肌力 |
| `catalog-pull-up` 引體向上 | 拉 Pull | — | — | 上肢拉力 |
| `catalog-dip` 雙槓撐體 | 推 Push | — | — | 上肢推力 |
| `catalog-lat-pulldown` 滑輪下拉 | 拉 Pull | — | — | 背部拉力 |
| `catalog-seated-row` 機械坐姿划船 | 拉 Pull | — | — | 上背拉力 |
| `catalog-leg-extension` 機械膝伸 | 下肢 Legs | 單關節動作 | — | 大腿前側肌力 |
| `catalog-worlds-greatest-stretch` 弓步轉體伸展 | — | — | 活動度、伸展 | 髖與胸椎活動度 |

## 風險與驗收

Tier 2：瀏覽與選擇器 runtime、URL 狀態及安全相鄰標籤；沒有變更動作內容、推薦規則、schema、writer 或安全邏輯。若需變更這些保護面，須重新分級，不混入本 PR。必要 Codex、建議 Claude、使用者指定獨立 QA 聊天及 PM 綜整均對應精確 head。

驗收：代表動作可從正確入口找到；同一 ID 不重複；搜尋／收藏／部位取交集；無對應動作／未分類可清除；模式切換與詳情返回不遺失條件；兩語言320/375/390px、鍵盤與44px；初始化完成後純篩選零寫入；C1、catalogOnly、pain>=6、red flags 與推薦資格不變。操作次數與完成時間屬實測數據，不事先宣稱真人可在固定秒數完成。

QA 證據見 [本次驗收紀錄](qa/exercise-taxonomy-facets.md)。C2（保存當次目的或改統計）、Home/Routine/Session 延伸及近期表現快捷均不在本次已批准的兩入口分類範圍。
