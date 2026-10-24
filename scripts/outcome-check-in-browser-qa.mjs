// 以 playwright-cli run-code --filename 在隔離 profile 執行；先開啟該 worktree 的 Vite origin。
async page => {
  const base = new URL(page.url()).origin;
  const check = (value, message) => { if (!value) throw new Error(message); };
  const labels = { shoulder: '肩部復健', hip: '髖部復健', shoulder_neck: '肩頸放鬆', knee: '膝蓋舒緩', ankle: '踝關節穩定' };
  const results = [];
  const form = page.locator('#function-check-in');
  const selected = () => form.locator('button[aria-pressed="true"]').innerText();
  const stored = () => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const waitArea = area => form.locator('button[aria-pressed="true"]').filter({ hasText: labels[area] }).waitFor();
  const focus = () => page.waitForFunction(() => document.activeElement?.id === 'outcome-check-in-title');
  const outcomes = () => page.evaluate(() => JSON.parse(localStorage.getItem('rehab.functionalOutcomes.v2') || '[]'));
  // 明確的新 query／Router entry：使用 History API 模擬仍掛載中的 SPA 交接。
  const handoff = (area, key) => page.evaluate(({ area, key }) => {
    history.pushState({ ...history.state, key, idx: (history.state?.idx ?? 0) + 1 }, '', `/logs?outcomeArea=${area}#function-check-in`);
    dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
  }, { area, key });

  await page.goto(base + '/logs');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('rehab.language.v1', 'zh-TW');
    localStorage.setItem('rehab.onboardingSeen.v1', 'true');
    localStorage.setItem('rehab.functionalOutcomes.v2', '[]');
    localStorage.setItem('rehab.trainingLogs.v2', '[]');
    localStorage.setItem('qa-unrelated', 'preserved');
  });
  const beforeNavigation = await stored();
  for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const area of Object.keys(labels)) {
      await page.goto(`${base}/logs?outcomeArea=${area}#function-check-in`);
      await waitArea(area); await focus();
      check(await page.locator('#outcome-check-in-title').evaluate(el => el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().bottom <= innerHeight), '交接標題不在可視範圍');
      check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), '交接表單水平溢出');
      const manual = area === 'shoulder' ? 'ankle' : 'shoulder';
      await form.getByRole('button', { name: labels[manual], exact: true }).click();
      await settle();
      check(await selected() === labels[manual], '手動選取被覆寫');
      results.push({ width, area, result: 'PASS' });
    }
  }
  for (const target of ['/logs', '/logs?outcomeArea=ankle', '/logs?outcomeArea=invalid#function-check-in']) {
    await page.goto(base + target); await form.waitFor(); await settle();
    check(await selected() === labels.shoulder, '一般或非法 URL 改變肩部預設');
  }

  await page.goto(base + '/logs?outcomeArea=ankle#function-check-in'); await waitArea('ankle'); await focus();
  await form.getByRole('button', { name: labels.knee, exact: true }).click();
  await form.locator('textarea').fill('合成未送出備註');
  await form.locator('input[type="range"]').fill('7');
  await page.evaluate(() => { window.__outcomeQaDocument = 'same-document'; });
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.locator('a[href="#records-cycling"]').click(); await page.waitForURL('**#records-cycling'); await settle();
    check(await selected() === labels.knee, '點擊頁內錨點覆寫手動部位');
    await page.goBack(); await page.waitForURL('**#function-check-in'); await focus(); await settle();
    check(await selected() === labels.knee, '同文件 Back 覆寫手動部位');
    await page.goForward(); await page.waitForURL('**#records-cycling'); await settle();
    check(await selected() === labels.knee, '同文件 Forward 覆寫手動部位');
    await page.goBack(); await page.waitForURL('**#function-check-in'); await focus(); await settle();
    check(await selected() === labels.knee, '再次 Back 覆寫手動部位');
    check(await form.locator('textarea').inputValue() === '合成未送出備註' && await form.locator('input[type="range"]').inputValue() === '7', '歷史導覽遺失未送出內容');
    check(await page.evaluate(() => window.__outcomeQaDocument) === 'same-document', '測試意外重新載入文件');
  }
  await handoff('hip', 'qa-explicit-hip'); await waitArea('hip'); await focus();
  await form.getByRole('button', { name: labels.knee, exact: true }).click();
  await handoff('hip', 'qa-repeat-explicit-hip'); await waitArea('hip'); await focus();
  await handoff('shoulder_neck', 'qa-explicit-neck'); await waitArea('shoulder_neck'); await focus();
  check(await form.locator('textarea').inputValue() === '合成未送出備註' && await form.locator('input[type="range"]').inputValue() === '7', '新交接遺失未送出分數或備註');
  check(JSON.stringify(await stored()) === JSON.stringify(beforeNavigation), '僅導覽寫入或改變既有資料');
  await page.screenshot({ path: 'output/playwright/outcome-history-green.png', fullPage: true });
  await form.locator('button[type="submit"]').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('rehab.functionalOutcomes.v2') || '[]').length === 1);
  const saved = await outcomes();
  check(saved[0].bodyArea === 'shoulder_neck' && saved[0].score === 7 && saved[0].note === '合成未送出備註', '明確保存內容錯誤');
  const afterSave = await stored();
  check(Object.keys(beforeNavigation).every(key => key === 'rehab.functionalOutcomes.v2' || beforeNavigation[key] === afterSave[key]), '功能保存改變其他 key');

  // 真正完成非肩部 guided session，再點成功畫面的功能確認 CTA。
  await page.evaluate(() => {
    const now = new Date();
    localStorage.setItem('rehab.safetyGate.v1', JSON.stringify({ completed: true, blocked: false, redFlags: [], safetyDate: now.toLocaleDateString('en-CA'), completedAt: now.toISOString() }));
    localStorage.setItem('rehab.trainingLogs.v2', '[]');
    localStorage.setItem('rehab.functionalOutcomes.v2', '[]');
  });
  await page.goto(base + '/session/hip-flexion-seated');
  await page.getByRole('button', { name: '0｜沒有疼痛', exact: true }).click();
  await page.getByRole('button', { name: '開始訓練', exact: true }).click();
  for (let set = 0; set < 2; set++) {
    await page.getByRole('button', { name: '完成這一組', exact: true }).click();
    await page.getByRole('button', { name: '下一組', exact: true }).click();
  }
  await page.getByRole('button', { name: '完成訓練', exact: true }).click();
  await page.getByRole('button', { name: '0｜沒有疼痛', exact: true }).click();
  await page.getByRole('button', { name: '儲存紀錄', exact: true }).click();
  await page.locator('#session-saved-title').waitFor();
  const sessionBefore = await stored();
  const logs = JSON.parse(sessionBefore['rehab.trainingLogs.v2']);
  check(logs.length === 1 && logs[0].bodyArea === 'hip' && logs[0].setsCompleted === 3 && !logs[0].stoppedEarly && logs[0].painBefore === 0 && logs[0].painAfter === 0, '完成訓練未保存一次或內容改變');
  await page.getByRole('button', { name: '補一個快速確認', exact: true }).click();
  await page.waitForURL('**/logs?outcomeArea=hip#function-check-in'); await waitArea('hip'); await focus();
  check(JSON.stringify(await stored()) === JSON.stringify(sessionBefore), 'Session CTA 導覽寫入紀錄');
  await page.screenshot({ path: 'output/playwright/outcome-session-green.png', fullPage: true });
  await form.locator('button[type="submit"]').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('rehab.functionalOutcomes.v2') || '[]').length === 1);
  check((await outcomes())[0].bodyArea === 'hip', 'Session 交接保存錯誤部位');
  check((await stored())['rehab.trainingLogs.v2'] === sessionBefore['rehab.trainingLogs.v2'], '功能確認重複寫入訓練紀錄');
  return { matrix: results, defaultsAndInvalidUrls: 'PASS', sameDocumentAnchorBackForward: 'PASS', newAndRepeatedExplicitHandoffs: 'PASS', navigationWrites: 0, explicitOutcomeSaveCount: 1, completedHipSessionHandoff: 'PASS' };
}
