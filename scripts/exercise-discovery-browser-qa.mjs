// 透過 Playwright CLI run-code --filename 載入；只對本輪隔離 profile 使用合成資料。
async (page) => {
  const base = 'http://127.0.0.1:4217';
  const engine = page.context().browser().browserType().name();
  const report = { engine, cases: [], boundaries: {}, screenshots: [], evidence: 'browser automation, not human/device evidence' };
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const bytes = () => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
  const count = async (selector, expected) => {
    try { await page.waitForFunction(({ selector, expected }) => document.querySelectorAll(selector).length === expected, { selector, expected }); }
    catch (error) { throw new Error(`${page.url()}: expected ${expected} ${selector}, got ${await page.locator(selector).count()}; ${error.message}`); }
  };
  const text = {
    'zh-TW': { purpose: '尋找用途', rehab: '復健', strength: '肌力', all: '全部用途', search: '搜尋動作名稱（中／英文）', manualSearch: '搜尋動作（中文或英文）', change: '更換動作', reps: '次數', clear: '清除用途與搜尋', badges: '動作用途' },
    en: { purpose: 'Find by purpose', rehab: 'Rehab', strength: 'Strength', all: 'All purposes', search: 'Search exercise names (Chinese or English)', manualSearch: 'Search exercises (Chinese or English)', change: 'Change exercise', reps: 'Reps', clear: 'Clear purpose and search', badges: 'Exercise purpose' },
  };
  async function seed(language, assessment = null, favorites = []) {
    await page.goto(base + '/exercises?mode=all');
    await page.evaluate(({ language, assessment, favorites }) => {
      localStorage.clear();
      const values = {
        'rehab.language.v1': language, 'rehab.onboardingSeen.v1': 'true',
        'rehab.trainingLogs.v2': '[]', 'rehab.manualWorkouts.v1': '[]',
        'rehab.manualWorkoutDrafts.v1': '[]', 'rehab.functionalOutcomes.v2': '[]',
        'rehab.activities.v1': '[]', 'rehab.favoriteExercises.v1': JSON.stringify(favorites),
        'rehab.customExercises.v1': JSON.stringify([{ id: 'custom-phase-b-qa', name: 'QA personal move', kind: 'strength', recordOnly: true }]),
      };
      for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
      if (assessment) localStorage.setItem('rehab.assessment.v1', JSON.stringify(assessment));
    }, { language, assessment, favorites });
    await page.goto(base + '/exercises?mode=all');
  }
  async function geometry(label) {
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ': horizontal overflow');
    const sizes = await page.getByRole('group', { name: text[await page.evaluate(() => localStorage.getItem('rehab.language.v1'))].purpose, exact: true }).first().getByRole('button').evaluateAll(buttons => buttons.map(button => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })));
    check(sizes.every(size => size.width >= 44 && size.height >= 44), label + ': purpose touch size');
  }
  for (const language of ['zh-TW', 'en']) for (const width of [320, 375, 390]) {
    const t = text[language];
    await page.setViewportSize({ width, height: 812 });
    await seed(language);
    await count('article', 47);
    const before = await bytes();
    await page.getByRole('group', { name: t.purpose, exact: true }).getByRole('button', { name: t.rehab, exact: true }).click();
    await count('article', 37);
    await page.getByRole('searchbox', { name: t.search, exact: true }).fill('external rotation');
    await count('article', 1);
    await geometry('library');
    check(await bytes() === before, 'library discovery writes storage');
    await page.evaluate(() => { window.__discoveryDocument = 'same-document'; });
    await page.locator('article a[href^="/exercise/shoulder-external-rotation-band"]').first().click();
    await page.waitForURL('**/exercise/shoulder-external-rotation-band?*');
    check((await page.getByRole('group', { name: t.badges, exact: true }).innerText()).includes(t.rehab), 'detail purpose missing');
    await page.locator('a[href^="/exercises?"]').first().click();
    await page.waitForURL('**/exercises?*');
    check(new URL(page.url()).searchParams.get('purpose') === 'rehab', 'return loses purpose');
    check(await page.getByRole('searchbox', { name: t.search, exact: true }).inputValue() === 'external rotation', 'return loses search');
    check(await page.evaluate(() => window.__discoveryDocument) === 'same-document', 'return used full reload');
    await page.getByRole('group', { name: t.purpose, exact: true }).getByRole('button', { name: t.strength, exact: true }).click();
    await page.getByRole('group', { name: t.purpose, exact: true }).getByRole('button', { name: t.strength, exact: true, pressed: true }).waitFor();
    await count('article', 1);
    await page.getByRole('searchbox', { name: t.search, exact: true }).fill('bench press');
    await count('article', 1);
    await page.getByRole('group', { name: t.purpose, exact: true }).getByRole('button', { name: t.rehab, exact: true }).click();
    await count('article', 0);
    await page.getByRole('button', { name: t.clear, exact: true }).click();
    await count('article', 47);
    check(await bytes() === before, 'library clear writes storage');
    if (language === 'zh-TW' && width === 375) {
      await page.evaluate(() => scrollTo(0, 0));
      const path = `output/playwright/discovery-${engine}-library-zh-375.png`;
      await page.screenshot({ path }); report.screenshots.push(path);
    }
    await page.goto(base + '/logs/new');
    await page.getByRole('group', { name: t.purpose, exact: true }).first().waitFor();
    // 保留既有 mount autosave 行為；只比較初始化完成後的純探索。
    await page.waitForTimeout(600);
    const pickerBefore = await bytes();
    await page.getByRole('group', { name: t.purpose, exact: true }).first().getByRole('button', { name: t.rehab, exact: true }).click();
    await page.getByRole('searchbox', { name: t.manualSearch, exact: true }).first().fill('external rotation');
    await page.getByRole('button', { name: language === 'en' ? 'Band shoulder external rotation' : '肩關節外旋運動', exact: true }).waitFor();
    await geometry('picker');
    await page.waitForTimeout(400);
    check(await bytes() === pickerBefore, 'pure picker discovery writes storage');
    if (language === 'zh-TW' && width === 375) {
      await page.evaluate(() => scrollTo(0, 0));
      const path = `output/playwright/discovery-${engine}-picker-zh-375.png`;
      await page.screenshot({ path }); report.screenshots.push(path);
    }
    await page.getByRole('button', { name: language === 'en' ? 'Band shoulder external rotation' : '肩關節外旋運動', exact: true }).click();
    await page.getByRole('button', { name: t.change, exact: true }).first().waitFor();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('rehab.manualWorkoutDrafts.v1') || '[]').some(draft => draft.exercises.some(exercise => exercise.exerciseId === 'shoulder-external-rotation-band')));
    const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('rehab.manualWorkoutDrafts.v1'))[0]);
    check(!JSON.stringify(draft).includes('primaryPurpose') && !JSON.stringify(draft).includes('secondaryPurposes'), 'purpose enters draft');
    check(await page.evaluate(() => localStorage.getItem('rehab.manualWorkouts.v1')) === '[]', 'selection fabricates completed history');
    await page.getByRole('button', { name: t.change, exact: true }).first().click();
    await page.getByRole('searchbox', { name: t.manualSearch, exact: true }).first().fill('QA personal move');
    await page.getByRole('button', { name: 'QA personal move', exact: true }).waitFor();
    check(await page.getByRole('group', { name: t.purpose, exact: true }).first().getByRole('button', { name: t.rehab, exact: true }).getAttribute('aria-pressed') === 'true', 'picker purpose not retained');
    report.cases.push({ language, width, libraryIntersectionAndReturn: 'PASS', libraryStorageUnchanged: true, pickerStorageAfterMountUnchanged: true, selectionAutosaved: true, privateExerciseAccessible: true, noHorizontalOverflow: true, purposeTargets44px: true });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await seed('zh-TW', null, ['catalog-prone-ytw', 'catalog-bench-press']);
  await page.goto(base + '/exercises?mode=all&purpose=rehab&favorites=1');
  await count('article', 1);
  await page.getByRole('button', { name: /^肩部 \d+$/ }).last().click();
  check(new URL(page.url()).searchParams.get('bodyArea') === 'shoulder', 'body area not in URL');
  const strengthButton = page.getByRole('group', { name: '尋找用途', exact: true }).getByRole('button', { name: '肌力', exact: true });
  await strengthButton.focus(); await page.keyboard.press('Enter');
  await count('article', 2);
  await page.keyboard.press('Tab');
  check(await page.getByRole('searchbox').evaluate(input => input === document.activeElement), 'keyboard cannot reach search');
  await page.getByRole('searchbox').fill('bench press');
  await count('article', 1);
  check(await page.locator('article a[href^="/exercise/catalog-bench-press"]').count() === 2, 'favorite/purpose/body/search intersection');
  report.boundaries.favoriteBodySearchAndKeyboard = 'PASS';

  const assessment = { bodyArea: 'shoulder', mode: 'beginner', pain: 1, equipment: ['bodyweight'] };
  await seed('zh-TW', assessment, ['catalog-bench-press']);
  await page.goto(base + '/exercises');
  await page.locator('article').first().waitFor();
  const recommendedIds = await page.locator('article a[href^="/exercise/"]').evaluateAll(links => [...new Set(links.map(link => new URL(link.href).pathname))]);
  const recommendedAreaBytes = await bytes();
  await page.goto(base + '/exercises?bodyArea=all');
  await page.locator('article').first().waitFor();
  const allAreaRecommendedIds = await page.locator('article a[href^="/exercise/"]').evaluateAll(links => [...new Set(links.map(link => new URL(link.href).pathname))]);
  check(JSON.stringify(recommendedIds) === JSON.stringify(allAreaRecommendedIds), 'all areas must preserve assessment recommendations');
  check(await page.getByRole('button', { name: '全部部位', exact: true }).count() === 0, 'recommended scope exposes ineffective all-body button');
  await page.getByText('推薦仍依指定部位或你的身體評估篩選；要瀏覽全部部位，請先選「所有動作」。', { exact: true }).waitFor();
  check(await bytes() === recommendedAreaBytes, 'recommendation area explanation writes storage');
  report.boundaries.recommendedAreaScope = 'PASS';
  await page.goto(base + '/exercises?purpose=strength&favorites=1');
  await count('article', 0);
  const recommendationBytes = await bytes();
  check(new URL(page.url()).searchParams.get('mode') === null, 'purpose silently broadens recommendation scope');
  await page.getByRole('button', { name: '查看全部符合動作', exact: true }).click();
  await count('article', 1);
  check(new URL(page.url()).searchParams.get('mode') === 'all', 'explicit browse-all did not change scope');
  check(await bytes() === recommendationBytes, 'scope change writes storage');
  await page.evaluate(() => localStorage.setItem('rehab.safetyGate.v1', JSON.stringify({ completed: true, blocked: false, redFlags: [], safetyDate: new Date().toLocaleDateString('en-CA') })));
  const catalogBytes = await bytes();
  await page.goto(base + '/session/catalog-prone-ytw');
  await page.waitForURL('**/exercise/catalog-prone-ytw?mode=all');
  check(await page.locator('a[href="/session/catalog-prone-ytw"]').count() === 0, 'catalog-only guided start appears');
  check(await bytes() === catalogBytes, 'catalog-only route writes storage');
  report.boundaries.explicitScopeAndCatalogGuard = 'PASS';
  await page.goto(base + '/exercises?mode=all&purpose=strength');
  await page.getByRole('button', { name: '全部部位', exact: true }).click();
  await count('article', 27); // This fresh route has no favorites filter.
  check(new URL(page.url()).searchParams.get('bodyArea') === 'all', 'all body areas not explicit');
  await page.goto(base + '/exercises?mode=all&bodyArea=all');
  await count('article', 47);
  report.boundaries.explicitAllBodyWithAssessment = 'PASS';

  await seed('zh-TW', { ...assessment, pain: 6 });
  await page.goto(base + '/exercises?purpose=strength');
  await count('article', 0);
  check(await page.getByRole('alert').count() > 0, 'pain stop warning missing');
  report.boundaries.painStopRecommendation = 'PASS';
  return report;
}
