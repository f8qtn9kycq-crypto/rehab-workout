import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
const temporary = mkdtempSync(join(process.cwd(), '.identity-art-regression-'));
try {
  const entry = join(temporary, 'entry.tsx');
  writeFileSync(entry, `
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import ExerciseCard from '../src/components/ExerciseCard';
import ExerciseIdentityVisual from '../src/components/ExerciseIdentityVisual';
export { exercises } from '../src/data/exercises';
export function renderCard(exercise) { return renderToStaticMarkup(<MemoryRouter><I18nProvider><ExerciseCard exercise={exercise} /></I18nProvider></MemoryRouter>); }
export function renderIdentity(exercise, compact=false) { return renderToStaticMarkup(<I18nProvider><ExerciseIdentityVisual exercise={exercise} compact={compact} /></I18nProvider>); }
export function renderLog(exercise) { return renderToStaticMarkup(<I18nProvider><ExerciseIdentityVisual log={{exerciseId:exercise.id,title:'Stored title',bodyArea:exercise.bodyArea}} compact /></I18nProvider>); }
export function renderMissing() { return renderToStaticMarkup(<I18nProvider><ExerciseIdentityVisual log={{exerciseId:'removed-exercise',exerciseTitle:'Legacy exercise',bodyArea:'hip'}} /></I18nProvider>); }
`);
  const result = await build({configFile:false,logLevel:'silent',build:{ssr:entry,write:false}});
  const chunks = Array.isArray(result) ? result[0].output : result.output;
  const output = join(temporary,'entry.mjs');
  writeFileSync(output,chunks.find(item=>item.type==='chunk').code);
  const app = await import(pathToFileURL(output));
  const values = new Map();
  globalThis.window={localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}};
  let comparisons=0;
  for(const language of ['zh-TW','en']) {
    values.set('rehab.language.v1',language);
    for(const exercise of app.exercises) {
      const card=app.renderCard(exercise);
      const source=card.match(/<img[^>]*src="([^"]+)"/)?.[1];
      assert(source,`library art exists: ${exercise.id}`);
      for(const compact of [false,true]) {
        const identity=app.renderIdentity(exercise,compact);
        assert.equal(identity.match(/<img[^>]*src="([^"]+)"/)?.[1],source,`same image for ${exercise.id}, ${language}, compact=${compact}`);
        assert(!identity.includes('/hip-sit-to-stand.svg'),'legacy pose must not replace library art');
        if(exercise.id==='hip-sit-to-stand') {
          assert(identity.includes('/exercise-visuals/hip-sit-to-stand-muscles.svg'),'canonical pose retains supplemental muscle map');
          for(const label of (language==='en' ? ['Primary regions','Secondary regions','Glutes and front thighs','Trunk support and back thighs','diagonal stripes'] : ['主要訓練區域','輔助訓練區域','臀部與大腿前側','軀幹穩定與大腿後側','P 加斜線'])) assert(identity.includes(label),'supplemental muscle labels remain');
        }
        comparisons++;
      }
      const record=app.renderLog(exercise);
      assert.equal(record.match(/<img[^>]*src="([^"]+)"/)?.[1],source,`saved log image for ${exercise.id}, ${language}`);
      const title=card.match(/<h3[^>]*>(.*?)<\/h3>/)?.[1];
      assert(title && record.includes(title),`saved log localized identity for ${exercise.id}, ${language}`);
      if(exercise.id==='hip-sit-to-stand') assert(record.includes('/exercise-visuals/hip-sit-to-stand-muscles.svg'),'saved log preserves supplemental muscle map');
      assert(!record.includes('Stored title'),'known ID resolves current localized identity');
      comparisons++;
    }
    const missing=app.renderMissing();
    assert(!missing.includes('<img'),'missing catalog record does not borrow another exercise image');
    assert(missing.includes('role="img"'),'missing image retains accessible fallback');
  }
  console.log(`Identity art regression passed: ${comparisons} actual library/session/record source comparisons, bilingual and missing-ID fallback.`);
} finally { rmSync(temporary,{recursive:true,force:true}); }
