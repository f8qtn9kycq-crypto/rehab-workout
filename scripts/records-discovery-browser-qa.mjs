// 以 Playwright CLI run-code --filename 執行；僅對隔離 profile 寫入合成資料。
async page => {
  const base = new URL(page.url()).origin;
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const report = { engine: page.context().browser().browserType().name(), cases: [], boundaries: {} };
  const recent = page.locator('section[aria-labelledby="records-recent-title"]');
  const history = page.locator('section[aria-labelledby="records-history-title"]');
  const filters = page.locator('section[aria-labelledby="records-body-area-title"]');
  const bytes = () => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
  const ids = root => root.locator('[data-record-id]').evaluateAll(nodes => nodes.map(node => node.dataset.recordId).sort());
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const texts = {
    'zh-TW': { title: '依用途找紀錄', all: '全部', rehab: '復健', strength: '肌力', cardio: '有氧', unknown: '未分類', clear: '清除用途與部位篩選', shoulder: '肩部復健', ankle: '踝關節穩定', open: '開啟詳細紀錄與活動補記', hint: '不代表當次訓練目的', editor: '編輯實際組數' },
    en: { title: 'Find records by purpose', all: 'All', rehab: 'Rehab', strength: 'Strength', cardio: 'Cardio', unknown: 'Unclassified', clear: 'Clear purpose and body area filters', shoulder: 'Shoulder rehab', ankle: 'Ankle stability', open: 'Open detailed records and activity backfill', hint: 'not your purpose at the time', editor: 'Edit actual sets' },
  };
  async function seed(language) {
    await page.goto(base + '/logs');
    await page.evaluate(async language => {
      const { exercises } = await import('/src/data/exercises.ts');
      const canonical = id => exercises.find(exercise => exercise.id === id);
      const ex = (id, extra = {}) => ({ name: canonical(id)?.title || 'QA private', exerciseId: id, equipment: '', sets: [{ reps: 8, weightKg: 12 }], ...extra });
      const workout = (id, day, exercises, extra = {}) => ({ id, date: `2026-10-${day}`, createdAt: `2026-10-${day}T12:00:00`, exercises, ...extra });
      const log = (id, exerciseId, day) => ({ id, exerciseId, exerciseTitle: canonical(exerciseId).title, title: canonical(exerciseId).title, bodyArea: canonical(exerciseId).bodyArea, type: canonical(exerciseId).type, level: canonical(exerciseId).level, date: `2026-10-${day}T12:00:00`, completedAt: `2026-10-${day}T12:00:00`, setsCompleted: 1, repsCompleted: 8, plannedSets: 2, plannedReps: 8, painBefore: 1, painAfter: 1, difficultyRating: 3, stoppedEarly: false, recoveryMode: false, notes: '', stopReason: '', sets: [{ reps: 8, weightKg: 12, completed: true }] });
      const logs = [log('linked-cuff', 'shoulder-external-rotation-band', '23'), log('standalone-ankle', 'ankle-circles', '10')];
      const workouts = [
        workout('cuff', '19', [ex('shoulder-external-rotation-band', { kind: 'strength' })]),
        workout('mixed', '18', [ex('shoulder-flexion'), ex('catalog-leg-extension', { equipmentId: 'machine', bodyArea: 'knee' })], { cyclingMinutes: 10 }),
        workout('ytw', '17', [ex('catalog-prone-ytw')]),
        workout('squat', '16', [ex('catalog-squat', { equipmentId: 'barbell' })]),
        workout('kind-only', '15', [{ name: 'QA legacy kind only', kind: 'strength', equipment: '', sets: [{ reps: 9 }] }]),
        workout('revised', '14', [ex('catalog-shoulder-press', { name: 'QA old dumbbell press', equipmentId: 'dumbbell' })]),
      ];
      const activities = Array.from({ length: 6 }, (_, index) => ({ id: `cycle-${index}`, date: `2026-10-${25-index}`, kind: 'cycling', actualMinutes: 20, completed: true, symptomResponse: 'same' }));
      activities.push({ id: 'linked', date: '2026-10-23', kind: 'resistance', actualMinutes: 20, completed: true, symptomResponse: 'same', primaryFocus: 'pull', exerciseLogIds: ['linked-cuff', 'missing-link'], segments: [{ phase: 'main', exerciseLogIds: ['linked-cuff', 'missing-link'], performanceQuality: 'controlled' }] });
      localStorage.clear();
      for (const [key, value] of Object.entries({ 'rehab.language.v1': language, 'rehab.onboardingSeen.v1': 'true', 'rehab.manualWorkouts.v1': JSON.stringify(workouts), 'rehab.trainingLogs.v2': JSON.stringify(logs), 'rehab.activities.v1': JSON.stringify(activities), 'rehab.functionalOutcomes.v2': '[]', 'rehab.manualWorkoutDrafts.v1': '[]', 'qa-unrelated': 'preserved' })) localStorage.setItem(key, value);
      const { getLogs } = await import('/src/services/logService.ts');
      localStorage.setItem('rehab.trainingLogs.v2', JSON.stringify(getLogs()));
    }, language);
    await page.goto(base + '/logs'); await filters.waitFor(); await settle();
    await page.evaluate(() => { window.__c1Writes = []; const original = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { window.__c1Writes.push(key); return original.call(this, key, value); }; });
  }
  for (const language of ['zh-TW', 'en']) for (const width of [320, 375, 390]) {
    const t = texts[language];
    await page.setViewportSize({ width, height: 900 }); await seed(language);
    const before = await bytes();
    const stats = await page.locator('section[aria-labelledby="records-week-title"]').innerText();
    check((await filters.innerText()).includes(t.hint), 'purpose provenance missing');
    const purpose = filters.getByRole('group', { name: t.title, exact: true });
    await history.locator('summary').first().click();
    const originalFull = await ids(history);
    check(originalFull.includes('activity:linked') && !originalFull.includes('training:linked-cuff'), 'linked session duplicated');
    check((await ids(recent)).length < originalFull.length, 'five-day limit missing');
    const expected = {
      rehab: ['activity:linked', 'manual:cuff', 'manual:mixed', 'manual:ytw', 'training:standalone-ankle'],
      strength: ['activity:linked', 'manual:cuff', 'manual:mixed', 'manual:squat', 'manual:ytw'],
      cardio: ['activity:cycle-0','activity:cycle-1','activity:cycle-2','activity:cycle-3','activity:cycle-4','activity:cycle-5','manual:mixed'],
      unknown: ['activity:linked','manual:kind-only','manual:revised'],
    };
    for (const value of ['rehab','strength','cardio','unknown']) {
      const button = purpose.getByRole('button', { name: t[value], exact: true });
      await button.focus(); await page.keyboard.press('Enter'); await settle();
      check(await button.getAttribute('aria-pressed') === 'true', 'keyboard selection failed');
      check(JSON.stringify(await ids(history)) === JSON.stringify(expected[value].sort()), `${language}/${width}/${value}: history mismatch ${await ids(history)}`);
      const recentIds = await ids(recent);
      check(recentIds.every(id => expected[value].includes(id)), 'recent/full semantics differ');
      check(new Set(recentIds).size === recentIds.length, 'duplicate recent sessions');
      if (value === 'rehab') check(recentIds.includes('manual:cuff'), 'filter applied after five-day limit');
      if (value === 'unknown') check((await recent.innerText()).includes('QA old dumbbell press'), 'legacy name overwritten');
      check(await page.locator('section[aria-labelledby="records-week-title"]').innerText() === stats, 'weekly totals changed');
      check(await bytes() === before, 'filter wrote storage');
    }
    await purpose.getByRole('button', { name: t.strength, exact: true }).click();
    await filters.locator('button').filter({ hasText: t.shoulder }).click(); await settle();
    check(!(await ids(history)).includes('manual:mixed'), 'different exercises incorrectly satisfy AND');
    check((await ids(history)).includes('manual:cuff'), 'same exercise AND missed cuff');
    await filters.locator('button').filter({ hasText: t.ankle }).click(); await settle();
    check((await ids(history)).length === 0 && (await ids(recent)).length === 0, 'empty state mismatch');
    await filters.getByRole('button', { name: t.clear, exact: true }).click(); await settle();
    check(JSON.stringify(await ids(history)) === JSON.stringify(originalFull), 'reset lost records');
    check(await bytes() === before, 'read/reset wrote storage');
    check(await page.evaluate(() => window.__c1Writes.length === 0), 'filter caused a write even with identical bytes');
    await filters.evaluate(node => node.scrollIntoView({ block: 'start' }));
    check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'horizontal overflow');
    const sizes = await purpose.getByRole('button').evaluateAll(buttons => buttons.map(button => ({ w: button.getBoundingClientRect().width, h: button.getBoundingClientRect().height })));
    check(sizes.every(size => size.w >= 44 && size.h >= 44), 'touch target too small');
    const screenshot = `output/playwright/c1-${report.engine}-${language}-${width}.png`;
    await page.screenshot({ path: screenshot });
    report.cases.push({ language, width, purposeFilters: 4, sameExerciseIntersection: 'PASS', olderDates: 'PASS', storageAndStatistics: 'PASS', screenshot });
  }
  await seed('zh-TW');
  await history.locator('summary').first().click();
  await history.locator('details').nth(1).locator('summary').first().click();
  const linked = history.locator('[data-record-id="activity:linked"]');
  const beforeFeedback = JSON.parse(await bytes());
  await linked.locator('select').last().selectOption('better'); await settle();
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('rehab.activities.v1')).find(row => row.id === 'linked').nextDayResponse === 'better'), 'next-day feedback no longer saves');
  const beforeLog = await page.evaluate(() => JSON.parse(localStorage.getItem('rehab.trainingLogs.v2')));
  const linkedEditor = linked.locator('details').first();
  await linkedEditor.locator('summary').click();
  await linkedEditor.locator('input[type="number"]').first().fill('14');
  await linkedEditor.getByRole('button', { name: '儲存每組細節', exact: true }).click(); await settle();
  const afterLog = await page.evaluate(() => JSON.parse(localStorage.getItem('rehab.trainingLogs.v2')));
  check(afterLog.find(row => row.id === 'linked-cuff').sets[0].weightKg === 14, 'linked set editor no longer saves');
  check(JSON.stringify(afterLog.find(row => row.id === 'standalone-ankle')) === JSON.stringify(beforeLog.find(row => row.id === 'standalone-ankle')), 'edit changed unrelated log');
  check(await page.evaluate(() => window.__c1Writes.every(key => ['rehab.activities.v1', 'rehab.trainingLogs.v2'].includes(key))), 'explicit edits wrote unrelated data');
  report.boundaries = { kindOnlyAndRevised: 'PASS', partialMissingLink: 'PASS', linkedDeduplication: 'PASS', keyboard: 'PASS', nextDayFeedbackAndLinkedSetSave: 'PASS', emptyAndReset: 'PASS', evidence: 'browser automation; human/device/production NOT VERIFIED' };
  return report;
}
