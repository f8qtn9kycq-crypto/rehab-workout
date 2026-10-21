async page => {
  page.setDefaultTimeout(10000);
  const key = 'rehab.sorenessEntries.v1';
  await page.goto('http://127.0.0.1:5173/logs/soreness');
  await page.evaluate(() => {
    localStorage.clear(); localStorage.setItem('rehab.trainingLogs.v2', '[]');
    const date = new Date(); const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const base = { date:day, createdAt:date.toISOString() };
    localStorage.setItem('rehab.sorenessEntries.v1', JSON.stringify([
      {...base,id:crypto.randomUUID(),regions:[{regionId:'jKnee',tissue:'joint',side:'right',severity:6,symptoms:['numb'],note:'=SUM(1,2)\n"秘密"'}]},
      {...base,id:crypto.randomUUID(),regions:[{regionId:'jKnee',tissue:'joint',side:'right',severity:0,symptoms:[],note:'legacy zero'}]}
    ]));
  });
  await page.reload();
  const tools = page.locator('section[aria-labelledby="soreness-history-tools"]');
  if (await tools.locator('circle').count() !== 1 || await tools.locator('polyline').count()) throw Error('truthful discrete points');
  if (!await tools.getByText('可匯出 1 筆記錄、1 列部位資料',{exact:true}).isVisible()) throw Error('preview counts/interpolation');
  const original = await page.evaluate(k=>localStorage.getItem(k),key);
  await page.getByRole('button',{name:'左側 · 頸肩上側（上斜方肌）',exact:true}).last().click();
  await page.getByRole('button',{name:'3',exact:true}).click();
  if (await page.getByRole('button',{name:'0',exact:true}).count()) throw Error('new zero button');
  await page.getByRole('button',{name:'清除此部位',exact:true}).click();
  if (await page.locator('#region-editor-heading').count()) throw Error('clear failed');
  if (await page.evaluate(k=>localStorage.getItem(k),key)!==original) throw Error('clear mutated history');
  await page.getByRole('button',{name:'左側 · 頸肩上側（上斜方肌）',exact:true}).last().click();
  await page.getByRole('button',{name:'3',exact:true}).click();
  await page.getByRole('textbox',{name:/補充說明/}).fill('DRAFT-EXCLUDED');
  async function download(name) {
    const pending = page.waitForEvent('download'); await tools.getByRole('button',{name,exact:true}).click();
    const file = await pending; const stream = await file.createReadStream(); let result=''; for await (const chunk of stream) result+=chunk.toString('utf8'); return result;
  }
  const csv = await download('下載分享用 CSV');
  if (csv.includes('秘密') || csv.includes('DRAFT-EXCLUDED') || csv.includes('legacy zero') || !csv.includes('jKnee')) throw Error('private export');
  await tools.getByRole('checkbox').check();
  const notes = await download('下載分享用 CSV'); if (!notes.includes("'=SUM(1,2)") || !notes.includes('""秘密""')) throw Error('notes escape');
  const full = await download('下載完整 CSV'); if (!full.includes('legacy zero') || !full.includes('"0"')) throw Error('full zero retained');
  const json = await download('下載完整 JSON 備份'); const backup = JSON.parse(json); if (backup.entries.length!==2 || backup.entries[1].regions[0].severity!==0) throw Error('backup');
  await tools.locator('input[type=date]').first().fill('2099-01-01'); await tools.locator('input[type=date]').last().fill('2000-01-01'); if (!await tools.getByRole('button',{name:'下載分享用 CSV',exact:true}).isDisabled()) throw Error('inverted range enabled');
  await tools.locator('input[type=date]').first().fill(''); await tools.locator('input[type=date]').last().fill('');
  const add = {...backup.entries[0], id:'12345678-1234-4123-8123-123456789abc'};
  const incoming=JSON.stringify({...backup,entries:[add]});
  await tools.locator('input[type=file]').setInputFiles({name:'native.json',mimeType:'application/json',buffer:Buffer.from(incoming)});
  await tools.getByText('已匯入備份',{exact:true}).waitFor();
  if ((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key)).length!==3) throw Error('restore');
  if (await page.getByRole('textbox',{name:/補充說明/}).inputValue()!=='DRAFT-EXCLUDED') throw Error('draft lost');
  await tools.locator('input[type=file]').setInputFiles({name:'native.json',mimeType:'application/json',buffer:Buffer.from(incoming)});
  if ((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key)).length!==3) throw Error('restore duplicates');
  await tools.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
  await tools.getByText(/匯入失敗/).waitFor();
  if ((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key)).length!==3) throw Error('invalid import modified');
  await page.reload(); if (await tools.getByRole('checkbox').isChecked()) throw Error('notes optin persisted');
  const results=[];
  for (const width of [320,375,390,1280]) {
    await page.setViewportSize({width,height:850});
    if (await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('overflow');
    const heights=await tools.locator('button,select,input[type=date]').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height)); if (heights.some(h=>h<44)) throw Error('touch target');
    if (width===375) await tools.screenshot({path:`output/playwright/soreness-trends-${page.context().browser().browserType().name()}.png`});
    results.push({width,result:'PASS'});
  }
  await page.getByRole('button',{name:'切換到英文',exact:true}).click();
  if (await tools.evaluate(el=>/[\u3400-\u9fff]/.test(el.innerText))) throw Error('english leakage');
  if (await page.evaluate(()=>localStorage.getItem('rehab.trainingLogs.v2'))!=='[]') throw Error('training key changed');
  return {engine:page.context().browser().browserType().name(),downloads:'actual downloaded share/full CSV and JSON parsed',restore:'additive, duplicate, invalid, draft preserved',results};
}
