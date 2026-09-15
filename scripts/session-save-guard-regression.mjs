#!/usr/bin/env node
import fs from 'node:fs';

const source = fs.readFileSync('src/components/SessionTracker.tsx', 'utf8');

function assertIncludes(value, label) {
  if (!source.includes(value)) throw new Error(`${label}: expected ${JSON.stringify(value)}`);
}

assertIncludes('const saveInProgressRef = useRef(false)', 'session save uses a synchronous ref guard');
assertIncludes('if (saveInProgressRef.current) return', 'repeated save activation is a no-op');
assertIncludes('saveInProgressRef.current = true', 'save guard locks before persistence');
assertIncludes('if (!saveLog(log))', 'storage failure remains detectable');
assertIncludes('saveInProgressRef.current = false', 'storage failure releases the guard for retry');
assertIncludes("setPhase('saved')", 'successful save still reaches confirmation');

const guardIndex = source.indexOf('if (saveInProgressRef.current) return');
const lockIndex = source.indexOf('saveInProgressRef.current = true');
const saveIndex = source.indexOf('if (!saveLog(log))');
if (!(guardIndex < lockIndex && lockIndex < saveIndex)) {
  throw new Error('save guard must synchronously lock before saveLog');
}

console.log('pass: session save duplicate-activation guard and retry release');
