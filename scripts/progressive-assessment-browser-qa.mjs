// Execute via playwright-cli run-code --filename in a fresh test profile.
async page => {
 const base='http://127.0.0.1:4180',results=[];const check=(value,message)=>{if(!value)throw Error(message)};
 const score=async(slider,value)=>{await slider.focus();await slider.press('Home');for(let n=0;n<value;n++)await slider.press('ArrowRight')};
 for(const language of ['zh-TW','en'])for(const width of [320,375,390]){
  const en=language==='en';await page.setViewportSize({width,height:900});await page.goto(base+'/logs');
  await page.evaluate(language=>{localStorage.clear();localStorage.setItem('rehab.language.v1',language);localStorage.setItem('rehab.safetyGate.v1',JSON.stringify({completed:true,blocked:false,redFlags:[],safetyDate:new Date().toLocaleDateString('en-CA'),completedAt:new Date().toISOString()}));localStorage.setItem('rehab.manualWorkouts.v1','[]');},language);
  await page.goto(base+'/assessment?bodyArea=knee');
  check(!await page.locator('clipPath').count(),'preselected map repeated');
  await score(page.getByRole('slider').nth(0),4);await score(page.getByRole('slider').nth(1),6);
  const next=()=>page.getByRole('button',{name:en?'Continue to training settings':'繼續設定今天訓練',exact:true});
  await next().click();
  check(await page.evaluate(()=>document.activeElement?.textContent)===(en?'Set up today’s training':'設定今天的訓練'),'settings focus');
  const dumbbell=()=>page.getByRole('button',{name:en?'Dumbbell':'啞鈴',exact:true});
  await dumbbell().click();await page.getByRole('button',{name:en?'15 min':'15 分鐘',exact:true}).click();
  check(!await page.getByRole('button',{name:en?'Barbell':'槓鈴',exact:true}).count(),'new unsafe equipment');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'settings overflow');
  await page.getByRole('button',{name:en?'Back to today’s condition':'返回今天狀況',exact:true}).click();
  check(await page.getByRole('slider').nth(0).inputValue()==='4'&&await page.getByRole('slider').nth(1).inputValue()==='6','back lost condition');
  check(await page.evaluate(()=>document.activeElement?.textContent)===(en?'How does this area feel today?':'今天這個部位感覺如何？'),'condition focus');
  await next().click();check(await dumbbell().getAttribute('aria-pressed')==='true','back lost equipment');
  check(await page.getByRole('button',{name:en?'15 min':'15 分鐘',exact:true}).getAttribute('aria-pressed')==='true','back lost duration');
  await page.getByRole('link',{name:en?'Save assessment and see exercises':'儲存評估並查看動作',exact:true}).click();await page.waitForURL('**/exercises?mode=recommended&bodyArea=knee');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rehab.assessment.v1')));check(saved.bodyArea==='knee'&&saved.pain===4&&saved.confidence===6&&saved.sessionLength===15&&saved.equipment.includes('dumbbell')&&saved.mode==='recovery','saved contract');
  check(await page.evaluate(()=>localStorage.getItem('rehab.manualWorkouts.v1'))==='[]','unrelated data changed');
  await page.goto(base+'/assessment?bodyArea=knee');await score(page.getByRole('slider').first(),6);await next().click();await page.getByRole('link',{name:en?'Save assessment and see exercises':'儲存評估並查看動作',exact:true}).click();await page.waitForURL('**/exercises?mode=recommended&bodyArea=knee');check(await page.locator('article').count()===0,'pain6 recommendations');
  await page.goto(base+'/assessment');check(await page.locator('clipPath').count()>0,'legacy map removed');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'legacy overflow');
  await page.evaluate(()=>localStorage.removeItem('rehab.safetyGate.v1'));await page.goto(base+'/assessment?bodyArea=knee');await page.waitForURL('**/safety');
  results.push({language,width,progressiveState:'pass',focus:'pass',storage:'pass',pain6:'blocked',missingSafety:'blocked',sharedMap:'pass'});
 }
 return results;
}
