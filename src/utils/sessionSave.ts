export interface SessionSaveLock {
  current: boolean;
}

export type SessionSaveResult = 'saved' | 'duplicate' | 'failed';

export function persistSessionLogOnce<T>(
  lock: SessionSaveLock,
  log: T,
  persist: (value: T) => boolean,
): SessionSaveResult {
  if (lock.current) return 'duplicate';
  lock.current = true;

  if (!persist(log)) {
    lock.current = false;
    return 'failed';
  }

  return 'saved';
}
