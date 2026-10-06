import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const temporary = mkdtempSync(join(process.cwd(), '.pr183-regression-'));
try {
  const entry = join(temporary, 'entry.tsx');
  writeFileSync(entry, `
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import ManualWorkoutCard from '../src/components/ManualWorkoutCard';
import AssessmentPage from '../src/pages/AssessmentPage';
export { readManualWorkouts, MANUAL_WORKOUT_KEY } from '../src/services/manualWorkoutStorage';
export { getSavedAssessment } from '../src/services/assessmentStorage';
export { assessmentStorageKey } from '../src/data/safety';
export function renderRecord(workout) {
  return renderToStaticMarkup(<I18nProvider><ManualWorkoutCard workout={workout} /></I18nProvider>);
}
export function renderAssessment() {
  return renderToStaticMarkup(<MemoryRouter><I18nProvider><AssessmentPage /></I18nProvider></MemoryRouter>);
}
`);
  const result = await build({ configFile: false, logLevel: 'silent', build: { ssr: entry, write: false } });
  const chunks = Array.isArray(result) ? result[0].output : result.output;
  const output = join(temporary, 'entry.mjs');
  writeFileSync(output, chunks.find(item => item.type === 'chunk').code);
  const app = await import(pathToFileURL(output));
  const values = new Map();
  globalThis.window = { localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  } };
  for (const [language, oldName, newName, equipmentName] of [
    ['zh-TW', '啞鈴肩推', '槓鈴肩推', '啞鈴'],
    ['en', 'Seated dumbbell shoulder press', 'Barbell shoulder press', 'Dumbbell'],
  ]) {
    values.set('rehab.language.v1', language);
    const record = { id: 'legacy-press', date: '2026-10-05', createdAt: '2026-10-05T01:00:00Z', exercises: [{
      exerciseId: 'catalog-shoulder-press', name: oldName,
      equipment: equipmentName, equipmentId: 'dumbbell', sets: [{ reps: 8, weightKg: 5 }],
    }] };
    const raw = JSON.stringify([record]);
    values.set(app.MANUAL_WORKOUT_KEY, raw);
    const html = app.renderRecord(app.readManualWorkouts().workouts[0]);
    assert(html.includes(oldName) && html.includes(equipmentName), 'legacy name/equipment remain visible');
    assert(!html.includes(newName), 'legacy record is not relabeled as barbell');
    assert(!html.includes('/movements/shoulderPress.png'), 'legacy record must not display the revised barbell art');
    assert.equal(values.get(app.MANUAL_WORKOUT_KEY), raw, 'render/read must not mutate stored records');
    const unknownEquipment = structuredClone(record);
    delete unknownEquipment.exercises[0].equipmentId;
    assert(!app.renderRecord(unknownEquipment).includes('/movements/shoulderPress.png'), 'legacy records without equipment IDs remain protected');
    const priorBarbellChoice = structuredClone(record);
    priorBarbellChoice.exercises[0].equipmentId = 'barbell';
    const priorBarbellHtml = app.renderRecord(priorBarbellChoice);
    assert(priorBarbellHtml.includes(oldName) && !priorBarbellHtml.includes('/movements/shoulderPress.png'), 'an old title is not upgraded solely because actual equipment was barbell');
    const current = structuredClone(record);
    Object.assign(current.exercises[0], { name: newName, equipmentId: 'barbell' });
    assert(app.renderRecord(current).includes('/movements/shoulderPress.png'), 'new barbell record retains canonical art');
    delete current.exercises[0].equipmentId;
    current.exercises[0].equipment = '';
    assert(app.renderRecord(current).includes('/movements/shoulderPress.png'), 'new barbell title identifies optional-equipment records');
    const assessment = app.renderAssessment();
    assert(!assessment.includes(language === 'en' ? '>Barbell<' : '>槓鈴<'), 'barbell is absent from the actual Assessment UI');
    assert(assessment.includes(language === 'en' ? '>Dumbbell<' : '>啞鈴<'), 'existing assessment equipment remains available');
  }
  const savedAssessment = JSON.stringify({ bodyArea: 'shoulder', pain: 0, mode: 'standard', equipment: ['barbell', 'bodyweight'] });
  values.set(app.assessmentStorageKey, savedAssessment);
  assert.deepEqual(app.getSavedAssessment().equipment, ['barbell', 'bodyweight'], 'previously saved assessment equipment remains readable');
  assert.equal(values.get(app.assessmentStorageKey), savedAssessment, 'hiding an assessment option does not migrate saved assessment data');
  console.log('PR183 regression passed: bilingual legacy/current record rendering, unchanged storage, and actual Assessment equipment UI.');
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
