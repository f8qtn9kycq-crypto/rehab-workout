const APP_STORAGE_KEYS = [
  'rehab.trainingLogs.v1',
  'rehab.functionalOutcomes.v1',
  'rehab.safetyGate.v1',
  'rehab.onboardingSeen.v1',
  'rehab.assessment.v1',
  'rehab.language.v1',
] as const;

export type AppStorageKey = (typeof APP_STORAGE_KEYS)[number];

export interface ClearLocalDataResult {
  clearedKeys: AppStorageKey[];
  failedKeys: AppStorageKey[];
}

export function getAppStorageKeys(): AppStorageKey[] {
  return [...APP_STORAGE_KEYS];
}

export function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeReadJson<T>(key: string, fallback: T): T {
  const raw = safeGetItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function clearRehabLocalData(): ClearLocalDataResult {
  return getAppStorageKeys().reduce<ClearLocalDataResult>(
    (result, key) => {
      if (safeRemoveItem(key)) {
        result.clearedKeys.push(key);
      } else {
        result.failedKeys.push(key);
      }

      return result;
    },
    { clearedKeys: [], failedKeys: [] },
  );
}
