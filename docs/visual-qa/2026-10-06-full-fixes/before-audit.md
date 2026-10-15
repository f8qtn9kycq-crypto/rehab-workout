# PR #183 全圖片逐張審核

- Exact head：`4032a5d081ebfc6d25ca14e4c668d45667ec4238`；PR 仍 open、未合併。
- Verdict：**Partial Pass**（依使用者最新回饋）；完整圖片接受／合併 gate：**Fail**。
- 範圍：43 張 runtime PNG、8 個 catalog aliases；未改圖片、程式或 PR head。
- 審查：Codex AI，原始 320×184 全數逐張檢視兩格並比對 exercises.ts；不是獨立盲測／專家／iPhone 真機。
- 最新回饋更正先前概括「pass」：線條尚未一致；不得繼續以舊 Pass 當整體風格核准。
- 風格：7 PASS（沿用核准 quick 控制）、27 FAIL（26 粗線舊 library ＋1 肩胛背部細節）、9 NOT VERIFIED（細線候選仍待逐張重新驗收）。
- 動作：8 FAIL、35 NOT VERIFIED。安全表現：1 FAIL（椅子深蹲缺必要支撐）、42 NOT VERIFIED。
- 手機：43 NOT VERIFIED（完整 current-head/DPR3/四介面）；已有歷史 129 picker 量測通過，不能提升為完整手機 gate Pass。
- `npm run audit:movement-art` 本輪 PASS：8 冷凍參考、43 runtime/source 完整；這不是風格或動作 Pass。尺寸全部320×184，33 張與 main 相同、10 張不同。

## P0
未發現新的 P0；本輪未重跑完整 app safety suite，不以圖片審查宣稱安全邏輯重新驗證。

## P1
1. **粗線風格**：26 張舊 library 候選的輪廓更黑更粗，與 frozen quick 控制不一致；未改不代表已核准。精確 ID／檔案見下表。修 source sheet 或窄 override 後 regenerate，禁止只處理 runtime PNG 或刪 alias。
2. **額外背部線條**：`shoulder-scapular-squeeze` 右格肩胛／背部標線不符稀疏內部筆觸，需局部 source edit 並重新驗收。
3. **圖文語意**：5 個既有 alias（benchPress/squat/latPulldown/seatedRow/legExtension）仍 FAIL；另 neck-wall-posture、shoulder-neck-band-row-low、ankle-band-inversion-eversion 有可觀察的姿勢／固定點／腿姿差異。全部見 observed。不要擅改文字迎合配圖。
4. **證據缺口**：新 hash 需逐張視覺／動作／安全驗收；320/375 四介面及390×844 DPR3尚未完整完成。無比較合適的地板核准 control，保留限制。

## 每張結果
V=風格，M=動作，S=安全表現，P=PASS，F=FAIL，N=NOT VERIFIED。手機均 N。以下 P 僅風格控制，不代表器材或臨床核准。

