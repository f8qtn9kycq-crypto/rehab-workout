#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();
const outputPath = path.join(rootDir, 'docs/exercise-coverage-audit.md');

const sourceFiles = {
  exercises: 'src/data/exercises.ts',
  equipmentOptions: 'src/data/equipmentOptions.ts',
  types: 'src/types/rehab.ts',
  exercisesPage: 'src/pages/ExercisesPage.tsx',
  exerciseFilter: 'src/components/ExerciseFilter.tsx',
  exerciseModel: 'src/utils/exerciseModel.ts',
  recommendationEngine: 'src/utils/recommendationEngine.ts',
  logService: 'src/services/logService.ts',
};

const auditBodyAreas = ['shoulder_hip', 'shoulder_neck', 'knee', 'ankle'];
const requiredLevels = ['beginner', 'intermediate', 'advanced'];
const requiredTypes = ['mobility', 'strength', 'stretch', 'relaxation', 'balance', 'proprioception'];
const supportOnlyEquipment = ['bodyweight', 'chair', 'wall'];

function readSource(filePath) {
  return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
}

function extractConstStringArray(source, constName) {
  const match = source.match(new RegExp(`export const ${constName} = \\[([\\s\\S]*?)\\] as const`));
  if (!match) return [];

  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function extractEquipmentIds(source) {
  const match = source.match(/export const EQUIPMENT_IDS = \{([\s\S]*?)\} as const/);
  if (!match) return [];

  return [...match[1].matchAll(/:\s*'([^']+)'/g)].map((item) => item[1]);
}

function extractExercises(source) {
  const match = source.match(/export const exercises: Exercise\[\] = \[([\s\S]*?)\n\];/);
  if (!match) {
    throw new Error('Could not find exercises array in src/data/exercises.ts');
  }

  return vm.runInNewContext(`[${match[1]}]`, Object.freeze({}), { timeout: 1000 });
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function sortByOrder(values, order) {
  const indexByValue = new Map(order.map((value, index) => [value, index]));
  return [...values].sort((a, b) => (indexByValue.get(a) ?? 999) - (indexByValue.get(b) ?? 999) || a.localeCompare(b));
}

function auditBodyArea(bodyArea) {
  if (bodyArea === 'shoulder' || bodyArea === 'hip') return 'shoulder_hip';
  return bodyArea;
}

function allExerciseEquipment(exercise) {
  return uniq([
    ...(exercise.equipment ?? []),
    ...(exercise.requiredEquipment ?? []),
    ...(exercise.optionalEquipment ?? []),
    ...(exercise.progressionEquipment ?? []),
  ]);
}

// Mirrors the minimal equipment logic from src/utils/exerciseModel.ts.
// This keeps the audit aligned with live filter compatibility without importing app code.
function getRequiredEquipment(exercise) {
  if (exercise.requiredEquipment) return exercise.requiredEquipment;
  if (exercise.progressionEquipment || exercise.optionalEquipment) {
    const optional = new Set([...(exercise.optionalEquipment ?? []), ...(exercise.progressionEquipment ?? [])]);
    return exercise.equipment.filter((item) => !optional.has(item));
  }
  return exercise.equipment;
}

function isCompatibleWithSelectedEquipment(exercise, selectedEquipment) {
  return getRequiredEquipment(exercise).every((item) => {
    if (item === 'bodyweight') return true;
    if (item === selectedEquipment) return true;
    return selectedEquipment === 'bodyweight' && supportOnlyEquipment.includes(item);
  });
}

function displayList(values) {
  return values.length > 0 ? values.join(', ') : 'None';
}

function table(headers, rows) {
  const escapeCell = (value) => String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, '<br>');

  return [
    `| ${headers.map(escapeCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n');
}

function countBy(items, predicate) {
  return items.filter(predicate).length;
}

function duplicateValues(values) {
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function getGitShortSha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const typesSource = readSource(sourceFiles.types);
const exercisesSource = readSource(sourceFiles.exercises);
const equipmentOptionsSource = readSource(sourceFiles.equipmentOptions);
const exercisesPageSource = readSource(sourceFiles.exercisesPage);
const exerciseFilterSource = readSource(sourceFiles.exerciseFilter);
const exerciseModelSource = readSource(sourceFiles.exerciseModel);
const recommendationEngineSource = readSource(sourceFiles.recommendationEngine);
const logServiceSource = readSource(sourceFiles.logService);

const appBodyAreas = extractConstStringArray(typesSource, 'BODY_AREAS');
const appTypes = extractConstStringArray(typesSource, 'EXERCISE_TYPES');
const appLevels = extractConstStringArray(typesSource, 'EXERCISE_LEVELS');
const canonicalEquipment = extractEquipmentIds(typesSource);
const equipmentOptionIds = [...equipmentOptionsSource.matchAll(/\{\s*id:\s*EQUIPMENT_IDS\.([A-Z_]+)/g)].map((match) => {
  const key = match[1];
  const idMatch = typesSource.match(new RegExp(`${key}:\\s*'([^']+)'`));
  return idMatch?.[1];
}).filter(Boolean);
const exercises = extractExercises(exercisesSource);

