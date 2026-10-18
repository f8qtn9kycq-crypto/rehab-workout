import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
const temporary = mkdtempSync(join(process.cwd(), '.library-recording-'));
try {
  const entry = join(temporary, 'entry.tsx');
  writeFileSync(entry, `
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import ExerciseDetailPage from '../src/pages/ExerciseDetailPage';
import ExerciseCard from '../src/components/ExerciseCard';
import ManualWorkoutPage from '../src/pages/ManualWorkoutPage';
export { readLibraryRecordingSelection, libraryRecordingUrl } from '../src/utils/libraryRecording';
export { exercises } from '../src/data/exercises';
export { equipmentChoiceIds } from '../src/data/manualWorkoutOptions';
export function detail(id) {return renderToStaticMarkup(<MemoryRouter initialEntries={['/exercise/'+id]}><I18nProvider><Routes><Route path="/exercise/:exerciseId" element={<ExerciseDetailPage/>}/></Routes></I18nProvider></MemoryRouter>);}
export function card(exercise) {return renderToStaticMarkup(<MemoryRouter initialEntries={['/exercises?mode=all']}><I18nProvider><ExerciseCard exercise={exercise}/></I18nProvider></MemoryRouter>);}
export function manual(search) {return renderToStaticMarkup(<MemoryRouter initialEntries={['/logs/new'+search]}><I18nProvider><ManualWorkoutPage/></I18nProvider></MemoryRouter>);}
`);
  const result = await build({configFile:false,logLevel:'silent',esbuild:{jsx:'automatic'},build:{ssr:entry,write:false}});
  const chunks=Array.isArray(result)?result[0].output:result.output;
  const output=join(temporary,'entry.mjs');writeFileSync(output,chunks.find(c=>c.type==='chunk').code);
  const api=await import(pathToFileURL(output));
  const data=new Map();
  globalThis.window={localStorage:{getItem:k=>data.get(k)??null,setItem:()=>{throw Error('render and selection must never write');}}};
  const selection={exerciseId:'catalog-lat-pulldown',equipmentId:'cable',grip:'V 握把 & <test>'};
  const url=api.libraryRecordingUrl(selection);
  assert.deepEqual(api.readLibraryRecordingSelection(url.slice(url.indexOf('?'))),selection);
  for(const search of ['?exercise=custom-private','?exercise=unknown','?exercise=catalog-lat-pulldown&equipment=unknown','?exercise=catalog-lat-pulldown&equipment=','?exercise=catalog-lat-pulldown&grip='+encodeURIComponent('字'.repeat(101))]) {
    assert.equal(api.readLibraryRecordingSelection(search),null,search);
  }
  for(const language of ['zh-TW','en']) {
    data.set('rehab.language.v1',language);
    const before=JSON.stringify([...data]);
    for(const exercise of api.exercises) {
      const detail=api.detail(exercise.id);
      assert(detail.includes('id="record"'),'record setup exists for every library exercise');
      for(const id of api.equipmentChoiceIds) assert(detail.includes('value="'+id+'"'),`shared equipment ${id}`);
      assert.equal(detail.includes(`href="/session/${exercise.id}"`),!exercise.catalogOnly,'guided eligibility unchanged');
      assert(api.card(exercise).includes(`/exercise/${exercise.id}?mode=all#record`),'card keeps library context and points to setup');
    }
    const markup=api.manual(url.slice(url.indexOf('?')));
    assert(markup.includes('value="V 握把 &amp; &lt;test&gt;"'),'grip is escaped and copied');
    assert(markup.includes('value="cable" selected'),'recording equipment is selected');
    assert(!/<input[^>]*type="number"[^>]*value="\d+"/.test(markup),'handoff never fabricates actual dose');
    const invalid=api.manual('?exercise=missing');
    assert(invalid.includes(language==='en'?'Invalid exercise or equipment selection':'動作或器材設定無效'));
    assert.equal(JSON.stringify([...data]),before,'library browsing/handoff rendering never writes history');
  }
  console.log('Library recording consistency passed: bilingual card/detail, all shared choices, validated handoff, no fabricated dose, canonical-only guided eligibility and no storage writes.');
} finally { rmSync(temporary,{recursive:true,force:true}); }
