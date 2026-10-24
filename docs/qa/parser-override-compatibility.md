# Parser 相容性與修補驗證

日期：2026-10-24；base `8e8ae0ef082320e564105c37f0ee0786511f95eb`。依工具鏈方案執行隔離實驗；Tier 3 套件安全修補。使用者尚未決定最低瀏覽器版本，因此保留 Tailwind 3.4.19、既有 PostCSS 設定、CSS 與全部 src，不遷移 Tailwind 4。

## 差異與取捨

package.json 以 npm overrides 精確指定 postcss-selector-parser 7.1.6，lock 僅改該套件 version/resolved/integrity。Tailwind 與 postcss-nested 的兩條路徑都解析至同一版本。這跨越上游宣告 major，不能只憑安裝成功或 audit 清零認定相容；未來更新 Tailwind/PostCSS、設定或新 CSS 輸入時需重驗。保留 override 直到上游相容版本可自然解析；不可未驗證就刪除或放寬版本。

[公告 GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) 指 <7.1.6 受影響、7.1.6 修補。repo 目前是可信來源建置期路徑，未證明 production 可利用性。本修補移除本次 npm audit 的已知依賴公告，不等於所有安全風險已消除。

## 本機實際證據

在乾淨隔離工作樹 npm ci --ignore-scripts 後執行 base build，保存 dist；候選安裝後 build、完整 npm test、audit:safety-i18n 均 exit 0。npm ls 確認 Tailwind 3.4.19 → postcss-nested 6.2.0 → parser 7.1.6，Tailwind 直接 parser 亦 dedupe。npm audit snapshot 從同一公告傳播的 3 moderate 受影響套件變為 0；不是獨立的漏洞數量或 GitHub 全部 alerts 清單。

58 個 dist 檔案路徑與每個 byte 全同，包含現行所有 Tailwind/nested 輸出、JS、圖片與 index。CSS SHA256 `e05599f3c82ce658ee25375516373ee085d03bd3f1c98fd1f296186131053064`；JS `44fc9bf976077aa90a71cbbdffe715065fe6ef30db394f3411bd8d409196e802`。因此現有頁面輸出未變；不宣稱新跑過瀏覽器、真機、真人、效能或 production。完整測試沿用現有 safety/session/storage/route 回歸，沒有改其契約。

可重跑：同一 base 與候選各在獨立目錄 npm ci --ignore-scripts、npm run build，使用 SHA256 比對 dist 全部相對路徑與 bytes，再在候選 npm test、npm run audit:safety-i18n、npm ls 與 npm audit --json。任何輸出差異需先解釋，不能只更新基準取得通過。

## 門檻與回退

精確 head 的必要 Codex／Claude／PM 與 CI 結果以 PR 留言為準；請求不是完成，未通過不合併。若修補失敗，回退 package 與 lock 到已知基準，不修改 src、使用者資料、支援版本或安全規則。沒有動作內容或 filters/recommendations 變更，exercise coverage audit 不適用。
