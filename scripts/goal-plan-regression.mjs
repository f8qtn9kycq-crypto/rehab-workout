import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'vite';
async function load(entry) {const r=await build({configFile:false,logLevel:'silent',build:{write:false,lib:{entry,formats:['es']},rollupOptions:{output:{inlineDynamicImports:true}}}});const code=(Array.isArray(r)?r[0]:r).output.find(c=>c.type==='chunk').code;return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);}
const data=new Map([['rehab.weeklyActivityPlan.v1','[0,2,5,0,1,3,4]'],['rehab.manualWorkouts.v1','legacy data']]);
let quota=false;global.window={localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(quota)throw Error('quota');data.set(k,v);}}};
const goals=await load('src/services/trainingGoalStorage.ts');
assert.deepEqual(goals.readTrainingGoals(),{goals:{rehab:null,strength:null,cardio:null},error:false});
assert.equal(goals.saveTrainingGoals({rehab:0,strength:3,cardio:7}),true);assert.deepEqual(goals.readTrainingGoals().goals,{rehab:0,strength:3,cardio:7});
const previous=data.get(goals.GOAL_KEY);
for(const value of [{rehab:8,strength:3,cardio:1},{rehab:-1,strength:3,cardio:1},{rehab:1.5,strength:3,cardio:1},{rehab:'2',strength:3,cardio:1},{rehab:NaN,strength:3,cardio:1},{strength:3,cardio:1},[],null]) {assert.equal(goals.saveTrainingGoals(value),false);assert.equal(data.get(goals.GOAL_KEY),previous);}
quota=true;assert.equal(goals.saveTrainingGoals({rehab:1,strength:1,cardio:1}),false);assert.equal(data.get(goals.GOAL_KEY),previous);quota=false;
for(const raw of ['broken','null','[]','{"rehab":2}']) {data.set(goals.GOAL_KEY,raw);assert.equal(goals.readTrainingGoals().error,true);assert.equal(goals.saveTrainingGoals({rehab:null,strength:null,cardio:null}),false);assert.equal(data.get(goals.GOAL_KEY),raw);}
assert.equal(data.get('rehab.manualWorkouts.v1'),'legacy data');assert.equal(data.get('rehab.weeklyActivityPlan.v1'),'[0,2,5,0,1,3,4]');
assert.match(readFileSync('src/services/localStorageService.ts','utf8'),/rehab.trainingGoals.v1/);
const {buildTodayPlan}=await load('src/utils/todayPlan.ts');
const days=[0,5,6,0,1,3,4];const day={date:'2026-10-10',items:[{source:'manual',workout:{exercises:[{exerciseId:'catalog-lat-pulldown'},{exerciseId:'custom-personal',kind:'strength'}]}},{source:'activity',activity:{kind:'cycling'}},{source:'training',log:{}}]};const records={days:[day]};const before=JSON.stringify({days,records});
const today=buildTodayPlan(days,records,new Date('2026-10-10T12:00:00'));assert.deepEqual(today.planned,['push']);assert.deepEqual(today.focuses,['pull','mixed']);assert.deepEqual(today.sources.map(s=>s.count),[1,1,1]);assert.equal(JSON.stringify({days,records}),before,'plan Push permits actual Pull without schedule mutation');
assert.deepEqual(buildTodayPlan([],records,new Date('2026-10-11T12:00:00')).sources.map(s=>s.count),[0,0,0]);
console.log('Goal/Today regression passed: unset/zero/reload, bounds/corrupt/quota preservation, existing keys, Push plan/Pull actual without mutation, date/source distinction and cleanup.');

assert.deepEqual(buildTodayPlan([0,2,4,0,1,3,6],{days:[]},new Date('2026-10-12T12:00:00')).planned,['lower','cycling'],'Monday=0');
assert.deepEqual(buildTodayPlan([0,2,4,0,1,3,6],{days:[]},new Date('2026-10-11T12:00:00')).planned,['cycling'],'Sunday=6');
console.log('Monday-first schedule boundaries passed: Monday and Sunday.');
