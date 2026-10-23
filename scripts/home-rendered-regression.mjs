import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

// Expectations are independent of getNextAction and the locale resources:
// wiring HomePage to a constant route or the wrong translation must fail.
const expected = {
  'zh-TW': {
    safety: ['今天先確認一下身體狀況', '開始前，確認今天有沒有需要留意的不適。', '開始安全確認', '/safety'],
    assessment: ['今天活動起來感覺如何？', '確認疼痛與動作信心，再挑選動作。', '確認今天狀況', '/assessment'],
    outcome: ['補一筆功能確認', '你已經有訓練紀錄。用一個快速確認，看看日常動作感覺如何。', '新增功能確認', '/logs'],
    continue: ['從最近一次訓練繼續', '如果今天仍覺得可控制、沒有警訊，可以重複最近一次動作。', '繼續訓練', '/session/ankle-circles'],
    start: ['從今天適合的動作開始', '選一個身體部位，用慢速度、可控制、低衝擊的方式開始。', '選擇動作', '/exercises'],
    manual: '補記已完成的訓練',
    hint: '補記已經完成的訓練。現在要開始訓練，請先完成上方的安全檢查。',
  },
  en: {
    safety: ['Check how your body feels today', 'Before starting, check for any discomfort that needs attention today.', 'Start safety check', '/safety'],
    assessment: ['How does movement feel today?', 'Check pain and movement confidence, then choose an exercise.', 'Check today’s condition', '/assessment'],
    outcome: ['Add a quick function check-in', 'You have recent training logs. A short function check-in helps compare how daily movement feels.', 'Add check-in', '/logs'],
    continue: ['Continue from your latest training', 'Repeat the last exercise only if today still feels controlled and safe.', 'Continue training', '/session/ankle-circles'],
    start: ['Start with today’s suitable exercises', 'Choose a body area and begin with slow, controlled, low-impact movement.', 'Choose exercises', '/exercises'],
    manual: 'Log a finished workout',
    hint: 'Record a workout you have already finished. To start training now, use the safety check above.',
  },
};
const textContent = html => html.replace(/<[^>]*>/g, '').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
const temporary = mkdtempSync(join(process.cwd(), '.home-rendered-regression-'));
const originalWindow = globalThis.window;
let cases = 0;
try {
  const entry = join(temporary, 'entry.tsx');
  writeFileSync(entry, `
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import HomePage from '../src/pages/HomePage';
export function render() {
  return renderToStaticMarkup(<MemoryRouter initialEntries={['/']}><I18nProvider><HomePage /></I18nProvider></MemoryRouter>);
}
`);
  const result = await build({ configFile: false, logLevel: 'silent', build: { ssr: entry, write: false } });
  const output = Array.isArray(result) ? result[0].output : result.output;
  const file = join(temporary, 'entry.mjs');
  writeFileSync(file, output.find(item => item.type === 'chunk').code);
  const app = await import(pathToFileURL(file));

  // Use the same local calendar representation as stored safety dates. Outcomes
  // are one hour old, avoiding future timestamps and midnight boundary flakiness.
  const now = new Date();
  const recentDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const currentSafety = { completed: true, blocked: false, redFlags: [], safetyDate: now.toLocaleDateString('en-CA') };
  const log = { id: 'rendered-log', exerciseId: 'ankle-circles', exerciseTitle: 'Ankle circles', bodyArea: 'ankle', type: 'mobility', level: 'beginner', date: recentDate, completedAt: recentDate, difficultyRating: 3 };
  const outcome = { id: 'rendered-outcome', date: recentDate, bodyArea: 'ankle', score: 3 };
  function seed(language, { safetyReady = true, hasAssessment = true, hasLog = true, hasRecentOutcome = true, safety, outcomes, firstRun = false } = {}) {
    const values = new Map([
      ['rehab.language.v1', language],
      ['rehab.safetyGate.v1', JSON.stringify(safety ?? (safetyReady ? currentSafety : { completed: false, blocked: false, redFlags: [] }))],
      ['rehab.trainingLogs.v2', JSON.stringify(hasLog ? [log] : [])],
      ['rehab.functionalOutcomes.v2', JSON.stringify(outcomes ?? (hasRecentOutcome ? [outcome] : []))],
      ['rehab.savedRoutines.v1', '[]'],
      ['rehab.manualWorkouts.v1', '[]'],
      ['rehab.weeklyActivityPlan.v1', '[0,2,5,0,1,3,4]'],
      ['rehab.trainingGoals.v1', '{"rehab":3,"strength":2,"cardio":4}'],
    ]);
    if (!firstRun) values.set('rehab.onboardingSeen.v1', 'true');
    if (hasAssessment) values.set('rehab.assessment.v1', '{"bodyArea":"ankle","pain":1,"mode":"beginner","equipment":[]}');
    const writes = [];
    globalThis.window = { localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { writes.push(key); values.set(key, value); },
      removeItem: key => { writes.push(key); values.delete(key); },
    } };
    return { values, writes };
  }
  function check(language, name, state, action) {
    const { values, writes } = seed(language, state);
    const before = JSON.stringify([...values]);
    const html = app.render();
    const label = `${language}: ${name}`;
    const sections = html.match(/<section\b[^>]*aria-labelledby="home-next-action-title"[^>]*>[\s\S]*?<\/section>/g) ?? [];
    assert.equal(sections.length, 1, `${label}: exactly one primary section`);
    const section = sections[0];
    const [title, body, cta, href] = expected[language][action];
    assert.equal(textContent(section.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''), title, `${label}: primary heading`);
    assert.equal(textContent(section.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? ''), body, `${label}: primary explanation`);
    const links = [...section.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
    assert.equal(links.length, 2, `${label}: primary and secondary actions remain present`);
    assert.equal(links[0][1], href, `${label}: actual primary CTA href`);
    assert.equal(textContent(links[0][2]), cta, `${label}: actual primary CTA text`);
    assert.equal(links[1][1], '/logs/new', `${label}: secondary manual log route`);
    assert.equal(textContent(links[1][2]), expected[language].manual, `${label}: secondary manual log text`);
    assert(textContent(section).includes(expected[language].hint), `${label}: manual log explanation`);
    assert.deepEqual(writes, [], `${label}: render must not write storage`);
    assert.equal(JSON.stringify([...values]), before, `${label}: stored bytes preserved`);
    cases++;
  }
  for (const language of ['zh-TW', 'en']) {
    for (const safetyReady of [false, true]) for (const hasAssessment of [false, true]) {
      for (const hasLog of [false, true]) for (const hasRecentOutcome of [false, true]) {
        const state = { safetyReady, hasAssessment, hasLog, hasRecentOutcome };
        const action = !safetyReady ? 'safety' : !hasAssessment ? 'assessment'
          : hasLog && !hasRecentOutcome ? 'outcome' : hasLog ? 'continue' : 'start';
        check(language, JSON.stringify(state), state, action);
      }
    }
    check(language, 'expired safety despite returning-user data', { safety: { ...currentSafety, safetyDate: '2000-01-01' } }, 'safety');
    check(language, 'blocked safety despite returning-user data', { safety: { ...currentSafety, blocked: true } }, 'safety');
    check(language, 'saved red flag blocks training', { safety: { ...currentSafety, blocked: true, redFlags: ['acute-severe-pain'] } }, 'safety');
    check(language, 'recent outcome for a different body area', { outcomes: [{ ...outcome, bodyArea: 'shoulder' }] }, 'outcome');
    check(language, 'stale same-area outcome', { outcomes: [{ ...outcome, date: '2000-01-01T00:00:00Z' }] }, 'outcome');
    check(language, 'future same-area outcome', { outcomes: [{ ...outcome, date: new Date(now.getTime() + 86400000).toISOString() }] }, 'outcome');

    const { values, writes } = seed(language, { firstRun: true });
    const before = JSON.stringify([...values]);
    // Navigate uses an effect: SSR can prove protected home content is absent,
    // while actual /onboarding navigation requires a mounted browser check.
    assert.equal(app.render(), '', `${language}: first-run home renders no training CTA`);
    assert.deepEqual(writes, [], `${language}: first-run render has no storage writes`);
    assert.equal(JSON.stringify([...values]), before, `${language}: first-run data preserved`);
    cases++;
  }
  console.log(`Home rendered regression Pass: ${cases} cases (32 bilingual boolean combinations, 12 safety/outcome cases, 2 first-run SSR content guards); actual HomePage CTA href/copy, secondary log action and unchanged v2 storage.`);
} finally {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  rmSync(temporary, { recursive: true, force: true });
}
