import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import DesktopNav from './DesktopNav';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell() {
  const location = useLocation();
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="min-h-screen overflow-x-clip">
      <DesktopNav />
      <div className="safe-top fixed right-3 top-3 z-50 min-[769px]:right-5 min-[769px]:top-4">
        <div className="inline-grid grid-cols-2 gap-0.5 rounded-full border border-slate-200 bg-white/80 p-0.5 shadow-sm backdrop-blur" role="group" aria-label={t('app.languageGroup')}>
          <button
            type="button"
            onClick={() => setLanguage('zh-TW')}
            className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-xs font-bold ${
              language === 'zh-TW'
                ? 'bg-calm-700 text-white'
                : 'text-slate-600'
            }`}
            aria-label={t('app.switchToChinese')}
            aria-pressed={language === 'zh-TW'}
          >
            TW
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-xs font-bold ${
              language === 'en'
                ? 'bg-calm-700 text-white'
                : 'text-slate-600'
            }`}
            aria-label={t('app.switchToEnglish')}
            aria-pressed={language === 'en'}
          >
            EN
          </button>
        </div>
      </div>
      <main id="main-content" className="min-w-0">
        <Outlet />
      </main>
      <MobileBottomNav currentPath={location.pathname} />
    </div>
  );
}
