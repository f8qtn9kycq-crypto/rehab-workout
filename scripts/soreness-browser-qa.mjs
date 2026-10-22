// Run through playwright-cli run-code in an isolated soreness226 profile.
async page => {
  page.setDefaultTimeout(8000);
  const base = 'http://127.0.0.1:5173';
  const key = 'rehab.sorenessEntries.v1';
  const results = [];
  const engine = page.context().browser().browserType().name();
  for (const width of [320, 375, 390, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto(`${base}/logs/soreness`);
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('rehab.trainingLogs.v2', '[]'); localStorage.setItem('rehab.manualWorkouts.v1', '[]'); localStorage.setItem('rehab.activities.v1', '[]'); localStorage.setItem('rehab.functionalOutcomes.v2', '[]'); });
    await page.reload();
    const old = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([k]) => k !== 'rehab.sorenessEntries.v1')));
    const select = name => page.getByRole('button', { name, exact: true }).last();
    const svg = page.locator('svg[role="group"]');
    const left = svg.getByRole('button', { name: '左側 · 頸肩上側（上斜方肌）', exact: true });
    if (await left.getAttribute('transform') !== null) throw Error('front left mirror');
    const right = svg.getByRole('button', { name: '右側 · 頸肩上側（上斜方肌）', exact: true });
    if (!await right.getAttribute('transform')) throw Error('front right mirror');
    await left.focus(); await page.keyboard.press('Enter');
    await right.focus(); await page.keyboard.press('Space');
    await left.focus(); await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: '左側 · 頸肩上側（上斜方肌）', exact: true }).waitFor();
    if (!await page.locator('#region-editor-heading').evaluate(el => document.activeElement === el)) throw Error('editor focus');
    await page.getByRole('button', { name: '儲存記錄', exact: true }).click();
    if (await page.evaluate(k => localStorage.getItem(k), key)) throw Error('unknown saved');
    if (await left.getAttribute('data-severity-band') !== 'unknown') throw Error('unknown severity colour');
    for (const [value, band, fill] of [[1,'mild','#fde047'],[3,'mild','#fde047'],[4,'moderate','#fdba74'],[5,'moderate','#fdba74'],[6,'high','#fca5a5'],[10,'high','#fca5a5']]) {
      const option = page.getByRole('button', { name: String(value), exact: true });
      await option.click();
      if (await left.getAttribute('data-severity-band') !== band || await left.getAttribute('fill') !== fill) throw Error(`map colour ${value}`);
      if (await option.getAttribute('aria-pressed') !== 'true' || !(await option.getAttribute('class')).includes('ring-2')) throw Error('severity selection lost');
      const chip = page.locator('[aria-label="已選取"]').getByRole('button').first();
      const fallback = select('左側 · 頸肩上側（上斜方肌）');
      for (const target of [option, chip, fallback]) {
        const bg = await target.evaluate(el => getComputedStyle(el).backgroundColor);
        const expected = value <= 3 ? 'rgb(254, 249, 195)' : value <= 5 ? 'rgb(255, 237, 213)' : 'rgb(254, 226, 226)';
        if (bg !== expected) throw Error(`colour mismatch ${value}: ${bg}`);
      }
    }
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '背面', exact: true }).click();
    if (!await svg.getByRole('button', { name: '左側 · 頸肩上側（上斜方肌）', exact: true }).getAttribute('transform')) throw Error('back left mirror');
    await select('左側 · 頸肩上側（上斜方肌）').click();
    if (await page.getByRole('button', { name: '1', exact: true }).getAttribute('aria-pressed') !== 'true') throw Error('traps lost');
    await select('右側 · 頸肩上側（上斜方肌）').click();
    await page.getByRole('button', { name: '4', exact: true }).click();
    await page.getByRole('button', { name: '6', exact: true }).click();
    await page.getByRole('checkbox', { name: /麻木/ }).check();
    await page.getByRole('button', { name: '1', exact: true }).click();
    const neuroRegion = svg.getByRole('button', { name: '右側 · 頸肩上側（上斜方肌）', exact: true });
    if (await neuroRegion.getAttribute('fill') !== '#fde047' || !await page.getByRole('alert').filter({ hasText: /停止訓練/ }).count()) throw Error('neuro warning must not recolour explicit zero');
    await page.getByRole('button', { name: '6', exact: true }).click();
    if (width === 375) {
      await svg.screenshot({ path: `output/playwright/soreness-colors-${engine}-375.png` });
      await page.locator('section[aria-labelledby="region-editor-heading"]').screenshot({ path: `output/playwright/soreness-editor-${engine}-375.png` });
    }
    if (!await page.getByRole('alert').filter({ hasText: /停止訓練/ }).count()) throw Error('no warning');
    await page.getByRole('textbox', { name: /補充說明/ }).fill('<script>draft</script>');
    for (const zoom of ['full', 'neck', 'arms', 'torso', 'hip', 'lower']) { await page.getByRole('combobox').first().selectOption(zoom); if (!await svg.getAttribute('viewBox')) throw Error('zoom missing'); }
    await page.getByRole('combobox').first().selectOption('neck');
    await page.getByRole('button', { name: '關節與區域', exact: true }).click();
    await select('左側 · 頸部').click();
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.evaluate(() => { const original = Storage.prototype.setItem; window.__restoreSoreness = () => { Storage.prototype.setItem = original; }; Storage.prototype.setItem = function(k,v) { if (k === 'rehab.sorenessEntries.v1') throw Error('quota'); return original.call(this,k,v); }; });
    await page.getByRole('button', { name: '儲存記錄', exact: true }).click();
    if (await page.evaluate(k => localStorage.getItem(k), key)) throw Error('quota wrote');
    await page.evaluate(() => window.__restoreSoreness());
    await page.getByRole('button', { name: '儲存記錄', exact: true }).evaluate(el => { el.click(); el.click(); });
    await page.getByRole('button', { name: '新增記錄', exact: true }).waitFor();
    const entries = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    if (entries.length !== 1 || entries[0].regions.length !== 3 || entries[0].regions[0].severity !== 1) throw Error('duplicate/zero/regions');
    await page.reload();
    await page.getByRole('heading', { name: '最近記錄', exact: true }).waitFor();
    const savedZero = page.locator('article li span').filter({ hasText: /^1\/10$/ }).first();
    const savedHigh = page.locator('article li span').filter({ hasText: /^6\/10$/ });
    if (await savedZero.evaluate(el => getComputedStyle(el).backgroundColor) !== 'rgb(254, 249, 195)' || await savedHigh.evaluate(el => getComputedStyle(el).backgroundColor) !== 'rgb(254, 226, 226)') throw Error('reload history colour');
    if (!await page.getByText('<script>draft</script>', { exact: true }).isVisible()) throw Error('note lost/unsafe');
    await page.evaluate(() => { window.confirm = () => false; });
    await page.getByRole('button', { name: /^刪除記錄/ }).click();
    if ((await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key)).length !== 1) throw Error('cancel deleted');
    if (JSON.stringify(old) !== JSON.stringify(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([k]) => k !== 'rehab.sorenessEntries.v1'))))) throw Error('old keys changed');
    const targets = await page.locator('main button, main select, main input[type=date]').evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
    if (targets.some(h => h > 0 && h < 44)) throw Error('small touch target');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('overflow');
    await page.screenshot({ path: `output/playwright/soreness-${engine}-${width}.png`, fullPage: true });
    await page.evaluate(() => { window.confirm = () => true; }); await page.getByRole('button', { name: /^刪除記錄/ }).click();
    if ((await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key)).length !== 0) throw Error('delete failed');
    await page.getByRole('button', { name: '切換到英文', exact: true }).click();
    if (await page.locator('main').evaluate(el => /[\u3400-\u9fff]/.test(el.innerText))) throw Error('English Chinese leakage');
    await page.evaluate(k => localStorage.setItem(k, '{broken'), key); await page.reload();
    if (!await page.getByRole('alert').count()) throw Error('corrupt no alert');
    if (await page.evaluate(k => localStorage.getItem(k), key) !== '{broken') throw Error('corrupt overwritten');
    await page.goto(`${base}/session/shoulder-flexion`);
    await page.waitForURL('**/safety');
    results.push({ width, result: 'PASS' });
  }
  return results;
}
