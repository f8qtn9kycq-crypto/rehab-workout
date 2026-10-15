# AI 審查留言發布驗證（Issue #200）

## 根因與最小修正

失敗 publish run `38039869514` 的 job `114177789307` 顯示 token 的
`Issues: write`、`PullRequests: read`，在成功讀取 PR／SHA 後，建立 PR
conversation comment 時收到 `Resource not accessible by integration (HTTP 403)`。
Repository 預設 workflow token 為 read；本修正不改 repository／account 設定或 PAT。

修正僅在 request／publish job 宣告 `pull-requests: write`，並保留
`issues: write`；workflow 預設改為 read。此權限允許 job 寫入 PR 留言，
也代表 token 具備該 job 範圍的其他 PR 寫入能力，需審閱權限擴充後再部署。
publish 另限制僅從 repository default branch 執行，避免 branch dispatch
被當作受信任的發布證據。工作流程仍只讀 GitHub metadata，不 checkout／執行 PR code。

GitHub API 權限參考：
https://docs.github.com/en/rest/issues/comments#create-an-issue-comment

## 已完成的本機驗證

- YAML 解析與兩段 embedded Bash syntax 通過。
- 兩個 job 明確指定必要權限；無 contents write、PAT 或 Projects token 變更。
- `npm run build` 與 `npm test` 通過。
- stale SHA、closed PR 與 empty result 的拒絕邏輯保留。

## 部署後必須取得的 GitHub runtime 證據

以下均尚未完成；本機測試與人工補貼 marker 不得代替真實發布證據。

1. 在 default branch 更新經核准的 workflow 後，以真實且標示 Tier 3 的
   PR event 確認 bot 成功寫入當前 SHA 的 request comment，記錄 run／comment URL。
2. 同一 SHA 再觸發相同 event，確認只保留一筆 request（dedupe）。
3. `workflow_dispatch` 指向 default branch，使用 open PR 當前完整 SHA
   與實際 PM synthesis，確認 bot 成功發布同 SHA 的 result comment。
4. 使用該 PR 舊 SHA 執行 dispatch，確認 job 失敗且無新增 result comment。
5. 非 default branch dispatch 必須跳過 publish；確認未執行 PR code。
6. 回讀 comment 與 run token permissions，再將證據留在 #200 與修正 PR。

在上述 runtime 矩陣完成前，Issue #200 驗收維持 Pending。