|#|ID|V|M|S|來源／處置|觀察|
|---|---|---|---|---|---|---|
|1|benchPress|P|F|N|main沿用 / REGENERATE|槓鈴取代文字要求的啞鈴；保留原始參考風格，不可把器材差異當 Pass。|
|2|shoulderPress|N|N|N|本PR10張 / PENDING|前方下巴至肩高度起始，站姿槓鈴可見；線條較接近細線參考。右格過頭幅度須與可控制 ROM 一併審查。|
|3|squat|P|F|F|main沿用 / REGENERATE|圖為負重槓鈴蹲，文字為椅子支援蹲；缺少必要椅子。|
|4|pullUp|P|N|N|main沿用 / PENDING|固定單槓與受控拉起兩格可辨；沒有新的線條偏粗觀察。|
|5|dip|P|N|N|main沿用 / PENDING|固定雙槓與下降兩格可辨；保守下降幅度仍待內容審查。|
|6|latPulldown|P|F|N|main沿用 / REGENERATE|圖為下拉機，文字為固定彈力帶。|
|7|seatedRow|P|F|N|main沿用 / REGENERATE|圖為划船機，文字為坐姿彈力帶。|
|8|legExtension|P|F|N|main沿用 / REGENERATE|圖為雙腿機械膝伸，文字為椅上單腿伸膝。|
|9|shoulder-flexion|N|N|N|本PR10張 / PENDING|前舉至肩高可辨，線條接近參考；手／頭輪廓較精細，需重新逐張風格驗收。|
|10|shoulder-scapular-squeeze|F|N|N|本PR10張 / EDIT|右格增加背部／肩胛內部線條；與參考稀疏細節要求不同，兩格收縮差異仍不易判讀。|
|11|shoulder-external-rotation-band|N|N|N|本PR10張 / PENDING|屈肘與外旋手位可辨；彈力帶連續性／阻力方向需細看，不以圖示合理取代動作驗收。|
|12|shoulder-standing-arm-swings|F|N|N|main沿用 / EDIT|外輪廓粗且深、人物較滿；左格前擺，右格方向與後擺幅度仍需確認。|
|13|shoulder-internal-rotation-band|N|N|N|本PR10張 / PENDING|側向固定帶與跨身內旋可辨；線条接近參考，衣物／頭型細節需再驗收。|
|14|hip-flexion-seated|F|N|N|main沿用 / EDIT|頭／身／椅輪廓粗黑；坐姿抬膝可辨，軀幹控制需審查。|
|15|hip-abduction|F|N|N|main沿用 / EDIT|人物與椅子輪廓粗黑；扶椅側抬腿可辨。|
|16|glute-bridge|N|N|N|本PR10張 / PENDING|細線、水平躺姿留白足；起始與抬臀可辨。無獲核准的地板動作控制圖，不能視 benchPress 為臨床對照。|
|17|hip-clamshell|N|N|N|本PR10張 / PENDING|細線但頭、手足較具體；起始雙膝近伸直、右格屈膝明顯，是否同一屈膝姿勢打開上膝需再確認。|
|18|hip-sit-to-stand|F|N|N|main沿用 / EDIT|人物／椅子粗黑，坐到站兩格可辨且椅子兩格保留。|
|19|shoulder-wall-slide|F|N|N|main沿用 / EDIT|粗黑輪廓與局部裁到大腿；W→Y 可辨，但靠牆支撐未清楚呈現。|
|20|shoulder-neck-chin-tuck|F|N|N|main沿用 / EDIT|粗黑、頭頸特寫而非冠至腰；兩格幾乎同向，內收位移未能可靠辨認。|
|21|neck-isometric|F|N|N|main沿用 / EDIT|粗黑且下半身裁切；左右手抵頭可能是不同方向等長示例，不能因兩格不同就判錯，阻力意圖待確認。|
|22|upper-trap-stretch|F|N|N|main沿用 / EDIT|粗黑、腰下裁切；文字要求坐姿抓椅固定肩膀，圖未呈現椅子／固定手，不能確認支撐。|
|23|pec-doorway-stretch|F|N|N|main沿用 / EDIT|粗黑、腰下裁切；門框與手肘可見，兩格相似可符合維持伸展，不因相似直接 Fail。|
|24|neck-heat-relax|F|N|N|main沿用 / EDIT|粗黑、軀幹裁切；頸部墊物可見但溫熱毛巾不清楚，靜態放鬆不需捏造動作差異。|
|25|neck-rotation-stretch|F|N|N|main沿用 / EDIT|粗黑／裁到髖部；兩格頭部朝向近似，不能可靠辨識轉頭與回正。|
|26|neck-wall-posture|F|F|N|main沿用 / EDIT|粗黑；右格手臂為 W 形，與保持背／頭／臀貼牆的姿勢矯正文字不同，近似牆壁滑行。|
|27|shoulder-neck-thoracic-extension-chair|N|N|N|本PR10張 / PENDING|細線與椅子兩格保留；右格整體後傾明顯，是否上背伸展而非腰部／頸部後仰待確認。|
|28|shoulder-neck-band-row-low|F|F|N|main沿用 / EDIT|粗黑；圖坐地以腳掌端阻力，文字要求胸口高度穩定固定點，器材固定方式不同。|
|29|shoulder-neck-serratus-wall-push|F|N|N|main沿用 / EDIT|粗黑；雙手扶牆可見，兩格肩胛前伸差異細微而不可可靠判讀。|
|30|knee-rice-care|F|N|N|main沿用 / EDIT|粗黑；膝腿約座面高度，未呈現接近心臟高度的墊高；冰敷／加壓兩格不清楚。|
|31|knee-straight-leg-raise|N|N|N|本PR10張 / PENDING|細線與足夠地板留白；一膝彎、一腿伸直抬離地面可辨。|
|32|knee-wall-squat|F|N|N|main沿用 / EDIT|粗黑，右格人物較小；牆面／地面角線形成 U 形，背靠牆接觸與淺蹲角度需確認。|
|33|knee-hamstring-curl|F|N|N|main沿用 / EDIT|粗黑；扶椅屈膝腳跟往臀部可辨。|
|34|knee-calf-raise|F|N|N|main沿用 / EDIT|粗黑；扶椅可見，抬腳跟的幅度在原尺寸較小，需手機大小確認。|
|35|ankle-circles|F|N|N|main沿用 / EDIT|粗黑；坐姿腳踝畫圓兩格足部角度不同，應檢查腳踝而非整條腿移動。|
|36|ankle-alphabet|F|N|N|main沿用 / EDIT|粗黑；坐姿足部角度不同，字母活動為連續動作，兩格不能證明 A–Z 完成。|
|37|ankle-band-inversion-eversion|N|F|N|本PR10張 / REGENERATE|細線但正面足部／鞋底較詳細；雙腿屈曲與文字要求坐地雙腿伸直不同，帶子拉力方向仍需內容確認。|
|38|ankle-single-leg-stand|F|N|N|main沿用 / EDIT|粗黑；椅子旁抬腿可辨，抬腿幅度較大，須確認非側抬腿替代輕屈膝離地。右下有來源殘片。|
|39|ankle-calf-raise|F|N|N|main沿用 / EDIT|粗黑；扶牆與足部接觸可見，頂部留有孤立殘線，腳跟抬起幅度不清楚。|
|40|ankle-gastrocnemius-stretch|F|N|N|main沿用 / EDIT|粗黑；扶牆後腳伸直，靜態維持兩格相似可接受，勿捏造差異。|
|41|ankle-soleus-stretch|F|N|N|main沿用 / EDIT|粗黑；後膝微彎需與直膝版本逐張區分，靜態兩格近似本身不構成 Fail。|
|42|ankle-seated-soleus-raise|F|N|N|main沿用 / EDIT|粗黑；坐椅可見，兩格腳跟上抬差異極小，需手機下確認。|
|43|ankle-single-leg-reach|F|N|N|main沿用 / EDIT|粗黑且頂部殘留來源線；支撐椅可見，兩格伸腿不同，身體控制與接觸需確認。|

