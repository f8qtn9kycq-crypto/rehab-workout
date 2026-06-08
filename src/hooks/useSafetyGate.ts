import { useState } from 'react';
import {
  canEnterSession,
  getSafetyStatus,
  isSafetyGateCurrentForToday,
  saveSafetyStatus,
  type SafetyStatus,
} from '../utils/safety';

export function useSafetyGate() {
  const [status, setStatus] = useState<SafetyStatus>(() => getSafetyStatus());

  function completeSafetyGate(redFlags: string[]): SafetyStatus {
    const nextStatus = saveSafetyStatus({ redFlags });
    setStatus(nextStatus);
    return nextStatus;
  }

  return {
    status,
    completeSafetyGate,
    isCurrentForToday: isSafetyGateCurrentForToday(status),
    canEnterSession: canEnterSession(status),
  };
}
