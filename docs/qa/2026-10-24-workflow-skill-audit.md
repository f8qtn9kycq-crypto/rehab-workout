# 指示、技能、代理與工作流程審查

日期：2026-10-24（Asia/Taipei）。基準：`8e8ae0ef082320e564105c37f0ee0786511f95eb`。
repo：`f8qtn9kycq-crypto/rehab-workout`。

## 判定與範圍

Verdict：Partial Pass。本機實作與驗證完成；GitHub 事件、CI 與技能選單探索尚未驗證。不代表合併就緒或正式 GitHub APPROVE。

P0：未發現產品 P0；本次未修改 `src/`、產品資料、安全門檻、storage 或推薦契約。

原工作區位於既有功能分支，未修改；從即時 main 建立乾淨 clone 與 `codex/workflow-skill-audit`。原先文件／技能入口為 Tier 0；加入 Project 事件與 token 信任邊界修改後，整體保守列 Tier 3，若準備 PR，仍需 current-head Codex／Claude 審查及合併前 PM synthesis。

## 發現、修正與驗收

| 檔案 | 問題與風險 | 已實作與驗收 |
| --- | --- | --- |
| `.agents/skills/`、`AGENTS.md` | 專案技能只在 `ai/skills`，不在 Codex 標準探索目錄。 | 三個相對連結指向既有技能，保留單一來源；連結與技能格式通過，選單實際探索 NOT VERIFIED。 |
| `ai/skills/rehab-workout-issue-to-pr/SKILL.md` | 全面強制 manual mobile QA，與 REVIEW 的條件式 gate 衝突。 | 保留 320／375px QA，接受可靠瀏覽器自動化；明列 automation contract 與 exact-head 審查 routing。 |
| `.github/ISSUE_TEMPLATE/codex_task.yml` | placeholder 冒號使 YAML 解析失敗；風險選項解析為物件，且分類／guard 名稱過時。 | 修正 scalar、Tier 說明與 SafetyRouteGuard 名稱，對齊 QA 政策；解析及欄位型別驗證通過。 |
| `.github/workflows/chatgpt-pm-synthesis.yml`、`.github/ai-automation.yml` | 開 PR 後 edited／labeled 成 Tier 3 可能漏請求。 | 加入事件、保留 exact-head marker 去重，請求 job 依 PR 序列化。實際事件與不重複留言需 main 上線後驗證。 |
| `.github/workflows/project-auto-add.yml`、`.github/workflows/project-review-signal.yml` | Build／review／轉 Draft 後狀態可能不更新。 | 加入 Build 與 review 訊號的 workflow_run、converted_to_draft；多個 PR 可分別解析。review 訊號不使用 PROJECTS_TOKEN，可信 main workflow 才寫 Project；不 checkout、下載或執行 PR 產物。 |
| `.github/workflows/project-auto-add.yml` | Build 名稱相同但來源 App 不符仍可通過；API 失敗可能被誤認無 requested changes。 | 限定 github-actions／當前 head／最新 build，分頁讀取 checks 與 reviews，API 失敗保守阻擋；fixture 通過。Project 狀態不能代替完整合併 gate。 |
| `scripts/workflow-regression.py`、`scripts/workflow-requirements.txt`、`.github/workflows/build.yml` | workflow 與 issue form 缺少本機可重跑的結構／行為驗證。 | 加入 YAML／form 結構、shell 語法與事件／gate fixture，Build 執行相同檢查；PyYAML 僅為固定版本 QA 依賴。 |

## 安裝與代理建議

已執行專案範圍安裝：`.agents/skills` 連結 `rehab-workout-issue-to-pr`、`rehab-exercise-youtube`、`rehab-exercise-image-creation`。在此 clone 使用時下個回合確認探索；原工作區須套用此變更後才可探索。

已查詢官方 curated skills 清單並與本回合可用技能比對。暫不新增全域技能或常駐代理：exact-head review、PR 修復、Playwright、安全審查與 skill creator／installer 已有可用能力；`gh-address-comments`、`gh-fix-ci` 等功能與現有 review skill 重疊。若後續有反覆 CI 診斷瓶頸，再評估窄範圍安裝，避免重複路由與額外載入。

指示維持根契約與依任務載入手冊；沒有複製整份規則或加入每則 prompt 的分類呼叫。此次未改使用者全域設定、token、其他聊天或排程。

依據：[OpenAI 技能探索文件](https://learn.chatgpt.com/docs/build-skills) 支援 repo `.agents/skills` 與相對 symlink；[GitHub 事件文件](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) 說明 workflow_run 需存在 default branch；[GitHub 信任邊界文件](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target) 說明 PR review 與可信 workflow 的差異。

## 本機證據

- `npm ci`、`npm run build`、完整 `npm test`：Pass。
- `scripts/workflow-regression.py`：YAML／form、workflow shell 語法、6 個事件路由、6 個 Build gate、3 個 review gate、2 個 API 失敗情境 Pass。
- 三個 `.agents/skills` 連結皆可讀；使用 skill-creator `quick_validate.py` 均 Pass。
- `git diff --check`：Pass；`src/` 未變動。
- 動作資料與 coverage 未改，本次未要求 exercise-coverage audit；未執行瀏覽器、真人、真機或 production QA。

重跑 workflow QA：在虛擬環境安裝 `pip install -r scripts/workflow-requirements.txt`，執行 `python3 scripts/workflow-regression.py`。

委派紀錄：指定 `gpt-6.1-sol`／實際模型 NOT VERIFIED；跨檔唯讀流程比對，repo／子任務 Tier 0，發現後由父代理以最新 main 重查；首份報告誤用舊 checkout，已要求重新核對並撤回過時項目。指定 `gpt-6-astra` high 檢查 token 信任邊界／實際模型 NOT VERIFIED；額度限制使其未完成，沒有審查結論。父代理完成差異、API 失敗及 fixture 驗證；此項不冒充獨立 Claude 或正式 approval，亦未驗證節費／品質提升。

## 上線後驗收

此紀錄不授權合併。若建立 PR，依 Tier 3 路由並綁定精確 commit SHA。

1. 同 SHA 的 PR 從未分類改成 Tier 3：產生一次必要審查請求；再編輯不重複。
2. Build 開始／失敗／完成、review requested changes／dismissed、PR 轉 Draft：Project 以即時狀態更新。fork review signal 可能需 Actions 核准；必要時用既有 workflow_dispatch 補同步。
3. 新 head 必須重查 checks、threads、reviews、rulesets 及 mergeability；本機 fixture 不作為 GitHub 事件或 Project 寫入證據。
