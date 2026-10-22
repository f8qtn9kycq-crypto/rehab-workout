import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_BASE || 'http://127.0.0.1:4180';
const { build } = await import('vite');
const built = await build({configFile:false,logLevel:'silent',build:{lib:{entry:'src/data/sorenessRegions.ts',formats:['es']},write:false,minify:false}});
const output = (Array.isArray(built)?built[0]:built).output.find(x=>x.type==='chunk').code;
const { sorenessRegions: prototypeInventory } = await import('data:text/javascript;base64,'+Buffer.from(output).toString('base64'));
mkdirSync('output/playwright', { recursive: true });
const results = [];
for (const [name, type, executablePath] of [['chromium', chromium, process.env.CHROMIUM_EXECUTABLE], ['webkit', webkit, process.env.WEBKIT_EXECUTABLE]]) {
  const browser = await type.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/logs/soreness');
    const fixture = await page.evaluate(() => {
      localStorage.clear(); localStorage.setItem('rehab.language.v1', 'zh-TW');
      const now = new Date(), date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const legacy = [{ id: crypto.randomUUID(), date, createdAt: now.toISOString(), regions: [{regionId:'rotator',side:'left',tissue:'muscle',severity:0,symptoms:[],note:'legacy 原始備註'}] }];
      const raw = JSON.stringify(legacy); localStorage.setItem('rehab.sorenessEntries.v1', raw); localStorage.setItem('qa.other','unchanged');
      return { raw, id: legacy[0].id };
    });
    await page.reload(); const map = page.getByTestId('soreness-map');
    await map.getByTestId('soreness-position').waitFor();
    assert.match(await page.locator(`[data-entry-id="${fixture.id}"]`).innerText(), /未區分正背面.*旋轉肌群/);
    for (const width of [320,375,390,1280]) {
      await page.setViewportSize({width,height:900});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow ${width}`);
      for (const picker of await map.locator('select').all()) assert((await picker.boundingBox()).height >= 44);
      if(width===375) await map.screenshot({path:`output/playwright/detailed-soreness-${name}-375.png`});
    }
    await page.setViewportSize({width:375,height:900});
    await map.getByTestId('soreness-position').selectOption('scm');
    assert.equal(await map.locator('[data-region-key="F:scm.left"]').getAttribute('data-severity-band'),'unknown');
    await page.getByRole('button',{name:'儲存記錄',exact:true}).click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('rehab.sorenessEntries.v2')),null,'unknown cannot be saved');
    await page.locator('section[aria-labelledby="region-editor-heading"]').getByRole('button',{name:/移除/}).click();
    let count=0;
    for(const r of prototypeInventory) for(const [view, sides] of Object.entries(r.paths)) for(const side of Object.keys(sides)) {
      await map.locator(`[data-view="${view}"]`).click(); await map.locator(`[data-tissue="${r.tissue}"]`).click();
      await map.getByTestId('soreness-layer').selectOption('location'); await map.getByTestId('soreness-zoom').selectOption('full');
      await map.locator(`[data-side="${side}"]`).click(); await map.getByTestId('soreness-position').selectOption(r.id);
      const key=`${view}:${r.id}.${side}`;
      assert.equal(await map.locator(`[data-region-key="${key}"][data-editing="true"]`).count(),1,key);
      await page.locator('section[aria-labelledby="region-editor-heading"]').getByRole('button',{name:'3',exact:true}).click(); count++;
    }
    assert.equal(count,95);
    for(const [view,id,side,score] of [['F','jKnee','left','0'],['B','jKnee','left','6'],['B','jLumbar','center','4']]) {
      await map.locator(`[data-view="${view}"]`).click(); await map.locator('[data-tissue="joint"]').click(); await map.locator(`[data-side="${side}"]`).click();
      await map.getByTestId('soreness-position').selectOption(id); await page.locator('section[aria-labelledby="region-editor-heading"]').getByRole('button',{name:score,exact:true}).click();
    }
    assert.match(await page.locator('#region-editor-heading').innerText(), /腰椎中央區/);
    // 未知草稿與鍵盤原生位置按鈕；不藉由腳本觸發 click。
    await map.locator('[data-view="F"]').click(); await map.locator('[data-tissue="muscle"]').click(); await map.locator('[data-side="left"]').click();
    await map.locator('summary').click(); const keyboard = map.locator('[data-position-key="F:scm.left"]');
    await keyboard.focus(); await page.keyboard.press('Space'); await page.locator('#region-editor-heading').getByText('頸前外側',{exact:false}).waitFor();
    // 候選命中守衛：以測試複本驗證重疊時不由 paint order 自動選取。
    await map.locator('summary').click();
    await map.getByTestId('soreness-layer').selectOption('reference'); await map.getByTestId('soreness-position').selectOption('hipFlexor');
    assert(await map.locator('[stroke-dasharray]').count()>0);
    for(const zoom of ['neck','arms','torso','hip','lower','full']) await map.getByTestId('soreness-zoom').selectOption(zoom);
    await map.getByTestId('soreness-layer').selectOption('location'); await map.getByTestId('soreness-position').selectOption('chest');
    await map.locator('svg').scrollIntoViewIfNeeded();
    const point = await map.locator('[data-region-key="F:chest.left"]').evaluate(el=>{const b=el.getBBox(),p=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(el.getScreenCTM());return{x:p.x,y:p.y};});
    await page.mouse.click(point.x,point.y); assert.match(await page.locator('#region-editor-heading').innerText(), /胸前/);
    await page.getByRole('button',{name:'儲存記錄',exact:true}).click();
    await page.getByRole('status',{name:''}).filter({hasText:'已儲存'}).first().waitFor().catch(async()=>{assert(await page.getByText('身體痠痛記錄已儲存',{exact:false}).count()>0);});
    const stored = await page.evaluate(()=>({legacy:localStorage.getItem('rehab.sorenessEntries.v1'),v2:JSON.parse(localStorage.getItem('rehab.sorenessEntries.v2')),other:localStorage.getItem('qa.other')}));
    assert.equal(stored.legacy,fixture.raw); assert.equal(stored.other,'unchanged'); assert.equal(stored.v2.entries[0].regions.length,95);
    const regions=stored.v2.entries[0].regions;
    assert.equal(regions.find(r=>r.regionId==='jKnee'&&r.view==='F'&&r.side==='left').severity,0);
    assert.equal(regions.find(r=>r.regionId==='jKnee'&&r.view==='B'&&r.side==='left').severity,6);
    assert.equal(regions.find(r=>r.regionId==='jLumbar'&&r.side==='center').view,'B');
    await page.reload(); assert.equal(await page.locator('[data-entry-id]').count(),2);
    page.once('dialog', d=>d.accept()); await page.locator(`[data-entry-id="${fixture.id}"]`).getByRole('button',{name:/刪除/}).click();
    await page.reload(); assert.equal(await page.locator(`[data-entry-id="${fixture.id}"]`).count(),0);
    assert.equal(await page.evaluate(()=>localStorage.getItem('rehab.sorenessEntries.v1')),fixture.raw);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rehab.sorenessEntries.v2')).deletedLegacyIds.length),1);
    await page.evaluate(()=>localStorage.setItem('rehab.language.v1','en')); await page.reload();
    assert.equal(await page.locator('main').getByText(/soreness\.[A-Za-z]/).count(),0);
    assert(!/[\u3400-\u9fff]/.test(await page.locator('main').innerText()), 'English UI leaked Chinese');
    await page.goto(base+'/session/shoulder-flexion'); await page.waitForURL('**/safety'); assert(/safety/.test(page.url()),'direct session guard');
    await page.goto(base+'/scripts/fixtures/detailed-soreness.html');
    const firstMap=page.getByTestId('first-detailed-map'), secondMap=page.getByTestId('second-detailed-map');
    await secondMap.locator('clipPath').waitFor({state:'attached'});
    const ids=await page.locator('[id]').evaluateAll(els=>els.map(e=>e.id)); assert.equal(ids.length,new Set(ids).size,'duplicate SVG ID');
    await firstMap.getByTestId('soreness-position').selectOption('scm');
    assert.equal(await firstMap.locator('[data-editing="true"]').count(),1);
    assert.equal(await secondMap.locator('[data-editing="true"]').count(),0,'selection leaked');
    assert.deepEqual(errors,[]); results.push({browser:name,positions:count,widths:[320,375,390,1280],frontBackIndependent:true,midline:true,legacyBytesPreserved:true,tombstoneReload:true,keyboardSpace:true,layerAndZoom:true,unknownCannotSave:true,multipleInstanceIsolation:true,errors});
  } finally { await browser.close(); }
}
writeFileSync('output/playwright/detailed-soreness-results.json',JSON.stringify(results,null,2)); console.log(JSON.stringify(results,null,2));
