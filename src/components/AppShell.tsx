import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import DesktopNav from './DesktopNav';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell() {
  const location = useLocation();
  const { language, setLanguage, t } = useI18n();
  const nextLanguage = language === 'zh-TW' ? 'en' : 'zh-TW';

  return (
    <div className="min-h-screen overflow-x-clip">
      <DesktopNav />
      <div className="safe-top fixed right-3 top-3 z-50 min-[769px]:right-5 min-[769px]:top-4">
        <button
          type="button"
          onClick={() => setLanguage(nextLanguage)}
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white/95 px-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur"
          aria-label={t('app.languageLabel')}
        >
          {language === 'zh-TW' ? t('app.english') : t('app.chinese')}
        </button>
      </div>
      <main id="main-content" className="min-w-0">
        <Outlet />
      </main>
      <MobileBottomNav currentPath={location.pathname} />
    </div>
  );
}