const inventoryRows = exercises.map((exercise) => [
  exercise.title,
  exercise.id,
  auditBodyArea(exercise.bodyArea),
  exercise.type,
  exercise.level,
  displayList(allExerciseEquipment(exercise)),
]);

const exercisesByAuditArea = new Map(auditBodyAreas.map((bodyArea) => [
  bodyArea,
  exercises.filter((exercise) => auditBodyArea(exercise.bodyArea) === bodyArea),
]));

const difficultyRows = auditBodyAreas.map((bodyArea) => {
  const areaExercises = exercisesByAuditArea.get(bodyArea) ?? [];
  return [
    bodyArea,
    countBy(areaExercises, (exercise) => exercise.level === 'beginner'),
    countBy(areaExercises, (exercise) => exercise.level === 'intermediate'),
    countBy(areaExercises, (exercise) => exercise.level === 'advanced'),
  ];
});

const equipmentRows = canonicalEquipment.map((equipment) => {
  const matching = exercises.filter((exercise) => allExerciseEquipment(exercise).includes(equipment));
  const areasCovered = sortByOrder(uniq(matching.map((exercise) => auditBodyArea(exercise.bodyArea))), auditBodyAreas);
  const emptyLevels = requiredLevels.filter((level) => !matching.some((exercise) => exercise.level === level));

  return [
    equipment,
    matching.length,
    displayList(areasCovered),
    displayList(emptyLevels),
  ];
});

const typeRows = requiredTypes.map((type) => {
  const matching = exercises.filter((exercise) => exercise.type === type);
  const areasCovered = sortByOrder(uniq(matching.map((exercise) => auditBodyArea(exercise.bodyArea))), auditBodyAreas);

  return [
    type,
    matching.length,
    displayList(areasCovered),
  ];
});

const rawEmptyCombinationRows = [];
const appEmptyCombinationRows = [];
for (const bodyArea of auditBodyAreas) {
  const areaExercises = exercisesByAuditArea.get(bodyArea) ?? [];
  for (const level of requiredLevels) {
    for (const equipment of canonicalEquipment) {
      const rawMatches = areaExercises.filter((exercise) => {
        return exercise.level === level && allExerciseEquipment(exercise).includes(equipment);
      });
      const appMatches = areaExercises.filter((exercise) => {
        return exercise.level === level && isCompatibleWithSelectedEquipment(exercise, equipment);
      });

      if (rawMatches.length === 0) {
        rawEmptyCombinationRows.push([
          bodyArea,
          level,
          equipment,
          '0 raw equipment-field matches',
          'Raw data coverage only. Do not use as live UI dead-end evidence.',
        ]);
      }

      if (appMatches.length === 0) {
        appEmptyCombinationRows.push([
          bodyArea,
          level,
          equipment,
          '0 exercises',
          level === 'advanced'
            ? 'Content gap: add reviewed advanced option only if safety guardrails are explicit.'
            : 'Content gap or filter availability issue: consider count-aware filter guidance before adding content.',
        ]);
      }
    }
  }
}

