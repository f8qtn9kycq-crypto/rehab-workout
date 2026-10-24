// Execute with playwright-cli run-code --filename on an isolated origin.
async page => {
  const base = 'http://127.0.0.1:4183';
  const check = (value, message) => { if (!value) throw new Error(message); };
  const results = [];
  for (const language of ['zh-TW', 'en']) for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const safety of [false, true]) for (const assessment of [false, true]) for (const log of [false, true]) for (const outcome of [false, true]) {
      await page.goto(base);
      const fixture = await page.evaluate(({ language, safety, assessment, log, outcome }) => {
        localStorage.clear();
        localStorage.setItem('rehab.onboardingSeen.v1', 'true');
        localStorage.setItem('rehab.language.v1', language);
        const now = new Date();
        if (safety) localStorage.setItem('rehab.safetyGate.v1', JSON.stringify({ completed: true, blocked: false, redFlags: [], safetyDate: now.toLocaleDateString('en-CA'), completedAt: now.toISOString() }));
        if (assessment) localStorage.setItem('rehab.assessment.v1', JSON.stringify({ bodyArea: 'ankle', equipment: ['none'], mode: 'beginner', pain: 0, functionalBaseline: 6 }));
        localStorage.setItem('rehab.trainingLogs.v2', JSON.stringify(log ? [{ id: 'qa-log', date: now.toISOString(), completedAt: now.toISOString(), exerciseId: 'ankle-circles', exerciseTitle: 'Ankle circles', bodyArea: 'ankle', type: 'mobility', level: 'beginner', setsCompleted: 1, repsCompleted: 5, painBefore: 0, painAfter: 0, difficultyRating: 2, stoppedEarly: false }] : []));
        localStorage.setItem('rehab.functionalOutcomes.v2', JSON.stringify(outcome ? [{ id: 'qa-outcome', date: now.toISOString(), bodyArea: 'ankle', score: 6 }] : []));
        localStorage.setItem('qa-unrelated', 'preserved');
        return Object.fromEntries(['rehab.safetyGate.v1', 'rehab.assessment.v1', 'rehab.trainingLogs.v2', 'rehab.functionalOutcomes.v2', 'qa-unrelated'].map(key => [key, localStorage.getItem(key)]));
      }, { language, safety, assessment, log, outcome });
      // The initial visit may redirect to onboarding before the fixture exists.
      await page.goto(base);
      const section = page.locator('section[aria-labelledby="home-next-action-title"]');
      await section.waitFor();
      const expected = !safety ? '/safety' : !assessment ? '/assessment' : log && !outcome ? '/logs?outcomeArea=ankle#function-check-in' : log ? '/session/ankle-circles' : '/exercises';
      const primary = section.locator('a').first();
      check(await primary.getAttribute('href') === expected, `wrong primary: ${language}/${width}/${JSON.stringify({ safety, assessment, log, outcome })}`);
      check(await section.locator('a[href="/logs/new"]').count() === 1, 'secondary quick log missing');
      const bounds = await primary.boundingBox();
      check(bounds && bounds.height >= 44, 'primary touch target');
      const observed = await page.evaluate(keys => ({ bytes: Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), overflow: document.documentElement.scrollWidth > innerWidth }), Object.keys(fixture));
      check(JSON.stringify(observed.bytes) === JSON.stringify(fixture), 'homepage changed source records');
      check(!observed.overflow, 'homepage horizontal overflow');
      await primary.click();
      await page.waitForURL(url => url.pathname + url.search + url.hash === expected);
      check(new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash === expected, 'rendered primary did not navigate');
      if (expected.includes('outcomeArea=')) {
        const form = page.locator('#function-check-in');
        await form.locator('button[aria-pressed="true"]').filter({ hasText: language === 'en' ? 'Ankle Stability' : '踝關節穩定' }).waitFor();
        await page.waitForFunction(() => document.activeElement?.id === 'outcome-check-in-title');
        check(await form.locator('button[aria-pressed="true"]').innerText() === (language === 'en' ? 'Ankle Stability' : '踝關節穩定'), 'outcome area handoff');
        check(await page.locator('#outcome-check-in-title').evaluate(el => el === document.activeElement), 'check-in heading focus');
        check(await page.locator('#outcome-check-in-title').evaluate(el => el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().bottom <= innerHeight), 'check-in visible');
        await form.locator('button[type="submit"]').click();
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('rehab.functionalOutcomes.v2')));
        check(saved.length === 1 && saved[0].bodyArea === 'ankle', 'saved wrong outcome area');
        await page.goto(base);
        check(await page.locator('section[aria-labelledby="home-next-action-title"] a').first().getAttribute('href') === '/session/ankle-circles', 'check-in did not complete home action');
      }
      results.push({ language, width, safety, assessment, log, outcome, destination: expected });
    }
    for (const mode of ['expired', 'blocked', 'first-run']) {
      await page.goto(base);
      await page.evaluate(mode => {
        if (mode === 'first-run') localStorage.removeItem('rehab.onboardingSeen.v1');
        else {
          const now = new Date();
          localStorage.setItem('rehab.safetyGate.v1', JSON.stringify({ completed: true, blocked: mode === 'blocked', redFlags: mode === 'blocked' ? ['neuro-symptoms'] : [], safetyDate: mode === 'expired' ? '2000-01-01' : now.toLocaleDateString('en-CA'), completedAt: now.toISOString() }));
        }
      }, mode);
      await page.reload();
      if (mode === 'first-run') await page.waitForURL(url => url.pathname === '/onboarding');
      else {
        const primary = page.locator('section[aria-labelledby="home-next-action-title"] a').first();
        check(await primary.getAttribute('href') === '/safety', `${mode} bypassed safety CTA`);
        await primary.click(); await page.waitForURL(url => url.pathname === '/safety');
      }
      results.push({ language, width, mode, destination: new URL(page.url()).pathname });
    }
  }
  return { matrixFlows: results.filter(r => r.mode === undefined).length, edgeFlows: results.filter(r => r.mode !== undefined).length, results };
}
