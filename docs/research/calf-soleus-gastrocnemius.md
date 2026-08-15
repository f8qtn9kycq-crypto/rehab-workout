# Calf / soleus / gastrocnemius research note

## Research summary

本筆記把小腿後側內容拆成兩個常見肌群語境：直膝伸展用來描述 gastrocnemius（腓腸肌）為主的伸展；屈膝、腳跟保持著地的版本用來描述 soleus（比目魚肌）為主的伸展。兩者都只作為動作與感受的產品語言，不代表診斷或治療。

AAOS 的 Foot and Ankle Conditioning Program 同時列出 heel cord stretch、bent-knee heel cord stretch 與雙腳 calf raise，並要求以椅子或牆面協助平衡；NHS inform 也分開說明 gastrocnemius 與 soleus 的小腿伸展。這些來源支持本 PR 的伸展分類、腳跟著地、溫和幅度與雙腳低負荷起點，但不支持本產品自行推導疾病處方或保證效果。

## Product implications

- 先提供牆面支撐的直膝與屈膝伸展，讓使用者看到「腓腸肌／比目魚肌」的差異。
- 先提供坐姿屈膝提踵，再銜接既有的扶持站姿提踵；不把單腳或負重版本當成初階預設。
- 保留文字步驟、注意事項、停止規則、退階與進階；影片只作為搜尋 fallback，本 PR 不新增未驗證的 embed URL。
- 所有內容仍受既有 SafetyGate、PainScale、Recovery Mode 與 red-flag 流程約束；本 PR 不修改那些邏輯。

## Exercise candidates and canonical mapping

| ID | Focus | Type / level | Support | Source |
| --- | --- | --- | --- | --- |
| `ankle-gastrocnemius-stretch` | 直膝小腿伸展，gastrocnemius 為主 | `stretch` / `beginner` | `wall` | AAOS heel cord stretch；NHS gastrocnemius stretch |
| `ankle-soleus-stretch` | 屈膝小腿伸展，soleus 為主 | `stretch` / `beginner` | `wall` | AAOS bent-knee heel cord stretch；NHS soleus stretch |
| `ankle-seated-soleus-raise` | 坐姿屈膝提踵，低負荷肌力起點 | `strength` / `beginner` | `chair` | 以 AAOS 雙腳 calf raise 的雙腳、支撐原則作保守產品化；未加入額外重量 |

三筆資料都使用 `bodyArea: ankle`、既有 `type` 與既有 equipment IDs。現有 `ankle-calf-raise` 已涵蓋扶持站姿雙腳提踵，因此不再新增相同動作。

## Active Aging safety mapping

- 使用牆面或穩固椅子，保持腳跟著地與可控制速度。
- 只做到溫和伸展或可控制的肌肉用力，不以疼痛換取幅度。
- 小腿、阿基里斯腱疼痛增加、腫脹、麻木、無力或失去平衡時停止，依產品安全文字建議諮詢醫師或物理治療師。
- 單腳提踵、未支撐平衡、閉眼、軟墊／不穩定表面、爆發跳躍、階梯邊緣 heel drop 與額外負重不在本 PR 的初階內容。

## Excluded / higher-risk content

本 PR 不新增單腳提踵、閉眼或不支撐平衡、軟墊／不穩定表面、爆發或彈跳提踵、階梯邊緣下降、額外重量，也不把這些內容寫成一般使用者的預設進階。這些項目需要不同的個別評估或更明確的進階條件，不應由本資料變更自行推論。

## Source and video references

- American Academy of Orthopaedic Surgeons, [Foot and Ankle Conditioning Program](https://orthoinfo.aaos.org/en/recovery/foot-and-ankle-conditioning-program/). 參考 heel cord stretch、bent-knee heel cord stretch、雙腳 calf raise、椅子支撐與「運動不應忽略疼痛」的教育提醒。
- NHS inform, [Exercises for foot conditions](https://www.nhsinform.scot/illnesses-and-conditions/muscle-bone-and-joints/leg-and-foot-problems-and-conditions/exercises-for-foot-conditions). 參考 gastrocnemius 與 soleus 小腿伸展分類。
- NHS, [How to stretch after exercising](https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/). 作為一般伸展與溫和幅度的補充參考。

Production entries intentionally keep `youtubeEmbedUrl` empty and use query-based `youtubeSearchUrl` only. This preserves media fallback without claiming endorsement or inventing a source video.
