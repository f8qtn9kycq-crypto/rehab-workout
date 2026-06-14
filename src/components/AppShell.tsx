import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import DesktopNav from './DesktopNav';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell() {
  const location = useLocation();
  const { language, setLanguage } = useI18n();

  return (
    <div className="min-h-screen overflow-x-clip">
      <DesktopNav />
      <div className="safe-top fixed right-3 top-3 z-50 min-[769px]:right-5 min-[769px]:top-4">
        <div className="inline-grid grid-cols-2 gap-1 rounded-md border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur" role="group" aria-label="Language">
          <button
            type="button"
            onClick={() => setLanguage('zh-TW')}
            className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm font-black ${
              language === 'zh-TW'
                ? 'border-2 border-calm-900 bg-calm-700 text-white'
                : 'border border-slate-200 bg-white text-slate-700'
            }`}
            aria-label="切換到繁體中文"
            aria-pressed={language === 'zh-TW'}
          >
            TW
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm font-black ${
              language === 'en'
                ? 'border-2 border-calm-900 bg-calm-700 text-white'
                : 'border border-slate-200 bg-white text-slate-700'
            }`}
            aria-label="Switch to English"
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
