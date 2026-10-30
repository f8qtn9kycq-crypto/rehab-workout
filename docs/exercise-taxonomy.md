# 動作尋找用途：Phase A 與 Phase B

2026-10-25 的 Phase A／B 用途基準：47 個官方 ID 的對照由使用者確認。2026-10-30 更新：C1 歷史尋找已由 #250 交付；本次不同次分類見[Strength／Rehab 次層分類](exercise-taxonomy-facets.md)。原主要／次要用途保持。C2／D 尚未啟動。

用途協助使用者尋找動作，不是醫療適用性、當次訓練目的或推薦資格。`Exercise.type`、既有 `kind`、`catalogOnly` 與安全限制各自保留；不複製 ID、不修改動作內容、劑量或歷史資料。

主要用途：復健 37、肌力 10；其中 17 個復健動作亦可從肌力找到，因此兩個入口分別顯示 37／27 項，全部仍只有 47 項。唯一對照來源為 [exercisePurposes.ts](../src/data/exercisePurposes.ts)。

復健次群組為肌力與動作控制、活動度與伸展、照護與放鬆。熱敷／RICE 歸照護；Y／T／W 為復健主要、肌力次要；弓步轉體伸展歸復健活動度。照護群組不宣稱是一般反覆次數運動。

## 已確認的官方動作對照

| ID | 目前名稱 | 主要導覽用途 | 次要導覽用途 | 既有內容理由 | 狀態 | catalogOnly |
|---|---|---|---|---|---|---|
| `shoulder-flexion` | 肩關節前彎運動 | 復健 | — | 肩部活動度與僵硬 | 用途已確認 | 否 |
| `shoulder-scapular-squeeze` | 肩胛骨收縮運動 | 復健 | 肌力 | 肩胛控制與上背肌力 | 用途已確認 | 否 |
| `shoulder-external-rotation-band` | 肩關節外旋運動 | 復健 | 肌力 | 旋轉肌袖與肩部穩定 | 用途已確認 | 否 |
| `shoulder-standing-arm-swings` | 站姿擺臂 | 復健 | — | 低負荷活動與熱身 | 用途已確認 | 否 |
| `shoulder-internal-rotation-band` | 彈力帶肩內旋 | 復健 | 肌力 | 肩部穩定與內旋肌訓練 | 用途已確認 | 否 |
| `hip-flexion-seated` | 髖關節屈曲運動 | 復健 | — | 髖活動度與抬腿控制 | 用途已確認 | 否 |
| `hip-abduction` | 髖關節外展運動 | 復健 | 肌力 | 步態穩定與臀中肌 | 用途已確認 | 否 |
| `glute-bridge` | 臀橋運動 | 復健 | 肌力 | 臀部肌力與骨盆控制 | 用途已確認 | 否 |
| `hip-clamshell` | 蚌殼式 | 復健 | 肌力 | 髖外側肌群與骨盆穩定 | 用途已確認 | 否 |
| `hip-sit-to-stand` | 坐到站 | 復健 | 肌力 | 起身功能與下肢力量 | 用途已確認 | 否 |
| `shoulder-wall-slide` | 牆壁滑行 | 復健 | — | 肩胛與肩部活動控制 | 用途已確認 | 否 |
| `shoulder-neck-chin-tuck` | 下巴內收 | 復健 | — | 頸部位置與動作控制 | 用途已確認 | 否 |
| `neck-isometric` | 頸椎等長收縮 | 復健 | — | 頸部穩定 | 用途已確認 | 否 |
| `upper-trap-stretch` | 上斜方肌伸展 | 復健 | — | 肩頸伸展 | 用途已確認 | 否 |
| `pec-doorway-stretch` | 胸大肌伸展 | 復健 | — | 胸前伸展 | 用途已確認 | 否 |
| `neck-heat-relax` | 熱敷與放鬆擺位 | 復健 | — | 放鬆照護，非運動 | 用途已確認 | 否 |
| `neck-rotation-stretch` | 頸部旋轉伸展 | 復健 | — | 頸部旋轉活動度 | 用途已確認 | 否 |
| `neck-wall-posture` | 貼牆站立姿勢矯正 | 復健 | — | 身體對齊與控制 | 用途已確認 | 否 |
| `shoulder-neck-thoracic-extension-chair` | 椅背胸椎伸展 | 復健 | — | 胸椎活動 | 用途已確認 | 否 |
| `shoulder-neck-band-row-low` | 低位彈力帶划船 | 復健 | 肌力 | 肩胛控制與上背耐力 | 用途已確認 | 否 |
| `shoulder-neck-serratus-wall-push` | 牆面前鋸肌推牆 | 復健 | 肌力 | 低負荷肩胛控制 | 用途已確認 | 否 |
| `knee-rice-care` | 膝蓋急性舒緩 RICE | 復健 | — | 短期照護，非運動 | 用途已確認 | 否 |
| `knee-straight-leg-raise` | 直膝抬腿 | 復健 | 肌力 | 膝部支撐與股四頭肌 | 用途已確認 | 否 |
| `knee-wall-squat` | 靠牆半蹲 | 復健 | 肌力 | 膝部穩定與下肢肌力 | 用途已確認 | 否 |
| `knee-hamstring-curl` | 站姿腿後彎 | 復健 | 肌力 | 腿後肌訓練 | 用途已確認 | 否 |
| `knee-calf-raise` | 膝痛友善小腿提踵 | 復健 | 肌力 | 膝部長期管理與下肢支撐 | 用途已確認 | 否 |
| `ankle-circles` | 坐姿腳踝畫圓 | 復健 | — | 踝活動度 | 用途已確認 | 否 |
| `ankle-alphabet` | 坐姿腳踝字母 | 復健 | — | 踝多方向控制 | 用途已確認 | 否 |
| `ankle-band-inversion-eversion` | 彈力帶腳踝內翻外翻 | 復健 | 肌力 | 踝側向力量與穩定 | 用途已確認 | 否 |
| `ankle-single-leg-stand` | 單腳站立 | 復健 | — | 平衡與穩定 | 用途已確認 | 否 |
| `ankle-calf-raise` | 站姿小腿提踵 | 復健 | 肌力 | 踝支撐與小腿力量 | 用途已確認 | 否 |
| `ankle-gastrocnemius-stretch` | 靠牆直膝小腿伸展 | 復健 | — | 小腿伸展與踝活動度 | 用途已確認 | 否 |
| `ankle-soleus-stretch` | 靠牆屈膝小腿伸展 | 復健 | — | 深層小腿伸展與踝活動度 | 用途已確認 | 否 |
| `ankle-seated-soleus-raise` | 坐姿屈膝提踵 | 復健 | 肌力 | 低負荷小腿力量 | 用途已確認 | 否 |
| `ankle-single-leg-reach` | 單腳觸遠 | 復健 | — | 本體感覺與動態平衡 | 用途已確認 | 否 |
| `catalog-prone-ytw` | 俯臥 Y／T／W | 復健 | 肌力 | 肩胛與上背控制 | 用途已確認 | 是 |
| `catalog-bench-press` | 啞鈴胸推 | 肌力 | — | 胸部與上肢推力 | 用途已確認 | 是 |
| `catalog-shoulder-press` | 槓鈴肩推 | 肌力 | — | 上肢推力 | 用途已確認 | 是 |
| `catalog-side-squat` | 側蹲（Side Squat） | 肌力 | — | 臀腿力量與側向控制 | 用途已確認 | 是 |
| `catalog-rear-foot-elevated-split-squat` | 後腳抬高蹲（徒手／負重） | 肌力 | — | 單側臀腿力量 | 用途已確認 | 是 |
| `catalog-squat` | 負重深蹲 | 肌力 | — | 下肢負重肌力 | 用途已確認 | 是 |
| `catalog-pull-up` | 引體向上 | 肌力 | — | 上肢拉力 | 用途已確認 | 是 |
| `catalog-dip` | 雙槓撐體 | 肌力 | — | 上肢推力 | 用途已確認 | 是 |
| `catalog-lat-pulldown` | 滑輪下拉 | 肌力 | — | 背部拉力 | 用途已確認 | 是 |
| `catalog-seated-row` | 機械坐姿划船 | 肌力 | — | 上背拉力 | 用途已確認 | 是 |
| `catalog-leg-extension` | 機械膝伸 | 肌力 | — | 大腿前側肌力 | 用途已確認 | 是 |
| `catalog-worlds-greatest-stretch` | 弓步轉體伸展 | 復健 | — | 髖與胸椎活動度 | 用途已確認 | 是 |