const nonCanonicalBodyAreas = uniq(exercises.map((exercise) => exercise.bodyArea).filter((value) => !appBodyAreas.includes(value)));
const nonCanonicalTypes = uniq(exercises.map((exercise) => exercise.type).filter((value) => !appTypes.includes(value)));
const nonCanonicalLevels = uniq(exercises.map((exercise) => exercise.level).filter((value) => !appLevels.includes(value)));
const nonCanonicalEquipment = uniq(exercises.flatMap(allExerciseEquipment).filter((value) => !canonicalEquipment.includes(value)));
const equipmentOptionGaps = canonicalEquipment.filter((equipment) => !equipmentOptionIds.includes(equipment));
const zeroExerciseEquipment = canonicalEquipment.filter((equipment) => {
  return !exercises.some((exercise) => allExerciseEquipment(exercise).includes(equipment));
});
const zeroLevelByAreaRows = difficultyRows.flatMap(([bodyArea, beginner, intermediate, advanced]) => {
  return [
    ['beginner', beginner],
    ['intermediate', intermediate],
    ['advanced', advanced],
  ]
    .filter(([, count]) => Number(count) === 0)
    .map(([level]) => [bodyArea, level]);
});
const duplicateIds = duplicateValues(exercises.map((exercise) => exercise.id));
const duplicateTitles = duplicateValues(exercises.map((exercise) => exercise.title));
const missingSafetyMetadata = {
  cautions: exercises.filter((exercise) => !exercise.cautions || exercise.cautions.length === 0),
  stopRules: exercises.filter((exercise) => !exercise.stopRules || exercise.stopRules.length === 0),
  regressions: exercises.filter((exercise) => !exercise.regressions || exercise.regressions.length === 0),
  progressions: exercises.filter((exercise) => !exercise.progressions || exercise.progressions.length === 0),
};
const missingRequiredEquipment = exercises.filter((exercise) => !exercise.requiredEquipment || exercise.requiredEquipment.length === 0);

const emptyStateChecks = [
  {
    scenario: 'No assessment + Recommended mode + all body areas',
    handled: exercisesPageSource.includes('filters.mode === \'recommended\' && !assessment && filters.bodyArea === \'all\'') &&
      exercisesPageSource.includes('exercises.chooseBodyArea'),
    evidence: 'ExercisesPage returns [] and uses exercises.chooseBodyArea.',
  },
  {
    scenario: 'Pain >= 6',
    handled: exercisesPageSource.includes('shouldStopForPain') &&
      exercisesPageSource.includes('exercises.painStopEmpty') &&
      recommendationEngineSource.includes('shouldStopForPain(pain)'),
    evidence: 'ExercisesPage shows painStopEmpty and recommendationEngine returns [] at stop threshold.',
  },
  {
    scenario: 'Equipment filters too narrow',
    handled: exercisesPageSource.includes('exercises.equipmentTooNarrowEmpty'),
    evidence: 'ExercisesPage uses equipmentTooNarrowEmpty when filtered results are empty.',
  },
  {
    scenario: 'Recovery mode has no match',
    handled: exercisesPageSource.includes('exercises.recoveryNoMatchEmpty'),
    evidence: 'ExercisesPage uses recoveryNoMatchEmpty for recovery recommendation misses.',
  },
  {
    scenario: 'Mobile filter fatigue',
    handled: exerciseFilterSource.includes('advancedOpen') &&
      exerciseFilterSource.includes('summaryChips') &&
      exerciseFilterSource.includes('activeFilters'),
    evidence: 'ExerciseFilter keeps advanced filters collapsed and renders active summary chips.',
  },
];

