import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
const temporary=mkdtempSync(join(process.cwd(),'.weekly-entry-regression-'));
try {
 const entry=join(temporary,'entry.tsx');
 writeFileSync(entry,`
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import HomePage from '../src/pages/HomePage';
import RoutinePage from '../src/pages/RoutinePage';
export function render(path) { return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><I18nProvider>{path.startsWith('/routine') ? <RoutinePage /> : <HomePage />}</I18nProvider></MemoryRouter>); }
`);
 const r=await build({configFile:false,logLevel:'silent',build:{ssr:entry,write:false}});
 const chunks=Array.isArray(r)?r[0].output:r.output;
 const file=join(temporary,'entry.mjs');writeFileSync(file,chunks.find(x=>x.type==='chunk').code);
 const app=await import(pathToFileURL(file));
 const values=new Map([
  ['rehab.onboardingSeen.v1','true'],
  ['rehab.weeklyActivityPlan.v1','[0,2,5,0,1,3,4]'],
  ['rehab.savedRoutines.v1',JSON.stringify([{id:'routine-preserved-plan',name:'Preserved routine',exerciseIds:['ankle-circles','hip-clamshell']}])],
  ['rehab.trainingGoals.v1','{"rehab":3,"strength":2,"cardio":4}'],
  ['rehab.manualWorkouts.v1','[]'],
  ['rehab.trainingLogs.v2','[]'],
  ['rehab.functionalOutcomes.v2','[]'],
 ]);
 globalThis.window={localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}};
 for(const [language,label,explanation] of [['zh-TW','編輯每週日期安排','常用組合保存動作順序'],['en','Edit weekly dates','Saved routines below keep exercises']]) {
  values.set('rehab.language.v1',language);
  const before=JSON.stringify([...values]);
  const home=app.render('/');const routine=app.render('/routine?edit=routine-preserved-plan');
  assert(home.includes('href="/#weekly-schedule"')&&home.includes(label),'home progress exposes editor link');
  assert(routine.includes('href="/routine?edit=routine-preserved-plan#weekly-schedule"')&&routine.includes(explanation),'routine has same-page date editor and purpose explanation');
  for(const html of [home,routine]) {
   assert.equal((html.match(/id="weekly-schedule"/g)||[]).length,1,'one date editor per page');
   assert(html.includes('data-weekly-schedule-editor'),'inner editor exists');
   assert.equal((html.match(/<select/g)||[]).length>=7,true,'existing date selects are available');
  }
  assert(app.render('/routine?new=1').includes('href="/routine?new=1#weekly-schedule"'),'new routine query is retained by the same-page date link');
  assert(routine.includes('Preserved routine'),'existing saved routine remains visible');
  assert.equal(JSON.stringify([...values]),before,'render/navigation entry does not write existing storage');
 }
 values.set('rehab.weeklyActivityPlan.v1','corrupt');
 const corruptBefore=JSON.stringify([...values]);
 const html=app.render('/routine#weekly-schedule');
 assert(html.includes('disabled'),'corrupt schedule remains disabled');
 assert.equal(JSON.stringify([...values]),corruptBefore,'corrupt storage is not overwritten');
 console.log('Weekly entry rendered regression Pass: bilingual same-page links, unique existing editor, saved routine presence, unchanged keys/data and corrupt preservation.');
} finally {rmSync(temporary,{recursive:true,force:true});}
