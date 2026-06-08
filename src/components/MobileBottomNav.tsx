import { Activity, BookOpen, ClipboardCheck, Home, ListChecks, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../services/i18n';

const primaryItems = [
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/safety', labelKey: 'nav.safety', icon: ShieldCheck },
  { to: '/exercises', labelKey: 'nav.exercises', icon: Activity },
  { to: '/logs', labelKey: 'nav.logs', icon: ListChecks },
];

const secondaryItems = [
  { to: '/assessment', labelKey: 'nav.assessment', icon: ClipboardCheck },
  { to: '/education', labelKey: 'nav.education', icon: BookOpen },
];

export default function MobileBottomNav({ currentPath }: { currentPath: string }) {
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = secondaryItems.some(({ to }) => currentPath === to || currentPath.startsWith(to));

  function isActive(to: string): boolean {
    return currentPath === to || (to !== '/' && currentPath.startsWith(to));
  }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/96 backdrop-blur md:hidden">
      {moreOpen ? (
        <div id="mobile-more-nav" className="border-b border-slate-200 px-3 py-3">
          <div className="grid grid-cols-2 gap-2">
            {secondaryItems.map(({ to, labelKey, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                className={`focus-ring flex min-h-12 items-center justify-center gap-2 rounded-md text-sm font-bold ${
                  isActive(to) ? 'bg-calm-100 text-calm-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon size={20} />
                <span>{t(labelKey)}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-5 px-1 pt-1">
        {primaryItems.map(({ to, labelKey, icon: Icon }) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMoreOpen(false)}
              className={`focus-ring flex min-h-[58px] flex-col items-center justify-center rounded-md text-[12px] font-semibold ${
                active ? 'text-calm-700' : 'text-slate-500'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span>{t(labelKey)}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          aria-controls="mobile-more-nav"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className={`focus-ring flex min-h-[58px] flex-col items-center justify-center rounded-md text-[12px] font-semibold ${
            moreActive || moreOpen ? 'text-calm-700' : 'text-slate-500'
          }`}
        >
          {moreOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={moreActive ? 2.5 : 2} />}
          <span>{t('nav.more')}</span>
        </button>
      </div>
    </nav>
  );
}
