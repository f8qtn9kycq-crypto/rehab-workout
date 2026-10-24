// Run via playwright-cli run-code --filename on an isolated origin (Vite 4183).
async page => {
 const base='http://127.0.0.1:4183';const check=(v,m)=>{if(!v)throw Error(m)};
 const labels={shoulder:'肩部復健',hip:'髖部復健',shoulder_neck:'肩頸放鬆',knee:'膝蓋舒緩',ankle:'踝關節穩定'};
 await page.goto(base+'/logs');await page.evaluate(()=>{localStorage.clear();localStorage.setItem('rehab.language.v1','zh-TW');localStorage.setItem('rehab.functionalOutcomes.v2','[]')});
 const results=[];
 for(const area of Object.keys(labels)){
  await page.goto(base+'/logs?outcomeArea='+area+'#function-check-in');
  const form=page.locator('#function-check-in');await form.locator('button[aria-pressed="true"]').filter({hasText:labels[area]}).waitFor();await page.waitForFunction(()=>document.activeElement?.id==='outcome-check-in-title');
  check(await page.evaluate(()=>localStorage.getItem('rehab.functionalOutcomes.v2'))==='[]','navigation wrote outcome');
  await form.getByRole('button',{name:labels[area==='shoulder'?'ankle':'shoulder'],exact:true}).click();
  check(await form.locator('button[aria-pressed="true"]').innerText()===labels[area==='shoulder'?'ankle':'shoulder'],'manual selection overwritten');results.push(area);
 }
 for(const target of ['/logs','/logs?outcomeArea=ankle','/logs?outcomeArea=invalid#function-check-in']){
  await page.goto(base+target);await page.locator('#function-check-in').waitFor();check(await page.locator('#function-check-in button[aria-pressed="true"]').innerText()===labels.shoulder,'ordinary or invalid URL changed default');
 }
 await page.goto(base+'/logs?outcomeArea=ankle#function-check-in');await page.locator('#function-check-in button[aria-pressed="true"]').filter({hasText:labels.ankle}).waitFor();
 await page.goto(base+'/logs?outcomeArea=knee#function-check-in');await page.locator('#function-check-in button[aria-pressed="true"]').filter({hasText:labels.knee}).waitFor();await page.goBack();await page.locator('#function-check-in button[aria-pressed="true"]').filter({hasText:labels.ankle}).waitFor();
 return {fiveAreas:results,invalidAndOrdinaryUrls:'pass',manualSelection:'pass',backNavigation:'pass',navigationWrites:0};
}
