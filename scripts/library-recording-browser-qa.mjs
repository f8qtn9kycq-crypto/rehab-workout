// Run via playwright-cli run-code --filename in a fresh test profile against port 4178.
async page => {
 const base='http://127.0.0.1:4178'; const results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg)};
 for(const lang of ['zh-TW','en']) for(const width of [320,375,390]) {
  const en=lang==='en'; await page.setViewportSize({width,height:900});
  await page.goto(base+'/logs'); await page.evaluate(lang=>{localStorage.clear();localStorage.setItem('rehab.language.v1',lang)},lang);
  for (const id of ['hip-sit-to-stand', 'catalog-rear-foot-elevated-split-squat']) {
   await page.goto(base+'/exercise/'+id+'?mode=all#record');
   check(await page.locator('#record select').inputValue()==='chair','required support default '+id);
  }
  await page.goto(base+'/exercise/catalog-lat-pulldown?mode=all#record');
  const setup=page.locator('#record');
  await setup.getByRole('combobox').selectOption('cable');
  await setup.getByRole('textbox').fill('QA V grip');
  for(const el of await setup.locator('select,input,a').all()) {const box=await el.boundingBox();check(box&&box.height>=44,'touch target '+lang+width)}
  check(!await page.locator('a[href^="/session/"]').count(),'catalog guided start');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'detail overflow');
  await setup.getByRole('link').click();
  const equipment=()=>page.getByRole('combobox',{name:en?'Equipment for this set':'這組器材',exact:true});
  const grip=()=>page.getByRole('textbox',{name:en?'Grip / attachment for this set (optional)':'這組握把／握法（選填）',exact:true});
  const reps=()=>page.getByRole('spinbutton',{name:en?'Reps':'次數',exact:true});
  check(await equipment().first().inputValue()==='cable','handoff equipment');
  check(await grip().first().inputValue()==='QA V grip','handoff grip');
  check(await reps().first().inputValue()==='','fake dose');
  await reps().first().fill('8');
  await page.getByRole('button',{name:en?'Complete and save set':'完成並保存這組',exact:true}).click();
  await page.getByRole('button',{name:en?'Add set':'新增一組',exact:true}).click();
  await equipment().nth(1).selectOption('machine');await grip().nth(1).fill('QA fixed');await reps().nth(1).fill('6');
  await page.getByRole('button',{name:en?'Complete and save set':'完成並保存這組',exact:true}).click();
  await page.waitForFunction(()=>{const rows=JSON.parse(localStorage.getItem('rehab.manualWorkouts.v1')||'[]');return rows.length===1&&rows[0].exercises[0].sets.length===2});
  const state=await page.evaluate(()=>({rows:JSON.parse(localStorage.getItem('rehab.manualWorkouts.v1')),drafts:JSON.parse(localStorage.getItem('rehab.manualWorkoutDrafts.v1'))}));
  const ex=state.rows[0].exercises[0];check(ex.sets[0].equipmentId==='cable'&&ex.sets[0].grip==='QA V grip'&&ex.sets[1].equipmentId==='machine'&&ex.sets[1].grip==='QA fixed','set snapshots');check(ex.painBefore===undefined&&ex.painAfter===undefined,'fake pain');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'form overflow');
  await page.reload();check(await equipment().nth(1).inputValue()==='machine','resume snapshots');
  await page.goto(base+'/logs/new?draft='+state.drafts[0].id+'&exercise=missing&equipment=unknown');
  check(await equipment().first().inputValue()==='cable','draft priority');
  await page.goto(base+'/logs/new?from='+state.rows[0].id+'&exercise=missing&equipment=unknown');
  check(await equipment().first().inputValue()==='cable','from priority');
  await page.goto(base+'/logs');await page.getByText('QA V grip',{exact:false}).first().waitFor();await page.getByText('QA fixed',{exact:false}).first().waitFor();
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'history overflow');
  const final=await page.evaluate(()=>JSON.parse(localStorage.getItem('rehab.manualWorkouts.v1')));check(final.length===1&&final[0].id===state.rows[0].id,'duplicate history');
  await page.goto(base+'/session/catalog-lat-pulldown');await page.waitForURL('**/safety');
  results.push({lang,width,flow:'pass',snapshots:'pass',draftFromPriority:'pass',noFakeDoseOrPain:true,safety:'pass',overflow:false});
 }
 return results;
}