## 跨頁行為與相容性

動作庫先呈現用途與中英文名稱搜尋；身體部位、收藏、今天適合／全部範圍取交集。用途不會默默將推薦範圍放寬為全部。空結果提供明確清除或切換瀏覽範圍；「全部部位」只在「所有動作」瀏覽範圍顯示，可解除個人評估的預設部位。推薦範圍仍依指定部位或身體評估，並明確說明如何切換瀏覽範圍。

補記保留推／拉／腿快捷群組，復健動作可直接找到，不藏在 More Exercises；私人動作仍保留獨立入口，不能由私人 `kind` 推論官方用途。卡片與詳情顯示相同用途標籤，`catalogOnly` 仍只供查閱與記錄。

Library 用途與搜尋保存在 URL，詳情返回保留條件；Manual 的用途只在當前選擇器狀態，不加入草稿、完成紀錄或新 schema。既有初次開啟補記表單會建立草稿；這次只確保初始化後純搜尋／切換用途不增加儲存寫入。

History 的官方用途來源標示、混合場次與去重已由 C1（#250）交付；保存當次目的或改統計屬 C2。Home／Routine／Session 的導覽擴充屬 Phase D，均不混入次層分類。安全 Body-first 引導不變。

驗證與證據邊界見 [Phase B QA](qa/exercise-discovery-phase-b.md)。
