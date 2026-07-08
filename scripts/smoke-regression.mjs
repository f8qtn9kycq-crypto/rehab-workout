#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

const files = {
  main: 'src/main.tsx',
  styles: 'src/styles.css',
  safetyRouteGuard: 'src/components/SafetyRouteGuard.tsx',
  safetyGate: 'src/components/SafetyGate.tsx',
  redFlagChecklist: 'src/components/RedFlagChecklist.tsx',
  safetyUtils: 'src/utils/safety.ts',
  painRules: 'src/utils/painRules.ts',
  sessionTracker: 'src/components/SessionTracker.tsx',
  sessionPage: 'src/pages/SessionPage.tsx',
  logService: 'src/services/logService.ts',
  outcomeStorage: 'src/services/outcomeStorage.ts',
  assessmentStorage: 'src/services/assessmentStorage.ts',
  localStorageService: 'src/services/localStorageService.ts',
  logsPage: 'src/pages/LogsPage.tsx',
  progressSummary: 'src/utils/progressSummary.ts',
  progressSummaryComponent: 'src/components/ProgressSummary.tsx',
  functionalOutcomeCheckIn: 'src/components/FunctionalOutcomeCheckIn.tsx',
  trainingLog: 'src/components/TrainingLog.tsx',
  localizedExercise: 'src/utils/localizedExercise.ts',
  homePage: 'src/pages/HomePage.tsx',
  onboardingFlow: 'src/components/OnboardingFlow.tsx',
  weeklyRoutineBuilder: 'src/components/WeeklyRoutineBuilder.tsx',
  educationPage: 'src/pages/EducationPage.tsx',
  localeEn: 'src/locales/en.js',
  localeZh: 'src/locales/zh-TW.js',
  localDataLocale: 'src/locales/localData.js',
  rehabTypes: 'src/types/rehab.ts',
};