## 精確檔案與修正驗收
- 每張 runtime 路徑、SHA256、aliases、effective source、observed/expected、risk、acceptanceCriterion、severity、disposition 均在 `asset-audit.json`。
- 粗線舊圖 canonical source：`scripts/assets/movement-art-sources/manual-workout-library-line-art-v2.png`；推薦按失敗 ID 使用窄 override，避免改動已核准 quick 圖。
- 肩胛圖 source：`scripts/assets/movement-art-sources/overrides/style-v5/shoulder-scapular-squeeze.png` 與 sidecar；runtime `public/exercise-visuals/movements/shoulder-scapular-squeeze.png`。
- 圖文檢查目標：`src/data/exercises.ts`、`movementArtManifest.json`、`movementArtRegistry.ts`；沒有授權將全部內容改成圖片版本。
- 同原始8張等顯示尺寸，逐張確認線條強度、人物、頭身、衣著、手足簡化、props、留白；不要單用「線寬平均」自動定義 Pass。
- 修正必須 source→generator→runtime；8冷凍參考及無關 hash 不變。新 hash 使舊驗收失效。
- 圖像修正後執行 build／來源重建／基準完整性，新增或變更動作語意須 Tier3 Claude＋PM 重審。
- 不以 CI、檔案存在、contact sheet 或 AI 無疑慮當真人／專業／真機核准。

## 下一步
先局部修肩胛筆觸，再依角色／姿勢分批處理26張粗線圖；8個語意 FAIL 分開做內容／器材修正。這是修正建議，本輪 audit 不生成新圖或擴大實作。PR 不合併。
