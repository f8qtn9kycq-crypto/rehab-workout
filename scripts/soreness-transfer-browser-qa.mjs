// Run via playwright-cli run-code --filename against an isolated Vite origin.
async page => {
  const base = 'http://127.0.0.1:4181';
  const check = (value, message) => { if (!value) throw Error(message); };
  async function download(button) {
    const event = page.waitForEvent('download'); await button.click();
    const file = await event, stream = await file.createReadStream();
    let content = ''; for await (const chunk of stream) content += chunk.toString();
    check(!await file.failure(), 'download failed'); return content;
  }
  const results = [];
  for (const language of ['zh-TW', 'en']) for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/logs/soreness');
    const fixture = await page.evaluate(language => {
      localStorage.clear(); localStorage.setItem('rehab.language.v1', language);
      const date = new Date();
      const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const region = (view, severity, note) => ({regionId:'traps',tissue:'muscle',side:'left',...(view?{view}:{}),severity,symptoms:['sore'],note});
      const entry = regions => ({id:crypto.randomUUID(),date:day,createdAt:new Date().toISOString(),regions});
      const legacy = entry([region(undefined,4,'=SECRET-LEGACY')]);
      const hidden = entry([region(undefined,9,'HIDDEN-DELETED')]);
      const modern = entry([region('F',2,'SECRET-FRONT'),region('B',0,'SECRET-BACK')]);
      const raw = JSON.stringify([legacy,hidden],null,2);
      localStorage.setItem('rehab.sorenessEntries.v1',raw);
      localStorage.setItem('rehab.sorenessEntries.v2',JSON.stringify({schemaVersion:2,entries:[modern],deletedLegacyIds:[hidden.id]}));
      localStorage.setItem('unrelated-test-key','unchanged');
      return {legacy,hidden,modern,raw};
    }, language);
    await page.reload();
    const tools = page.locator('section[aria-labelledby="soreness-transfer-title"]');
    await tools.locator('summary').first().click();
    const notes = tools.getByRole('checkbox'); check(!await notes.isChecked(),'notes default enabled');
    const shared = await download(tools.locator('details').first().getByRole('button'));
    check(!shared.includes('SECRET') && !shared.includes('HIDDEN'),'private data in default share');
    check(shared.includes('"0"') && shared.includes('"F"') && shared.includes('"B"'),'share lost zero/view');
    await notes.check();
    const opted = await download(tools.locator('details').first().getByRole('button'));
    check(opted.includes('SECRET-FRONT') && opted.includes("'=SECRET-LEGACY"),'opt-in/formula escaping');
    await tools.locator('summary').nth(1).click();
    const backupDetails = tools.locator('details').nth(1);
    const full = await download(backupDetails.getByRole('button').nth(0));
    const json = await download(backupDetails.getByRole('button').nth(1));
    const backup = JSON.parse(json);
    check(full.includes('SECRET-BACK') && !full.includes('HIDDEN-DELETED'),'full CSV visibility');
    check(backup.schemaVersion===2 && backup.entries.length===2 && !json.includes(fixture.hidden.id),'JSON visible snapshot');
    check(backup.entries.find(e=>e.id===fixture.legacy.id).regions[0].view===undefined,'legacy view invented');
    await page.evaluate(({hidden}) => {
      localStorage.setItem('rehab.sorenessEntries.v2',JSON.stringify({schemaVersion:2,entries:[],deletedLegacyIds:[hidden.id]}));
      const original = Storage.prototype.setItem;
      window.__transferWrites = 0; window.__transferQuota = false;
      Storage.prototype.setItem = function(key,value) {
        if(key==='rehab.sorenessEntries.v2') { if(window.__transferQuota) throw new DOMException('test quota','QuotaExceededError'); window.__transferWrites++; }
        return original.call(this,key,value);
      };
    },fixture);
    const input = backupDetails.locator('input[type="file"]');
    await input.setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(json)});
    const confirm = backupDetails.getByRole('button').nth(2);
    await confirm.waitFor();
    check(await page.evaluate(()=>window.__transferWrites)===0,'preview wrote data');
    await page.evaluate(()=>{window.__transferQuota=true;});
    await confirm.click(); await tools.getByRole('alert').waitFor();
    check(await page.evaluate(()=>window.__transferWrites)===0,'failed restore wrote data');
    await page.evaluate(()=>{window.__transferQuota=false;});
    await confirm.click();
    await page.waitForFunction(()=>window.__transferWrites===1);
    const restored = await page.evaluate(()=>({raw:localStorage.getItem('rehab.sorenessEntries.v1'),v2:JSON.parse(localStorage.getItem('rehab.sorenessEntries.v2')),other:localStorage.getItem('unrelated-test-key')}));
    check(restored.raw===fixture.raw && restored.other==='unchanged','restore changed original/unrelated bytes');
    check(restored.v2.entries.length===1 && restored.v2.deletedLegacyIds.includes(fixture.hidden.id),'restore/tombstone');
    await input.setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
    await tools.getByRole('alert').waitFor();
    check(await page.evaluate(()=>window.__transferWrites)===1,'invalid file wrote data');
    for (const element of await tools.locator('button,input[type="date"],summary').all()) {
      if(await element.isVisible()) { const box=await element.boundingBox();check(box && box.height>=44,'small primary control'); }
    }
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
    if(language==='en')check(!/[\u3400-\u9fff]/.test(await tools.innerText()),'English leakage');
    results.push({language,width,actualDownloads:true,privateDefault:true,confirmedAtomicRestore:true,quotaRetry:true,invalidPreserved:true,overflow:false});
  }
  return results;
}
