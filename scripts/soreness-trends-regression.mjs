import assert from 'node:assert/strict';
import { build } from 'vite';
const result = await build({configFile:false,logLevel:'silent',build:{write:false,lib:{entry:'src/utils/sorenessHistory.ts',formats:['es']},rollupOptions:{output:{inlineDynamicImports:true}}}});
const code=(Array.isArray(result)?result[0]:result).output.find(item=>item.type==='chunk').code;
const h=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
globalThis.window={localStorage:{getItem:()=>{throw Error('trends must not read or write storage');},setItem:()=>{throw Error('trends must not write');}}};
const today=new Date(2026,9,23,0,30);
const region=(view,side,severity,regionId='traps')=>({regionId,side,...(view?{view}:{}),tissue:'muscle',severity,symptoms:[]});
const entry=(id,date,regions)=>({id,date,createdAt:date+'T08:00:00.000Z',regions});
const entries=[
 entry('today','2026-10-23',[region('F','left',2),region('B','left',7),region('F','right',5),region(undefined,'left',4),region('B','center',6,'jLumbar')]),
 entry('first','2026-10-17',[region('F','left',3)]),
 entry('outside','2026-10-16',[region('F','left',8)]),
 entry('zero','2026-10-22',[region('F','left',0)]),
 entry('future','2026-10-24',[region('F','left',9)]),
];
const before=JSON.stringify(entries);
assert.deepEqual(h.trendRange(7,today),{firstDay:'2026-10-17',lastDay:'2026-10-23'});
assert.deepEqual(h.trendRange(30,today),{firstDay:'2026-09-24',lastDay:'2026-10-23'});
assert.deepEqual(h.trendRange(90,today),{firstDay:'2026-07-26',lastDay:'2026-10-23'});
const values=key=>h.trendRows(entries,key,7,today).map(row=>row.region.severity);
assert.deepEqual(values('F:traps.left'),[3,2],'inclusive endpoints, chronological, zero/missing/future excluded');
assert.deepEqual(values('B:traps.left'),[7],'back independent');
assert.deepEqual(values('F:traps.right'),[5],'body side independent');
assert.deepEqual(values('legacy:traps.left'),[4],'legacy view never inferred');
assert.deepEqual(values('B:jLumbar.center'),[6],'center independent');
assert.deepEqual(values('F:jLumbar.center'),[]);
assert.deepEqual(h.trendRows([], 'F:traps.left',7,today),[]);
assert.equal(h.observedPositions(entries).length,5,'zero records do not create invented positions');
assert.equal(JSON.stringify(entries),before,'input entries immutable');
assert.deepEqual(h.trendRows([entry('zero-only','2026-10-23',[region(undefined,'right',0)])],'legacy:traps.right',7,today),[],'old zero never implies recovery');
const invalid=[entry('bad','2026-02-30',[region('F','left',4)]),entry('bad-value','2026-10-23',[region('F','left',11)]),entry('fraction','2026-10-23',[region('F','left',2.5)])];
assert.deepEqual(h.trendRows(invalid,'F:traps.left',90,today),[]);
for(const date of ['2026-02-30','2026-10-2','not-a-date'])assert.equal(h.validHistoryDate(date),false);
assert.equal(h.validHistoryDate('2024-02-29'),true);assert.equal(h.validHistoryDate('2026-02-29'),false);
assert.equal(h.historyDayOffset('2026-03-09','2026-03-07'),2,'calendar distance spans DST safely');
assert.equal(h.historyDayOffset('2026-10-23','2026-10-17'),6);
assert.throws(()=>h.trendRange(0,today));assert.throws(()=>h.trendRange(8,today));assert.throws(()=>h.trendRange(7,new Date('invalid')));
console.log('PASS: soreness trends retain front/back/side/center/legacy identity, local inclusive windows, positive observations only, no inferred recovery or writes.');
