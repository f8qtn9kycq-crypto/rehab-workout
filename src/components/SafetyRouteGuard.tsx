import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSafetyStatus } from '../utils/safety';

export default function SafetyRouteGuard() {
  const location = useLocation();
  const safety = getSafetyStatus();

  if (!safety.completed) {
    return <Navigate to="/safety" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (safety.blocked) {
    return <Navigate to="/safety" replace />;
  }

  return <Outlet />;
}