const dataQualityFindings = [
  [
    'Duplicate exercise IDs',
    sourceFiles.exercises,
    displayList(duplicateIds),
    duplicateIds.length > 0 ? 'P1' : 'P2',
    duplicateIds.length > 0 ? 'IDs must be unique before adding content.' : 'No action needed.',
  ],
  [
    'Duplicate exercise titles',
    sourceFiles.exercises,
    displayList(duplicateTitles),
    duplicateTitles.length > 0 ? 'P2' : 'P2',
    duplicateTitles.length > 0 ? 'Review whether duplicate titles are intentional.' : 'No action needed.',
  ],
  ...Object.entries(missingSafetyMetadata).map(([field, missing]) => [
    `Missing safety metadata: ${field}`,
    sourceFiles.exercises,
    missing.length > 0 ? `${missing.length} exercises: ${missing.slice(0, 6).map((exercise) => exercise.id).join(', ')}${missing.length > 6 ? ', ...' : ''}` : 'None',
    missing.length > 0 ? 'P1' : 'P2',
    missing.length > 0 ? `Add reviewed ${field} before content expansion or recommendation broadening.` : 'No action needed.',
  ]),
  [
    'Missing requiredEquipment metadata',
    sourceFiles.exercises,
    missingRequiredEquipment.length > 0 ? `${missingRequiredEquipment.length} exercises: ${missingRequiredEquipment.slice(0, 6).map((exercise) => exercise.id).join(', ')}${missingRequiredEquipment.length > 6 ? ', ...' : ''}` : 'None',
    missingRequiredEquipment.length > 0 ? 'P2' : 'P2',
    missingRequiredEquipment.length > 0 ? 'Backfill requiredEquipment when touching exercise data; current app has fallback inference.' : 'No action needed.',
  ],
  ...zeroExerciseEquipment.map((equipment) => [
    'Canonical equipment has no exercise coverage',
    sourceFiles.equipmentOptions,
    equipment,
    'P1',
    'Keep the option hidden/clearly empty until reviewed content exists, or add reviewed safe content later.',
  ]),
  ...zeroLevelByAreaRows.map(([bodyArea, level]) => [
    'Difficulty level has zero coverage for body area',
    sourceFiles.exercises,
    `${bodyArea} + ${level}`,
    'P1',
    'Add reviewed content later or make filter counts visible so users do not select dead ends.',
  ]),
  [
    'User-facing audit dimension shoulder_hip is not an app enum value',
    `${sourceFiles.types}; ${sourceFiles.logService}`,
    `App BODY_AREAS=${appBodyAreas.join(', ')}; log migration maps shoulder_hip to shoulder: ${logServiceSource.includes('shoulder_hip')}`,
    'P1',
    'Clarify copy/model naming before changing behavior; this report groups shoulder and hip as shoulder_hip for audit only.',
  ],
  [
    'Non-canonical bodyArea values in exercises',
    sourceFiles.exercises,
    displayList(nonCanonicalBodyAreas),
    nonCanonicalBodyAreas.length > 0 ? 'P1' : 'P2',
    nonCanonicalBodyAreas.length > 0 ? 'Normalize exercise data to BODY_AREAS.' : 'No action needed.',
  ],
  [
    'Non-canonical type values in exercises',
    sourceFiles.exercises,
    displayList(nonCanonicalTypes),
    nonCanonicalTypes.length > 0 ? 'P1' : 'P2',
    nonCanonicalTypes.length > 0 ? 'Normalize exercise data to EXERCISE_TYPES.' : 'No action needed.',
  ],
  [
    'Non-canonical level values in exercises',
    sourceFiles.exercises,
    displayList(nonCanonicalLevels),
    nonCanonicalLevels.length > 0 ? 'P1' : 'P2',
    nonCanonicalLevels.length > 0 ? 'Normalize exercise data to EXERCISE_LEVELS.' : 'No action needed.',
  ],
  [
    'Non-canonical equipment values in exercises',
    sourceFiles.exercises,
    displayList(nonCanonicalEquipment),
    nonCanonicalEquipment.length > 0 ? 'P1' : 'P2',
    nonCanonicalEquipment.length > 0 ? 'Normalize equipment fields to EQUIPMENT_IDS.' : 'No action needed.',
  ],
  [
    'Equipment option ids not represented in EQUIPMENT_OPTIONS',
    sourceFiles.equipmentOptions,
    displayList(equipmentOptionGaps),
    equipmentOptionGaps.length > 0 ? 'P1' : 'P2',
    equipmentOptionGaps.length > 0 ? 'Add missing equipment option metadata.' : 'No action needed.',
  ],
];

