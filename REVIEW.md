# REVIEW.md

審查前先讀 [AGENTS.md](AGENTS.md)、[單一風險／審查契約](.github/ai-automation.yml)與 [PR template](.github/pull_request_template.md)。目前使用者明確指示決定任務與授權，repo 檔案核對實作現況；舊對話與記憶僅供參考。

## 契約索引

所有分級、審查與合併規則集中於 `.github/ai-automation.yml`，本檔是入口，不維護副本：

| 工作 | 契約 key |
|---|---|
| 風險分級與 AI 審查路由 | `risk_tiers`、`risk_classification_policy` |
| P0／P1／P2、finding 格式與審查範圍 | `review_policy.severity`、`findings`、`routing_and_evidence` |
| 精確 head、required Check Runs／App、threads 與合併 | `review_policy.exact_head_gate` |
| Draft／Ready、條件式真人／真機證據 | `pull_request_state_policy` |
| sole-contributor、正式 review 與授權界線 | `approval_policy`、`auto_merge` |
| 彈窗與動作圖專項審查 | `review_policy.specialized_reviews` |
| 結果格式 | `review_policy.output`、`reporting` |

依接受條件與實際變更收集證據，回報所用的 exact head；不以本索引取代閱讀上述契約。詳細產品操作仍依對應 docs，例如[動作圖 QA](docs/exercise-visual-qa.md)。
