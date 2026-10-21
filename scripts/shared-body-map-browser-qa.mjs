// Execute with playwright-cli run-code in a fresh profile; base defaults to local Vite.
async page => {
  const base = 'http://127.0.0.1:4178';
  const results = [];
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const width of [320, 375, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/logs`);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('rehab.language.v1', 'zh-TW');
      const date = new Date(); const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      localStorage.setItem('rehab.manualWorkouts.v1', JSON.stringify([{id:'qa-mixed',date:day,createdAt:date.toISOString(),exercises:[
        {name:'QA hip snapshot',bodyArea:'hip',equipment:'',sets:[{reps:8}]},
        {name:'QA shoulder snapshot',bodyArea:'shoulder',equipment:'',sets:[{reps:6}]}
      ]}]));
    });
    await page.reload();
    const storage = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
    const filter = page.locator('section[aria-labelledby="records-body-area-title"]');
    const recent = page.locator('section[aria-labelledby="records-recent-title"]');
    const weekly = page.locator('section[aria-labelledby="records-week-title"]');
    const summary = await weekly.innerText();
    await filter.getByRole('button', {name:'髖部復健',exact:true}).last().click();
    await recent.getByText('符合部位的動作：QA hip snapshot', {exact:true}).waitFor();
    if (!await recent.getByText('QA shoulder snapshot', {exact:true}).count()) throw Error('mixed card truncated');
    const knee = filter.getByRole('button', {name:'膝蓋舒緩',exact:true}).last();
    await knee.focus(); await page.keyboard.press('Enter');
    await recent.getByText('目前沒有「膝蓋舒緩」的近期活動紀錄。', {exact:true}).waitFor();
    await filter.getByRole('button', {name:'踝關節穩定',exact:true}).last().focus(); await page.keyboard.press('Space');
    await recent.getByText('目前沒有「踝關節穩定」的近期活動紀錄。', {exact:true}).waitFor();
    await filter.getByRole('button', {name:'清除部位篩選',exact:true}).click();
    if (await weekly.innerText() !== summary) throw Error('weekly stats changed');
    if (await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage)))) !== storage) throw Error('filter wrote storage');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`logs overflow ${width}`);
    if (width === 375) await filter.screenshot({path:'output/playwright/shared-body-records-375.png'});
    await page.goto(`${base}/exercises?mode=all`);
    const map = page.locator('svg').filter({has:page.locator('clipPath')}).first();
    if (await map.locator('image').count()) throw Error('PNG still in body map');
    for (const name of ['肩頸放鬆','肩部復健','髖部復健','膝蓋舒緩','踝關節穩定']) {
      const button = map.getByRole('button',{name:new RegExp(`^${name}`)});
      if (await button.getAttribute('aria-disabled') !== 'true') {
        await button.focus(); await page.keyboard.press('Enter');
        if (await button.getAttribute('aria-pressed') !== 'true') throw Error(`SVG keyboard ${name}`);
      }
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`library overflow ${width}`);
    if(width===375)await map.screenshot({path:'output/playwright/shared-body-library-375.png'});
    const shoulderTarget = map.getByRole('button', {name:/^肩部復健/});
    if (await shoulderTarget.getAttribute('aria-disabled') !== 'true') {
      const bounds = await map.boundingBox();
      await page.mouse.click(bounds.x + bounds.width * 650 / 1024, bounds.y + bounds.height * 390 / 1536);
      if (await shoulderTarget.getAttribute('aria-pressed') !== 'true') throw Error('SVG pointer hit missed shoulder');
    }
    // Two real selectors in the same React tree; dev-only fixture avoids duplicate React imports.
    await page.goto(`${base}/scripts/fixtures/shared-body-map.html`);
    const first = page.getByTestId('first-map');
    const second = page.getByTestId('second-map');
    await second.locator('clipPath').waitFor({state:'attached'});
    if (!await second.getByRole('button',{name:/^肩部復健/}).last().isDisabled()) throw Error('zero availability enabled');
    const ids=await page.locator('clipPath').evaluateAll(els=>els.map(e=>e.id));
    if(ids.length!==2 || new Set(ids).size!==ids.length)throw Error('duplicate clip IDs');
    await first.getByRole('button',{name:'髖部復健',exact:true}).last().click();
    if(await second.getByRole('button',{name:/^髖部復健/}).last().getAttribute('aria-pressed')!=='false')throw Error('selection leaked between instances');
    results.push({width,records:'pass',library:'pass',uniqueClipIds:ids,overflow:false});
  }
  if(errors.length)throw Error(errors.join('\n'));
  return results;
}