const rootCauseRows = [
  [
    'Some equipment/difficulty selections produce no matching exercise.',
    'Yes',
    'No current evidence',
    'Potentially, if fallback crosses user intent later',
    'No',
    `${appEmptyCombinationRows.length} app-realistic empty bodyArea + difficulty + equipment combinations; ${rawEmptyCombinationRows.length} raw equipment-field gaps.`,
  ],
  [
    'Canonical foam_roller option has zero total exercise coverage.',
    'Yes',
    'No current evidence',
    'No current evidence',
    'Potentially',
    'foam_roller appears in EQUIPMENT_IDS/EQUIPMENT_OPTIONS and has 0 exercises.',
  ],
  [
    'Advanced coverage is sparse and absent outside ankle.',
    'Yes',
    'No current evidence',
    'No current evidence',
    'Potentially',
    displayList(zeroLevelByAreaRows.filter(([, level]) => level === 'advanced').map(([bodyArea]) => bodyArea)),
  ],
  [
    '「為我推薦」 may be unclear to users.',
    'No',
    'No current evidence',
    'No current evidence',
    'Yes',
    'Mode label exists, but the visible copy does not explain inputs used: assessment, equipment, pain, and logs.',
  ],
  [
    'Empty states are present for major filter miss cases.',
    'No',
    'No current evidence',
    'No current evidence',
    'No',
    emptyStateChecks.map((check) => `${check.scenario}: ${check.handled ? 'handled' : 'missing'}`).join('; '),
  ],
];

const safetyRows = [
  [
    'Adding content to fill knee advanced gaps',
    'Unsafe defaults could introduce deep squat, jumping, or running.',
    'P0 if implemented without guardrails',
    'Keep knee defaults low-impact; require explicit safety metadata, support notes, stop rules, and no pain-threshold changes.',
  ],
  [
    'Adding ankle balance/proprioception content',
    'Unsupported balance drills can increase fall risk.',
    'P0 if unsupported balance is recommended',
    'Chair or wall support must remain explicit; unsupported_balance must stay excluded from conservative recommendations.',
  ],
  [
    'Adding shoulder/neck advanced or loaded content',
    'Aggressive overhead loading can worsen symptoms for some users.',
    'P0 if recommended by default',
    'Keep advanced/loading out of beginner defaults; use progressionEquipment and avoidIfPainHigh.',
  ],
  [
    'Pain >= 6 assessment',
    'Training recommendations could be unsafe if stop threshold is bypassed.',
    'P0',
    'Existing recommendationEngine returns [] and ExercisesPage shows stop-training copy; keep unchanged.',
  ],
  [
    'Recovery mode pain > 3',
    'Advanced or painful progressions could be suggested during recovery.',
    'P0 if guardrails regress',
    'Existing recovery path limits to beginner support-only exercises; keep unchanged.',
  ],
];

const mobileUxRows = [
  [
    'User sees 「為我推薦」 without knowing why',
    'Lower trust and lower comprehension.',
    'P1',
    'Add concise helper copy or rename to explain that recommendations use assessment, pain, equipment, and recent logs.',
  ],
  [
    'Equipment filter includes options with zero or sparse coverage',
    'Users hit dead ends and assume the app is broken.',
    'P1',
    'Show result counts, disable zero-count chips, or move sparse equipment behind progressive disclosure.',
  ],
  [
    'Advanced difficulty selected for body areas with no content',
    'Filter feels broken and blocks personalization.',
    'P1',
    'Add count-aware chips or body-area-specific disabled states before adding content.',
  ],
  [
    'Many empty combinations exist',
    'Mobile users may spend too much effort trial-and-error filtering.',
    'P1',
    'Prioritize compact active chips and clear one-tap reset; keep advanced filters collapsed.',
  ],
  [
    'Safety copy competes with filter copy',
    'Critical warnings can be missed if the page is too text dense.',
    'P2',
    'Keep pain stop and cautions visible; move non-critical explanations behind progressive disclosure.',
  ],
];

const topGaps = [
  'shoulder_neck has 0 intermediate and 0 advanced exercises.',
  `foam_roller has 0 total exercise coverage.`,
  `Advanced coverage is missing for ${displayList(zeroLevelByAreaRows.filter(([, level]) => level === 'advanced').map(([bodyArea]) => bodyArea))}; overall, ${appEmptyCombinationRows.length} app-realistic bodyArea + difficulty + equipment combinations have 0 matching exercises.`,
  '「為我推薦」/Recommended for me is a copy and explanation issue, not current evidence of recommendation logic failure.',
  'shoulder_hip is a user/audit mental model while the app stores shoulder and hip separately, which may confuse copy and reporting.',
];

