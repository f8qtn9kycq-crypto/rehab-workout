// 在獨立 playwright-cli profile 執行；僅使用該測試 profile 的本機資料。
async page => {
  const base = 'http://127.0.0.1:4173';
  const results = [];
  await page.goto(`${base}/safety`);
  await page.getByRole('checkbox', { name: /^無以上狀況/ }).check();
  await page.getByRole('button', { name: '確認並繼續', exact: true }).click();
  const logs = () => page.evaluate(() => JSON.parse(localStorage.getItem('rehab.trainingLogs.v2') || '[]'));
  for (const width of [320, 375, 390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`${base}/session/shoulder-flexion`);
    const before = await logs();
    const start = page.getByRole('button', { name: '開始訓練', exact: true });
    if (!await start.isDisabled()) throw new Error('未選疼痛仍可開始');
    const pain = page.getByRole('slider', { name: /^開始前疼痛/ });
    await pain.focus();
    await page.keyboard.press('Home');
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
    if (!await start.isDisabled()) throw new Error('疼痛 6 未阻擋');
    await page.getByRole('button', { name: '0｜沒有疼痛', exact: true }).click();
    await start.click();
    await page.getByRole('button', { name: '完成這一組', exact: true }).click();
    const progress = await page.getByRole('status', { name: /^目前第/ }).textContent();
    const exit = page.getByRole('button', { name: '離開訓練', exact: true });
    await exit.click();
    const dialog = page.getByRole('dialog');
    const resume = dialog.getByRole('button', { name: '繼續訓練', exact: true });
    const save = dialog.getByRole('button', { name: '儲存並離開', exact: true });
    if (!await dialog.evaluate(el => el.matches(':modal'))) throw new Error('未隔離背景');
    if (!await resume.evaluate(el => el === document.activeElement)) throw new Error('初始焦點非繼續');
    if (!await save.isDisabled()) throw new Error('未選訓練後疼痛仍可儲存');
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press(i < 4 ? 'Tab' : 'Shift+Tab');
      if (!await page.evaluate(() => Boolean(document.activeElement.closest('dialog')))) throw new Error('焦點外洩');
      if (await page.evaluate(() => document.activeElement.matches(':disabled'))) throw new Error('聚焦停用控制項');
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    if (!await exit.evaluate(el => el === document.activeElement)) throw new Error('未返回離開按鈕');
    if (await page.getByRole('status', { name: /^目前第/ }).textContent() !== progress) throw new Error('Escape 改變進度');
    if (!await page.getByRole('button', { name: '下一組', exact: true }).isVisible()) throw new Error('休息狀態遺失');
    if (JSON.stringify(await logs()) !== JSON.stringify(before)) throw new Error('Escape 寫入紀錄');
    await exit.click();
    await resume.click();
    await dialog.waitFor({ state: 'detached' });
    if (await page.getByRole('status', { name: /^目前第/ }).textContent() !== progress) throw new Error('繼續改變進度');
    await exit.click();
    await dialog.getByRole('button', { name: '0｜沒有疼痛', exact: true }).click();
    const box = await save.boundingBox();
    if (!box || box.height < 44 || box.y < 0 || box.y + box.height > 800) throw new Error('儲存控制項不可見');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('水平溢出');
    await page.screenshot({ path: `output/playwright/session-exit-${width}.png` });
    if (width === 320) {
      await page.evaluate(() => {
        const original = Storage.prototype.setItem;
        window.__restoreSessionQaStorage = () => { Storage.prototype.setItem = original; };
        Storage.prototype.setItem = function(key, value) {
          if (key === 'rehab.trainingLogs.v2') throw new Error('QA quota');
          return original.call(this, key, value);
        };
      });
      await save.click();
      await dialog.getByRole('alert').waitFor();
      if (JSON.stringify(await logs()) !== JSON.stringify(before)) throw new Error('失敗仍寫入');
      if (!await dialog.evaluate(el => el.matches(':modal'))) throw new Error('失敗丟失 modal');
      await page.evaluate(() => window.__restoreSessionQaStorage());
    }
    await save.click();
    await dialog.waitFor({ state: 'detached' });
    await page.locator('#session-saved-title').waitFor();
    const after = await logs();
    if (after.length !== before.length + 1 || after[0].setsCompleted !== 1 || !after[0].stoppedEarly || after[0].painBefore !== 0 || after[0].painAfter !== 0) throw new Error('儲存內容錯誤');
    await page.goto(`${base}/session/shoulder-flexion`);
    await page.getByRole('button', { name: '0｜沒有疼痛', exact: true }).click();
    await start.click();
    await exit.click();
    await dialog.getByRole('button', { name: '不儲存離開', exact: true }).click();
    await page.waitForURL('**/exercises');
    if (JSON.stringify(await logs()) !== JSON.stringify(after)) throw new Error('不儲存離開仍寫入');
    results.push({ width, result: 'PASS' });
  }
  return results;
}
