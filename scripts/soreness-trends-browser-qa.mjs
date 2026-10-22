// Run in fresh playwright-cli profiles against Vite on port4179.
async page => {
 const base='http://127.0.0.1:4179';const results=[];
 const check=(value,message)=>{if(!value)throw Error(message)};
 for(const language of ['zh-TW','en'])for(const width of [320,375,390]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/logs/soreness');
  await page.evaluate(language=>{
   localStorage.clear();localStorage.setItem('rehab.language.v1',language);
   const day=n=>{const d=new Date();d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
   const reg=(view,side,severity,regionId='traps',tissue='muscle')=>({regionId,side,...(view?{view}:{}),tissue,severity,symptoms:[]});
   const entry=(date,regions)=>({id:crypto.randomUUID(),date,createdAt:new Date().toISOString(),regions});
   const legacy=[entry(day(0),[reg(undefined,'left',4)]),entry(day(0),[reg(undefined,'right',0)]),entry(day(0),[reg(undefined,'right',9,'jKnee','joint')])];
   localStorage.setItem('rehab.sorenessEntries.v1',JSON.stringify(legacy));
   localStorage.setItem('rehab.sorenessEntries.v2',JSON.stringify({schemaVersion:2,entries:[entry(day(0),[reg('F','left',2),reg('B','left',7),reg('F','right',5),reg('B','center',6,'jLumbar','joint')]),entry(day(-6),[reg('F','left',3)]),entry(day(-10),[reg('F','left',8)])],deletedLegacyIds:[legacy[2].id]}));
  },language);
  await page.reload();const section=page.locator('section[aria-labelledby="soreness-trend-title"]');await section.getByRole('combobox').first().waitFor();
  const before=await page.evaluate(()=>[localStorage.getItem('rehab.sorenessEntries.v1'),localStorage.getItem('rehab.sorenessEntries.v2')]);
  const position=section.getByRole('combobox').first(),range=section.getByRole('combobox').nth(1);
  for(const el of [position,range]){const box=await el.boundingBox();check(box&&box.height>=44,'small select')}
  check(!await position.locator('option[value="legacy:jKnee.right"]').count(),'tombstone observation resurrected');
  await position.selectOption('F:traps.left');check(await section.locator('circle').count()===2,'7day front count');
  await range.selectOption('30');check(await section.locator('circle').count()===3,'30day count');
  await range.selectOption('90');check(await section.locator('circle').count()===3,'90day count');
  for(const [key,value] of [['B:traps.left',7],['F:traps.right',5],['B:jLumbar.center',6],['legacy:traps.left',4]]){
   await position.selectOption(key);check(await section.locator('circle').count()===1,'identity count '+key);check((await section.getByRole('list').innerText()).includes(value+'/10'),'identity value '+key);
  }
  await position.selectOption('legacy:traps.right');check(await section.locator('circle').count()===0,'legacy zero plotted');await section.getByRole('status').waitFor();
  await position.selectOption('F:traps.left');await range.selectOption('7');
  check(!await section.locator('polyline,line').count(),'trend connections');
  if(language==='en')check(!/[\u3400-\u9fff]/.test(await section.innerText()),'English leakage');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow');
  check(JSON.stringify(before)===JSON.stringify(await page.evaluate(()=>[localStorage.getItem('rehab.sorenessEntries.v1'),localStorage.getItem('rehab.sorenessEntries.v2')])),'trend wrote storage');
  results.push({language,width,identity:'pass',ranges:'pass',legacyZero:'excluded',tombstone:'excluded',noWrites:true,overflow:false});
 }
 return results;
}
