import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
const temporary = mkdtempSync(join(process.cwd(), '.routine-navigation-'));
try {
  const entry = join(temporary, 'entry.tsx');
  writeFileSync(entry, `
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import ExerciseDetailPage from '../src/pages/ExerciseDetailPage';
import SavedRoutineReturnLink from '../src/components/SavedRoutineReturnLink';
import SavedRoutinePicker from '../src/components/SavedRoutinePicker';
import HomeSavedPlans from '../src/components/HomeSavedPlans';
export { getSavedRoutineContext } from '../src/utils/savedRoutineNavigation';
export function render(path, view='detail') { return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><I18nProvider>{view==='link' ? <SavedRoutineReturnLink exerciseId="ankle-circles" /> : view==='routine' ? <SavedRoutinePicker /> : view==='home' ? <HomeSavedPlans /> : <Routes><Route path="/exercise/:exerciseId" element={<ExerciseDetailPage />} /></Routes>}</I18nProvider></MemoryRouter>); }
`);
  const result = await build({configFile:false,logLevel:'silent',esbuild:{jsx:'automatic'},build:{ssr:entry,write:false}});
  const chunks = Array.isArray(result) ? result[0].output : result.output;
  const output = join(temporary,'entry.mjs');writeFileSync(output,chunks.find(x=>x.type==='chunk').code);
  const app = await import(pathToFileURL(output));
  const routine={id:'routine-three',name:'Three exercise plan',exerciseIds:['ankle-circles','hip-sit-to-stand','catalog-leg-extension']};
  const values=new Map([['rehab.savedRoutines.v1',JSON.stringify([routine])]]);
  globalThis.window={localStorage:{getItem:k=>values.get(k)??null,setItem:()=>{throw Error('navigation must never write');}}};
  for(const language of ['zh-TW','en']) {
    values.set('rehab.language.v1',language);
    const original=values.get('rehab.savedRoutines.v1');
    const detail=app.render('/exercise/ankle-circles?mode=all&routine=routine-three');
    assert(detail.includes('href="/session/ankle-circles?routine=routine-three"'),'start retains context');
    assert(detail.includes('href="/routine#routine-three"'),'detail returns to source');
    const label=language==='en'?'Back to routine: Three exercise plan':'回到「Three exercise plan」組合';
    assert(detail.includes(label),'localized label resolves name without extra braces');
    assert(app.render('/session/ankle-circles?routine=routine-three','link').includes(label),'saved-phase shared return link');
    for(const view of ['home','routine']) {
      const list=app.render('/routine',view);
      for(const id of routine.exerciseIds) assert(list.includes(`/exercise/${id}?mode=all&amp;routine=routine-three`),'all source links retain context/order');
      if(view==='routine') assert(list.includes('id="routine-three" tabindex="-1"'),'source card is focusable');
    }
    const catalog=app.render('/exercise/catalog-leg-extension?routine=routine-three');
    assert(!catalog.includes('href="/session/'),'catalog-only still cannot start guided session');
    for(const search of ['', '?routine=deleted','?routine=https://example.com','?routine=routine-other']) {
      assert.equal(app.getSavedRoutineContext(search,'ankle-circles'),null);
      assert(!app.render('/session/ankle-circles'+search,'link').includes('<a'),'invalid hint yields no return link');
    }
    assert.equal(app.getSavedRoutineContext('?routine=routine-three','shoulder-flexion'),null,'must belong to source routine');
    assert.equal(values.get('rehab.savedRoutines.v1'),original,'navigation leaves ordered data untouched');
  }
  values.set('rehab.savedRoutines.v1','broken');
  assert.equal(app.getSavedRoutineContext('?routine=routine-three','ankle-circles'),null);
  assert(!app.render('/session/ankle-circles?routine=routine-three','link').includes('<a'));
  assert.equal(values.get('rehab.savedRoutines.v1'),'broken','corrupt data is preserved');
  values.delete('rehab.savedRoutines.v1');
  assert.equal(app.getSavedRoutineContext('?routine=routine-three','ankle-circles'),null,'cleared routine falls back');
  console.log('Routine navigation Pass: bilingual source/start/return links, membership, missing/corrupt preservation, order and catalog isolation. Browser QA separately verifies effects/session-save behavior.');
} finally { rmSync(temporary,{recursive:true,force:true}); }
