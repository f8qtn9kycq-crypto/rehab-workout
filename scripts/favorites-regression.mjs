import assert from 'node:assert/strict';
import { build } from 'vite';
const result = await build({configFile:false,logLevel:'silent',build:{write:false,lib:{entry:'src/services/favoriteStorage.ts',formats:['es']},rollupOptions:{output:{inlineDynamicImports:true}}}});
const code = (Array.isArray(result)?result[0]:result).output.find(c=>c.type==='chunk').code;
const data=new Map([['rehab.trainingLogs.v2','legacy']]); let quota=false, events=0;
global.window={localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(quota)throw Error('quota');data.set(k,v);}},dispatchEvent:()=>events++};
const api=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
assert.deepEqual(api.readFavorites(),{ids:[],error:false});
assert.equal(api.toggleFavorite('shoulder-flexion'),true);assert.deepEqual(api.readFavorites().ids,['shoulder-flexion']);
assert.equal(api.toggleFavorite('custom-private'),false);
quota=true;assert.equal(api.toggleFavorite('shoulder-flexion'),false);assert.deepEqual(api.readFavorites().ids,['shoulder-flexion']);quota=false;
assert.equal(api.toggleFavorite('shoulder-flexion'),true);assert.deepEqual(api.readFavorites().ids,[]);assert.equal(events,2);
for(const raw of ['broken','null','{}','["shoulder-flexion","shoulder-flexion"]','[4]']){data.set(api.FAVORITES_KEY,raw);assert.equal(api.readFavorites().error,true);assert.equal(api.toggleFavorite('shoulder-flexion'),false);assert.equal(data.get(api.FAVORITES_KEY),raw);}
data.set(api.FAVORITES_KEY,'["historical-missing"]');assert.equal(api.toggleFavorite('shoulder-flexion'),true);assert.deepEqual(api.readFavorites().ids,['historical-missing','shoulder-flexion']);assert.equal(data.get('rehab.trainingLogs.v2'),'legacy');
console.log('Favorites persistence, toggle, canonical eligibility, corrupt/quota preservation and legacy data passed.');