const report = `# Exercise Coverage Audit

Generated: ${new Date().toISOString()}

Source commit: ${getGitShortSha()}

Scope: audit only. This report does not add exercise content, change recommendation behavior, change pain thresholds, or bypass SafetyGate.

## 1. Executive summary

- Total exercises audited: ${exercises.length}
- Audit body areas: ${auditBodyAreas.join(', ')}
- App body area enums: ${appBodyAreas.join(', ')}
- Canonical equipment ids: ${canonicalEquipment.join(', ')}
- Raw equipment-field bodyArea + difficulty + equipment gaps: ${rawEmptyCombinationRows.length}
- App-realistic filter dead-end combinations: ${appEmptyCombinationRows.length}
- Canonical equipment with 0 exercises: ${displayList(zeroExerciseEquipment)}
- Non-canonical exercise bodyArea values: ${displayList(nonCanonicalBodyAreas)}
- Non-canonical exercise type values: ${displayList(nonCanonicalTypes)}
- Non-canonical exercise equipment values: ${displayList(nonCanonicalEquipment)}

Top 5 gaps:

${topGaps.map((gap, index) => `${index + 1}. ${gap}`).join('\n')}

## 2. Exercise inventory table

${table(['Exercise', 'ID', 'Body Area', 'Type', 'Difficulty', 'Equipment'], inventoryRows)}

## 3. Difficulty coverage table

${table(['Body Area', 'Beginner', 'Intermediate', 'Advanced'], difficultyRows)}

## 4. Equipment coverage table

${table(['Equipment', '# Exercises', 'Body Areas Covered', 'Empty Levels'], equipmentRows)}

## 5. Type coverage table

${table(['Type', 'Count', 'Body Areas Covered'], typeRows)}

## 6. Empty combinations table

This section models live filter compatibility, including bodyweight-required exercises and bodyweight fallback for support-only chair/wall exercises, following the minimal logic in src/utils/exerciseModel.ts. The raw equipment-field gap count is ${rawEmptyCombinationRows.length}, but it should not be used as live UI dead-end evidence.

${table(['Body Area', 'Difficulty', 'Equipment', 'Result', 'Suggested Action'], appEmptyCombinationRows)}

## 7. Data quality findings

${table(['Issue', 'File', 'Example', 'Severity', 'Suggested Fix'], dataQualityFindings)}

## 8. Root-cause classification

${table(['Finding', 'Content Gap', 'Filter Bug', 'Recommendation Bug', 'Copy/UX Issue', 'Evidence'], rootCauseRows)}

## 9. Safety implications

${table(['Scenario', 'Safety Risk', 'Severity', 'Required Guardrail'], safetyRows)}

## 10. Mobile UX implications

${table(['Scenario', 'User Impact', 'Severity', 'Suggested UX'], mobileUxRows)}

## Empty-state handling observed

${table(['Scenario', 'Handled in UI', 'Evidence'], emptyStateChecks.map((check) => [
  check.scenario,
  check.handled ? 'Yes' : 'No',
  check.evidence,
]))}

## Methodology and limitations

- Raw equipment-field coverage counts only whether an equipment id appears on an exercise.
- App-realistic filter dead ends model the live compatibility rules from src/utils/exerciseModel.ts: required bodyweight is compatible with any equipment selection, and selecting bodyweight can satisfy support-only chair/wall requirements.
- Empty-state checks confirm code references, not runtime i18n resolution.
- This audit does not verify actual rendered UI.
- This audit does not validate safety metadata completeness beyond presence/absence checks.
- This audit does not add or recommend random exercises.
- Content additions require rehab safety review.

## Next-step recommendations

1. Clarify the 「為我推薦」 label with short helper copy before changing recommendation behavior.
2. Add count-aware filter states so mobile users can see unavailable equipment/difficulty combinations before selecting them.
3. Prioritize reviewed beginner/intermediate content for empty equipment/body-area gaps before adding advanced exercises.
4. Keep advanced, loaded, balance, and knee-flexion content out of default recommendations unless safety metadata is explicit.
5. Decide whether product copy should continue grouping shoulder + hip as shoulder_hip or expose shoulder and hip separately.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Exercise coverage audit generated: ${path.relative(rootDir, outputPath)}`);
console.log(`Exercises audited: ${exercises.length}`);
console.log(`Raw equipment-field empty combinations: ${rawEmptyCombinationRows.length}`);
console.log(`App-realistic empty combinations: ${appEmptyCombinationRows.length}`);
console.log(`Zero-coverage equipment: ${displayList(zeroExerciseEquipment)}`);
