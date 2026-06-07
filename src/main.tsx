import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import SafetyRouteGuard from './components/SafetyRouteGuard';
import AssessmentPage from './pages/AssessmentPage';
import EducationPage from './pages/EducationPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import ExercisesPage from './pages/ExercisesPage';
import HomePage from './pages/HomePage';
import LogsPage from './pages/LogsPage';
import OnboardingPage from './pages/OnboardingPage';
import SafetyPage from './pages/SafetyPage';
import SessionPage from './pages/SessionPage';
import { I18nProvider } from './services/i18n';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route element={<SafetyRouteGuard />}>
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/exercise/:exerciseId" element={<ExerciseDetailPage />} />
              <Route path="/session/:exerciseId" element={<SessionPage />} />
            </Route>
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>,
);
