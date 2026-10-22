# REVIEW.md

## Review objective

Optimize for merge readiness with minimum additional scope.

Before reviewing, read:
- `AGENTS.md`
- `REVIEW.md`
- `.github/pull_request_template.md`

Use repo-tracked workflow files as the source of truth over pasted chat context when they conflict.

## Review severity

### P0

Must fix before merge.

Use only for:
- build failure
- broken primary flow
- safety regression
- data loss risk
- route/load failure
- severe mobile usability blocker

### P1

Should fix in this PR.

Use for:
- confusing mobile UX
- incomplete QA evidence for changed behavior
- i18n inconsistency
- accessibility issue on primary action
- edge case likely to affect normal users

Do not classify the mere absence of a manual walkthrough, physical-device run, or authenticated preview as P1 when the changed behavior has reliable automated or scripted evidence and no acceptance criterion explicitly requires that environment.

### P2

Backlog only. Do not block merge.

## Review behavior

- Prefer high-confidence findings.
- Avoid subjective style comments.
- Avoid architectural rewrites.
- Avoid duplicate findings.
- If another reviewer already flagged the issue, do not repeat it unless adding new evidence.
- Every P0/P1 finding must include file, behavior, risk, and acceptance criterion.
- Confirm the PR template includes risk tier, safety impact, QA evidence, AI review routing, merge readiness, and post-merge cleanup.
- Do not request Claude / ChatGPT PM synthesis for Tier 0 or Tier 1 PRs unless findings conflict or safety/session/routing risk appears.
- For Tier 2+ PRs, explicitly verify SafetyGate, pain rules, red-flag blocking, session route guards, LocalStorage compatibility, and iOS Safari / SPA routing risk.
- Treat iOS Safari / physical-device testing as a targeted gate, not a blanket gate. Require it only when the changed behavior depends on device/browser behavior that cannot be covered reliably by automated or scripted QA, or when an explicit acceptance criterion requires it.

## 精確 head 審查與合併門檻

- 記錄 repo、PR、base、head branch 與當前 head SHA；push／rebase／head 改變後，先前審查與 QA 不得直接沿用。
- 從即時 branch protection／ruleset 取得 required contexts 與 GitHub App；使用 Check Runs API 核對同一 head SHA 的成功結果。較新的必要 run 尚在執行或失敗時，不以較早成功結果覆蓋。
- Legacy Commit Status 為空不代表 CI 失敗；若相符的 required Check Run 已成功，採用該證據。缺少／過期／Pending／失敗的必要證據不能判 Pass，不建立 synthetic status。
- 檢查未解決的 blocking review threads、active requested changes、必要 review、Draft、衝突及 mergeability；未知／不穩定的狀態重新查詢後才判定。
- 分別報告產品／程式就緒與 workflow／合併就緒。記錄本機、CI、瀏覽器自動化、真人、真機及 production 證據範圍；未量測效能不得宣稱效能最佳化通過。
- 合併前重新核對上述門檻，並以 expected head SHA 執行已授權的合併；本文件與 Pass 結果本身不提供合併授權。

## 彈窗 UX 審查

變更彈窗時驗證背景隔離、初始焦點、Tab／Shift+Tab 循環、enabled 控制項、Escape 的明確語意、關閉後返回觸發按鈕，以及小視窗內控制項可見／可捲動。影片彈窗關閉後應卸載 iframe；退出訓練彈窗的取消／繼續不應改變進度或寫入紀錄。跨來源播放器自行處理的按鍵需另標示證據邊界。

## Exercise illustration review

For changed exercise illustrations or image-ID aliases, apply `docs/exercise-visual-qa.md` and record separate visual, movement, safety-representation and mobile results. Evaluate concrete reference/step mismatches, not subjective taste; a shared URL is not proof of correct movement semantics.

## Draft and ready-for-review policy

Draft means implementation or required automated evidence is incomplete. Once implementation is complete, current-head required checks pass, and there is no known blocking P0/P1, mark the PR Ready for review.

Do not keep a PR in Draft solely because:
- a human walkthrough has not occurred,
- an authenticated Vercel preview cannot be opened by an automation agent,
- a physical iPhone Safari run is absent,
- formal self-approval is unavailable to the sole contributor.

Those items may still be recorded as evidence gaps, but they block merge only when a changed behavior or explicit acceptance criterion genuinely depends on them.

## Sole-contributor approval policy

When the live repository collaborator list contains exactly one contributor and the PR author is that contributor, formal GitHub self-approval is not required as a default merge-readiness gate.

For Tier 0-2 work, current-head checks, required AI review routing, clean mergeability, no active requested changes, no unresolved blocking review threads, and satisfied acceptance criteria are sufficient unless manual evidence is specifically required by the changed behavior.

For Tier 3 work, retain required Claude review and ChatGPT PM synthesis. Add a human walkthrough only when the change includes safety logic, destructive/irreversible data migration, security-sensitive behavior, or another acceptance criterion that cannot be validated reliably by automation.

Never claim a formal GitHub `APPROVE` when none exists.

## Final output

Use this format:

Verdict:
P0:
P1:
Files:
Acceptance criteria:
Suggested next Codex command:
