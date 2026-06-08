import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { canEnterSession, getSafetyStatus, isSafetyGateCurrentForToday } from '../utils/safety';

export default function SafetyRouteGuard() {
  const location = useLocation();
  const safety = getSafetyStatus();

  if (!isSafetyGateCurrentForToday(safety)) {
    return <Navigate to="/safety" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!canEnterSession(safety)) {
    return <Navigate to="/safety" replace />;
  }

  return <Outlet />;
}