function readSource(filePath) {
  return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function assertIncludes(source, value, label) {
  if (!source.includes(value)) {
    fail(`${label}: expected to find ${JSON.stringify(value)}`);
  }
}

function assertMatch(source, pattern, label) {
  if (!pattern.test(source)) {
    fail(`${label}: expected ${pattern}`);
  }
}

function assertFileExists(filePath, label = filePath) {
  if (!fs.existsSync(path.join(rootDir, filePath))) {
    fail(`${label}: missing file`);
  }
}

function section(name, checks) {
  checks();
  console.log(`pass: ${name}`);
}

Object.values(files).forEach((filePath) => assertFileExists(filePath));

const source = Object.fromEntries(
  Object.entries(files).map(([key, filePath]) => [key, readSource(filePath)]),
);

section('app shell and routed pages are present', () => {
  assertIncludes(source.main, 'ReactDOM.createRoot', 'React app boot');
  assertIncludes(source.main, '<BrowserRouter>', 'SPA router');
  assertIncludes(source.main, '<Route path="/" element={<HomePage />} />', 'home route');
  assertIncludes(source.main, '<Route path="/safety" element={<SafetyPage />} />', 'safety route');
  assertIncludes(source.main, '<Route path="/logs" element={<LogsPage />} />', 'logs route');
  assertIncludes(source.main, '<Route path="/education" element={<EducationPage />} />', 'education route');
  assertIncludes(source.main, '<Route path="*" element={<Navigate to="/" replace />} />', 'fallback route');
});

section('SafetyRouteGuard protects assessment, library, detail, and session routes', () => {
  assertIncludes(source.main, '<Route element={<SafetyRouteGuard />}>', 'guard wrapper');
  assertIncludes(source.main, '<Route path="/assessment" element={<AssessmentPage />} />', 'assessment route inside guard');
  assertIncludes(source.main, '<Route path="/exercises" element={<ExercisesPage />} />', 'exercise library route inside guard');
  assertIncludes(source.main, '<Route path="/exercise/:exerciseId" element={<ExerciseDetailPage />} />', 'exercise detail route inside guard');
  assertIncludes(source.main, '<Route path="/session/:exerciseId" element={<SessionPage />} />', 'session route inside guard');
  assertIncludes(source.safetyRouteGuard, 'isSafetyGateCurrentForToday(safety)', 'today safety check');
  assertIncludes(source.safetyRouteGuard, 'canEnterSession(safety)', 'blocked safety check');
  assertIncludes(source.safetyRouteGuard, 'to="/safety"', 'unsafe redirect target');
});

section('red flags still block training and none-of-above stays exclusive', () => {
  assertIncludes(source.safetyUtils, 'blocked: input.redFlags.length > 0', 'red flags block status');
  assertIncludes(source.safetyUtils, 'return isSafetyGateCurrentForToday(status) && !status.blocked', 'blocked status prevents entry');
  assertIncludes(source.safetyGate, 'if (!nextStatus.blocked) navigate(from)', 'blocked safety gate does not navigate forward');
  assertIncludes(source.redFlagChecklist, 'onNoneChange(false)', 'choosing a red flag clears none-of-above');
  assertIncludes(source.redFlagChecklist, 'if (nextSelected) onChange([])', 'choosing none-of-above clears red flags');
});

section('pain rules and required pain inputs are preserved', () => {
  assertIncludes(source.painRules, 'recoveryModeAbove: 3', 'pain >3 recovery threshold');
  assertIncludes(source.painRules, 'blockSessionAt: 6', 'pain >=6 stop threshold');
  assertIncludes(source.painRules, 'afterSessionWarningIncrease: 2', 'pain-after warning delta');
  assertIncludes(source.painRules, 'pain !== null', 'pain zero remains valid');
  assertIncludes(source.sessionTracker, 'useState<number | null>(null)', 'pain state starts unset');
  assertIncludes(source.sessionTracker, 'const painBlocksStart = shouldStopForPain(painBefore)', 'pain-before stop check');
  assertIncludes(source.sessionTracker, 'const canStart = hasPainValue(painBefore) && !painBlocksStart', 'pain-before required to start');
  assertIncludes(source.sessionTracker, 'const canSaveLog = hasPainValue(painBefore) && hasPainValue(painAfter)', 'pain-before and pain-after required to save');
  assertIncludes(source.sessionTracker, 'if (!hasPainValue(painBefore) || !hasPainValue(painAfter)) return', 'save guard requires both pain values');
  assertIncludes(source.sessionTracker, "t('session.painRequiredBefore')", 'pain-before required copy');
  assertIncludes(source.sessionTracker, "t('session.painRequiredAfter')", 'pain-after required copy');
  assertIncludes(source.sessionTracker, 'shouldWarnForPainIncrease(painBefore, painAfter)', 'pain-after increase warning');
});

section('LocalStorage readers fail soft and preserve app keys', () => {
  assertIncludes(source.localStorageService, "'rehab.trainingLogs.v1'", 'training log key preserved');
  assertIncludes(source.localStorageService, "'rehab.functionalOutcomes.v1'", 'outcome key preserved');
  assertIncludes(source.localStorageService, "'rehab.safetyGate.v1'", 'safety key preserved');
  assertIncludes(source.localStorageService, "'rehab.onboardingSeen.v1'", 'onboarding key preserved');
  assertIncludes(source.localStorageService, "'rehab.assessment.v1'", 'assessment key preserved');
  assertIncludes(source.localStorageService, 'safeReadJson', 'safe JSON reader exists');
  assertIncludes(source.localStorageService, 'catch', 'localStorage helper catches browser/storage failures');
  assertIncludes(source.safetyUtils, 'safeReadJson', 'safety status uses safe JSON reader');
  assertIncludes(source.assessmentStorage, 'getSavedAssessment', 'assessment reader is centralized');
  assertIncludes(source.assessmentStorage, 'normalizeAssessment', 'assessment reader normalizes stored data');
});

section('session logs persist with required fields and refresh-safe readers', () => {
  assertIncludes(source.logService, "const LOG_KEY = 'rehab.trainingLogs.v1'", 'training log storage key');
  assertIncludes(source.logService, 'safeReadJson<unknown>(LOG_KEY, [])', 'read logs through safe storage helper');
  assertIncludes(source.logService, 'safeSetItem(LOG_KEY, JSON.stringify(logs))', 'write logs through safe storage helper');
  assertIncludes(source.logService, 'return parsed.map((log) => normalizeLog(log))', 'normalize persisted logs');
  assertIncludes(source.logService, 'isBodyArea', 'invalid log body areas ignored safely');
  assertIncludes(source.logService, 'isExerciseType', 'invalid log types ignored safely');
  assertIncludes(source.logService, 'isExerciseLevel', 'invalid log levels ignored safely');
  [
    'painBefore',
    'painAfter',
    'stoppedEarly',
    'stopReason',
    'recoveryMode',
    'painDelta',
  ].forEach((field) => {
    assertIncludes(source.logService, field, `training log preserves ${field}`);
    assertIncludes(source.rehabTypes, field, `TrainingLogEntry type includes ${field}`);
  });
  assertIncludes(source.sessionTracker, 'saveLog(log)', 'session completion saves log');
  assertIncludes(source.sessionTracker, "navigate('/logs')", 'saved session routes to logs');
});

section('functional outcomes persist and progress renders from stored data', () => {
  assertIncludes(source.outcomeStorage, "const OUTCOME_KEY = 'rehab.functionalOutcomes.v1'", 'outcome storage key');
  assertIncludes(source.outcomeStorage, 'safeReadJson<unknown>(OUTCOME_KEY, [])', 'read outcomes through safe storage helper');
  assertIncludes(source.outcomeStorage, 'safeSetItem(OUTCOME_KEY, JSON.stringify(outcomes))', 'write outcomes through safe storage helper');
  assertIncludes(source.outcomeStorage, 'normalizeOutcome(entry)', 'normalize persisted outcomes');
  assertIncludes(source.logsPage, 'getLogs()', 'logs page reads logs');
  assertIncludes(source.logsPage, 'getOutcomeEntries()', 'logs page reads outcomes');
  assertIncludes(source.logsPage, 'buildWeeklyProgressSummary(logs, outcomes)', 'logs page builds progress summary');
  assertIncludes(source.localizedExercise, 'getLocalizedTrainingLogTitle(', 'localized saved-log title helper exists');
  assertIncludes(source.localizedExercise, 'getExerciseById(log.exerciseId)', 'saved logs localize from stable exercise id');
  assertIncludes(source.logsPage, 'getLocalizedTrainingLogTitle(latestLog, language, fallbackTitle)', 'latest training summary uses localized saved-log title');
  assertIncludes(source.logsPage, '<ProgressSummary summary={summary} />', 'progress summary renders');
  assertIncludes(source.logsPage, '<FunctionalOutcomeCheckIn outcomes={outcomes} onSave={saveOutcome} />', 'outcome check-in renders');
  assertIncludes(source.logsPage, '<TrainingLog logs={logs} />', 'training log renders');
  assertIncludes(source.trainingLog, 'getLocalizedTrainingLogTitle(log, language, fallbackTitle)', 'training history uses localized saved-log title');
});

section('clear local data is explicit and confirmed', () => {
  assertIncludes(source.localStorageService, 'clearRehabLocalData', 'clear local data helper exists');
  assertIncludes(source.logsPage, 'window.confirm', 'clear local data requires confirmation');
  assertIncludes(source.logsPage, 'clearRehabLocalData()', 'clear action calls storage helper');
  assertIncludes(source.logsPage, "t('logs.clearLocalDataConfirm')", 'clear confirmation is localized');
  assertIncludes(source.localDataLocale, 'clearLocalDataTitle', 'clear local data zh-TW/en copy exists');
});


section('first-run onboarding stays focused on safe start basics', () => {
  const englishOnboarding = source.localeEn.match(/onboarding:\s*\{[\s\S]*?\n  \},/)?.[0] ?? '';
  const zhOnboarding = source.localeZh.match(/onboarding:\s*\{[\s\S]*?\n  \},/)?.[0] ?? '';

  assertIncludes(source.onboardingFlow, "t('onboarding.stepsLabel')", 'onboarding step list has accessible label');
  assertIncludes(englishOnboarding, 'Pain before and after', 'English onboarding covers pain before and after');
  assertIncludes(zhOnboarding, '記錄前後疼痛', 'zh-TW onboarding covers pain before and after');
  assertIncludes(englishOnboarding, 'Start suitable exercise', 'English onboarding leads to suitable exercise start');
  assertIncludes(zhOnboarding, '開始合適動作', 'zh-TW onboarding leads to suitable exercise start');
  ['Pick level', 'Log result'].forEach((outdatedStep) => {
    if (englishOnboarding.includes(outdatedStep)) {
      fail(`onboarding should not expose outdated first-run step ${JSON.stringify(outdatedStep)}`);
    }
  });
  ['選擇難度', '記錄結果'].forEach((outdatedStep) => {
    if (zhOnboarding.includes(outdatedStep)) {
      fail(`onboarding should not expose outdated first-run step ${JSON.stringify(outdatedStep)}`);
    }
  });
});

section('routine builder and education pages remain reachable', () => {
  assertIncludes(source.homePage, '<WeeklyRoutineBuilder />', 'home renders weekly routine builder');
  assertIncludes(source.weeklyRoutineBuilder, 'weeklyRoutines', 'routine definitions');
  assertIncludes(source.weeklyRoutineBuilder, "to={`/session/${exercise.id}`}", 'routine starts existing session route');
  assertIncludes(source.weeklyRoutineBuilder, "t('weeklyRoutine.sessionGuardHint')", 'routine includes safety guard hint');
  assertIncludes(source.educationPage, 'educationCards.map', 'education cards render');
  assertIncludes(source.educationPage, 'anklePillars.map', 'education pillars render');
});

section('mobile overflow guardrails exist for 320px and 375px review fallback', () => {
  assertIncludes(source.styles, 'min-width: 320px', 'minimum supported mobile width');
  assertMatch(source.styles, /html\s*\{[\s\S]*overflow-x:\s*clip;/, 'html horizontal overflow clipped');
  assertMatch(source.styles, /body\s*\{[\s\S]*overflow-x:\s*clip;/, 'body horizontal overflow clipped');
  assertMatch(source.styles, /#root\s*\{[\s\S]*overflow-x:\s*clip;/, 'root horizontal overflow clipped');
  assertMatch(source.styles, /\.page\s*\{[\s\S]*overflow-x:\s*clip;/, 'page horizontal overflow clipped');
  assertIncludes(source.styles, '@supports not (overflow-x: clip)', 'overflow-x fallback for older browsers');
  assertIncludes(source.styles, 'overflow-x: hidden', 'hidden overflow fallback');
  assertIncludes(source.styles, 'min-height: 44px', 'touch target baseline');
  assertIncludes(source.styles, 'env(safe-area-inset-bottom)', 'iOS bottom safe area');
});

section('required i18n keys for smoke-covered flows exist', () => {
  [
    'session.painBefore',
    'session.painAfter',
    'session.painRequiredBefore',
    'session.painRequiredAfter',
    'session.painAfterWarning',
    'session.saveLog',
    'safety.blocked',
    'safety.noneOfAbove',
    'logs.title',
    'logs.clearLocalDataTitle',
    'logs.clearLocalDataConfirm',
    'outcomes.title',
    'weeklyRoutine.title',
    'education.title',
  ].forEach((key) => {
    const pathParts = key.split('.');
    const looseKeyPattern = new RegExp(`${pathParts[pathParts.length - 1]}\\s*:`);
    assertMatch(source.localeEn + source.localDataLocale, looseKeyPattern, `English locale has ${key}`);
    assertMatch(source.localeZh + source.localDataLocale, looseKeyPattern, `zh-TW locale has ${key}`);
  });
});

const distIndex = path.join(rootDir, 'dist/index.html');
if (fs.existsSync(distIndex)) {
  section('built app output exists when smoke runs after build', () => {
    const html = fs.readFileSync(distIndex, 'utf8');
    assertIncludes(html, '<div id="root"></div>', 'built HTML root');
    assertMatch(html, /assets\/index-[^"]+\.js/, 'built JS asset');
    assertMatch(html, /assets\/index-[^"]+\.css/, 'built CSS asset');
  });
} else {
  console.log('skip: dist output check; run npm run build before npm run test:smoke to include built app output');
}

console.log('Core flow smoke regression checks passed.');
