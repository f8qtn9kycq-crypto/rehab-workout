// 供 playwright-cli run-code 讀取；在已啟動的本機 Vite 頁面執行。
async page => {
  const base = 'http://127.0.0.1:4173';
  const results = [];
  for (const width of [320, 375, 390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const id of ['shoulder-flexion', 'glute-bridge']) {
      await page.goto(`${base}/exercise/${id}`);
      const opener = page.getByRole('button', { name: '放大觀看影片' });
      await opener.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      if (!await dialog.evaluate(el => el.matches(':modal'))) throw new Error('未隔離背景');
      const close = dialog.getByRole('button', { name: '關閉', exact: true });
      if (!await close.evaluate(el => el === document.activeElement)) throw new Error('未聚焦關閉按鈕');
      for (const key of ['Shift+Tab', 'Tab', 'Tab', 'Shift+Tab']) {
        await page.keyboard.press(key);
        if (!await page.evaluate(() => Boolean(document.activeElement.closest('dialog')))) throw new Error(`焦點外洩：${key}`);
      }
      const geometry = await close.boundingBox();
      if (!geometry || geometry.width < 44 || geometry.height < 44 || geometry.x < 0 || geometry.y < 0 || geometry.x + geometry.width > width || geometry.y + geometry.height > 800) throw new Error('關閉按鈕不可見或過小');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (overflow) throw new Error('水平溢出');
      await page.screenshot({ path: `output/playwright/video-dialog-${id}-${width}.png` });
      // 跨來源播放器可能自行處理 Escape；驗證應用程式控制項的關閉行為。
      await close.focus();
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      if (await page.locator('dialog').count()) throw new Error('Escape 未關閉');
      if (!await opener.evaluate(el => el === document.activeElement)) throw new Error('未返回開啟按鈕');
      await opener.click();
      await close.click();
      await dialog.waitFor({ state: 'detached' });
      if (await page.locator('dialog iframe').count()) throw new Error('關閉後影片仍存在');
      if (!await opener.evaluate(el => el === document.activeElement)) throw new Error('按鈕關閉未返回焦點');
      results.push({ width, id, result: 'PASS' });
    }
  }
  return results;
}
