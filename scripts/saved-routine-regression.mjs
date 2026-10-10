import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'vite';
const result=await build({configFile:false,logLevel:'silent',build:{write:false,lib:{entry:'src/services/savedRoutineStorage.ts',formats:['es']},rollupOptions:{output:{inlineDynamicImports:true}}}});
const code=(Array.isArray(result)?result[0]:result).output.find(c=>c.type==='chunk').code;
const storage=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const data=new Map();let quota=false;global.window={localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(quota)throw Error('quota');data.set(k,v);}}};
assert.deepEqual(storage.readSavedRoutines(),{routines:[],error:false});
const routine={id:'routine-test',name:'My routine',exerciseIds:['ankle-circles','shoulder-flexion']};assert.equal(storage.saveRoutine(routine),true);assert.deepEqual(storage.readSavedRoutines().routines,[routine]);
const reordered={...routine,exerciseIds:[...routine.exerciseIds].reverse()};assert.equal(storage.saveRoutine(reordered),true);assert.deepEqual(storage.readSavedRoutines().routines,[reordered]);
const raw=data.get(storage.ROUTINE_KEY);
for(const invalid of [{...routine,exerciseIds:['custom-test']},{...routine,exerciseIds:['missing-id']},{...routine,exerciseIds:[]},{...routine,exerciseIds:['ankle-circles','ankle-circles']},{...routine,name:''},{...routine,id:'wrong'}]) {assert.equal(storage.saveRoutine(invalid),false);assert.equal(data.get(storage.ROUTINE_KEY),raw);}
assert.equal(storage.saveRoutine({...routine,id:'routine-other',name:' MY ROUTINE '}),false,'normalized duplicate names reject');
quota=true;assert.equal(storage.saveRoutine({...routine,name:'Updated'}),false);assert.equal(data.get(storage.ROUTINE_KEY),raw);quota=false;
const missing={...routine,exerciseIds:['removed-official-id','ankle-circles']};data.set(storage.ROUTINE_KEY,JSON.stringify([missing]));assert.deepEqual(storage.readSavedRoutines().routines,[missing],'missing historical ID remains recoverable');assert.equal(storage.saveRoutine({...missing,exerciseIds:['ankle-circles']}),true,'repair keeps ID/name');
for(const corrupt of ['broken','null','{}',JSON.stringify([routine,routine]),JSON.stringify([{...routine,exerciseIds:['custom-x']}])]){data.set(storage.ROUTINE_KEY,corrupt);assert.equal(storage.readSavedRoutines().error,true);assert.equal(storage.saveRoutine(routine),false);assert.equal(data.get(storage.ROUTINE_KEY),corrupt);}
const ui=readFileSync('src/components/SavedRoutinePicker.tsx','utf8');assert.doesNotMatch(ui,/customExerciseStorage|\/session\//,'saved compositions neither import custom storage nor start sessions');assert.match(ui,/\/exercise\//,'detail page retains steps and safety');assert.match(readFileSync('src/services/localStorageService.ts','utf8'),/rehab.savedRoutines.v1/);
console.log('Saved routines regression passed: stable ordered IDs, update/reorder, invalid/custom rejection, missing-ID recovery, duplicate names, corrupt/quota preservation, safety access and cleanup.');
