// 以 Playwright CLI run-code --filename 執行；只在隔離 profile 寫入合成資料。
async page => {
  const base = new URL(page.url()).origin;
  const report = { engine: page.context().browser().browserType().name(), cases: [], boundaries: {} };
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const bytes = () => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
  const watch = () => page.evaluate(() => { window.__taxonomyWrites = []; const original = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { window.__taxonomyWrites.push(key); return original.call(this, key, value); }; });
  const count = async (selector, expected) => { await page.waitForFunction(({ selector, expected }) => document.querySelectorAll(selector).length === expected, { selector, expected }); };
  const text = {
    'zh-TW': { purpose:'尋找用途', strength:'肌力', rehab:'復健', all:'全部用途', groups:'肌力：依動作模式找', legs:'下肢 Legs', core:'核心／軀幹', patterns:'下肢動作模式', squat:'蹲 Squat', hinge:'髖鉸鏈 Hinge', goals:'復健：依功能找', care:'照護與放鬆', control:'控制與穩定', area:'復健部位', shoulder:'肩部', search:'搜尋動作名稱（中／英文）', manualSearch:'搜尋動作（中文或英文）', clear:'清除用途與搜尋', favorites:'★ 查看收藏', change:'更換動作', cuff:'肩關節外旋運動' },
    en: { purpose:'Find by purpose', strength:'Strength', rehab:'Rehab', all:'All purposes', groups:'Strength: movement pattern', legs:'Legs', core:'Core / trunk', patterns:'Lower-body movement pattern', squat:'Squat', hinge:'Hip hinge', goals:'Rehab: function', care:'Care / relaxation', control:'Control / stability', area:'Rehab body area', shoulder:'Shoulder', search:'Search exercise names (Chinese or English)', manualSearch:'Search exercises (Chinese or English)', clear:'Clear purpose and search', favorites:'★ View favorites', change:'Change exercise', cuff:'Band shoulder external rotation' },
  };
  async function seed(language, assessment = null) {
    await page.goto(base + '/exercises?mode=all&bodyArea=all');
    await page.evaluate(({ language, assessment }) => {
      localStorage.clear();
      const data = { 'rehab.language.v1':language, 'rehab.onboardingSeen.v1':'true', 'rehab.trainingLogs.v2':'[]', 'rehab.functionalOutcomes.v2':'[]', 'rehab.manualWorkouts.v1':'[]', 'rehab.manualWorkoutDrafts.v1':'[]', 'rehab.activities.v1':'[]', 'rehab.favoriteExercises.v1':JSON.stringify(['catalog-squat']), 'rehab.customExercises.v1':JSON.stringify([{id:'custom-taxonomy-qa',name:'QA personal move',kind:'strength',recordOnly:true}]), 'qa-unrelated':'keep' };
      for (const [key,value] of Object.entries(data)) localStorage.setItem(key,value);
      if (assessment) localStorage.setItem('rehab.assessment.v1',JSON.stringify(assessment));
    }, {language,assessment});
    await page.goto(base + '/exercises?mode=all&bodyArea=all'); await count('article',47);
  }
  async function geometry(label) {
    check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), label+': horizontal overflow');
    const t = text[await page.evaluate(() => localStorage.getItem('rehab.language.v1'))];
    for (const title of [t.purpose,t.groups,t.patterns,t.goals,t.area]) {
      const group = page.getByRole('group', {name:title,exact:true});
      if (await group.count()) {
        const sizes = await group.first().getByRole('button').evaluateAll(nodes => nodes.map(n => ({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));
        check(sizes.every(r=>r.w>=44&&r.h>=44),label+': taxonomy target size / '+title);
      }
    }
  }
  for (const language of ['zh-TW','en']) for (const width of [320,375,390]) {
    const t = text[language]; await page.setViewportSize({width,height:900}); await seed(language); const before = await bytes(); await watch();
    const purpose = () => page.getByRole('group',{name:t.purpose,exact:true}).first();
    await purpose().getByRole('button',{name:t.strength,exact:true}).focus(); await page.keyboard.press('Enter'); await count('article',27);
    const groups = () => page.getByRole('group',{name:t.groups,exact:true}).first();
    await groups().getByRole('button',{name:t.legs,exact:true}).click(); await count('article',15);
    await page.getByRole('group',{name:t.patterns,exact:true}).getByRole('button',{name:t.squat,exact:true}).click(); await count('article',4);
    const filteredUrl = page.url();
    const squat = page.locator('article').filter({has:page.locator('a[href^="/exercise/catalog-squat?"]')});
    await squat.locator('a').first().click(); await page.waitForURL('**/exercise/catalog-squat?**');
    check(new URL(page.url()).searchParams.get('group')==='legs' && new URL(page.url()).searchParams.get('pattern')==='squat','detail loses taxonomy');
    await page.locator('a[href^="/exercises?"]').first().click(); await count('article',4);
    check(page.url()===filteredUrl,'detail return loses filters');
    await page.getByRole('button',{name:t.favorites,exact:true}).click(); await count('article',1);
    check(new URL(page.url()).searchParams.get('pattern')==='squat','favorite toggle loses pattern');
    await page.getByRole('searchbox',{name:t.search,exact:true}).fill('no-such-taxonomy'); await count('article',0);
    await page.getByRole('button',{name:t.clear,exact:true}).click(); await count('article',1);
    check(new URL(page.url()).searchParams.get('favorites')==='1','clear loses favorite scope');
    await page.goto(base+'/exercises?mode=all&bodyArea=all&purpose=strength&group=legs&pattern=hinge'); await count('article',0);
    await page.getByRole('button',{name:t.clear,exact:true}).click(); await count('article',47);
    await purpose().getByRole('button',{name:t.strength,exact:true}).click(); await groups().getByRole('button',{name:t.core,exact:true}).click(); await count('article',1);
    check(await page.locator('article a[href^="/exercise/glute-bridge?"]').count()===2,'core mapping not bridge');
    await purpose().getByRole('button',{name:t.rehab,exact:true}).click(); await count('article',37);
    check(!new URL(page.url()).searchParams.has('group'),'switch purpose leaves strength group');
    await page.getByRole('group',{name:t.goals,exact:true}).getByRole('button',{name:t.care,exact:true}).click(); await count('article',2);
    check(await bytes()===before,'library taxonomy changes storage'); await geometry('library');
    await page.getByRole('group',{name:t.purpose,exact:true}).scrollIntoViewIfNeeded();
    const libraryShot=`output/playwright/taxonomy-${report.engine}-${language}-${width}-library.png`; await page.screenshot({path:libraryShot});

    await page.goto(base+'/logs/new'); await purpose().waitFor();
    // Vite 開發模式沿用既有 300ms 初始化建草稿；等實際完成後才量測純探索。
    await page.waitForFunction(() => new URLSearchParams(location.search).has('draft') && JSON.parse(localStorage.getItem('rehab.manualWorkoutDrafts.v1') || '[]').some(draft => draft.revision >= 1));
    await settle();
    const pickerBefore=await bytes(); await watch();
    await purpose().getByRole('button',{name:t.strength,exact:true}).click(); await groups().getByRole('button',{name:t.legs,exact:true}).click();
    await page.getByRole('group',{name:t.patterns,exact:true}).getByRole('button',{name:t.squat,exact:true}).click(); await count('button.min-h-44',4);
    await purpose().getByRole('button',{name:t.rehab,exact:true}).click();
    await page.getByRole('group',{name:t.area,exact:true}).getByRole('button',{name:t.shoulder,exact:true}).click();
    await page.getByRole('group',{name:t.goals,exact:true}).getByRole('button',{name:t.control,exact:true}).click();
    await page.getByRole('searchbox',{name:t.manualSearch,exact:true}).first().fill('external rotation'); await count('button.min-h-44',1);
    await geometry('picker'); await settle();
    check(await bytes()===pickerBefore,'pure picker classification writes bytes');
    check(await page.evaluate(()=>window.__taxonomyWrites.length===0),'pure picker classification invokes writer');
    const pickerShot=`output/playwright/taxonomy-${report.engine}-${language}-${width}-picker.png`; await page.screenshot({path:pickerShot});
    await purpose().getByRole('button',{name:t.strength,exact:true}).click();
    check(await page.getByRole('group',{name:t.patterns,exact:true}).count()===0,'hidden leg filter survives purpose switch');
    await purpose().getByRole('button',{name:t.rehab,exact:true}).click();
    check(await page.getByRole('group',{name:t.area,exact:true}).getByRole('button').first().getAttribute('aria-pressed')==='true','manual body area did not reset');
    check(await page.getByRole('group',{name:t.goals,exact:true}).getByRole('button').first().getAttribute('aria-pressed')==='true','manual function did not reset');
    check(await bytes()===pickerBefore && await page.evaluate(()=>window.__taxonomyWrites.length===0),'purpose resets write storage');
    await page.getByRole('button',{name:t.cuff,exact:true}).click(); await page.getByRole('button',{name:t.change,exact:true}).first().waitFor();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('rehab.manualWorkoutDrafts.v1')||'[]').some(d=>d.exercises.some(e=>e.exerciseId==='shoulder-external-rotation-band')));
    const saved=await page.evaluate(()=>localStorage.getItem('rehab.manualWorkoutDrafts.v1'));
    check(!['strengthGroups','legPatterns','rehabFunctions','taxonomyFilters'].some(key=>saved.includes(key)),'taxonomy leaks into draft schema');
    check(await page.evaluate(()=>localStorage.getItem('rehab.manualWorkouts.v1'))==='[]','selection fabricated completed record');
    await page.getByRole('button',{name:t.change,exact:true}).first().click();
    await page.getByRole('searchbox',{name:t.manualSearch,exact:true}).first().fill('QA personal move');
    await page.getByRole('button',{name:'QA personal move',exact:true}).waitFor();
    report.cases.push({language,width,libraryAndPicker:'PASS',searchFavoritesAndReturn:'PASS',emptyAndPurposeReset:'PASS',purePickerZeroWrites:'PASS',selectionKeepsDraftSchema:'PASS',libraryShot,pickerShot});
  }
  await seed('zh-TW',{bodyArea:'shoulder',mode:'beginner',pain:1,equipment:['bodyweight']});
  await page.goto(base+'/exercises?purpose=strength&group=legs'); await count('article',0);
  check(new URL(page.url()).searchParams.get('mode')===null,'taxonomy broadens recommendations');
  await page.getByRole('button',{name:'查看全部符合動作',exact:true}).click();
  check(new URL(page.url()).searchParams.get('mode')==='all','explicit all scope failed');
  await page.evaluate(()=>localStorage.setItem('rehab.safetyGate.v1',JSON.stringify({completed:true,blocked:false,redFlags:[],safetyDate:new Date().toLocaleDateString('en-CA')})));
  const guarded=await bytes(); await page.goto(base+'/session/catalog-squat'); await page.waitForURL('**/exercise/catalog-squat?mode=all');
  check(await bytes()===guarded,'catalogOnly guard writes data');
  await seed('zh-TW',{bodyArea:'shoulder',mode:'beginner',pain:6,equipment:['bodyweight']});
  await page.goto(base+'/exercises?purpose=strength&group=push'); await count('article',0); check(await page.getByRole('alert').count()>0,'pain stop missing');
  report.boundaries={recommendedScope:'PASS',catalogOnlyGuard:'PASS',painStop:'PASS',evidence:'browser automation; human/device/production NOT VERIFIED'};
  return report;
}
