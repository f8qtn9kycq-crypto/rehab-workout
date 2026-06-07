import { Activity, BookOpen, ClipboardCheck, Home, ListChecks, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../services/i18n';

const items = [
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/safety', labelKey: 'nav.safety', icon: ShieldCheck },
  { to: '/assessment', labelKey: 'nav.assessment', icon: ClipboardCheck },
  { to: '/exercises', labelKey: 'nav.exercises', icon: Activity },
  { to: '/logs', labelKey: 'nav.logs', icon: ListChecks },
  { to: '/education', labelKey: 'nav.education', icon: BookOpen },
];

export default function DesktopNav() {
  const { t } = useI18n();

  return (
    <header className="safe-top sticky top-0 z-30 hidden border-b border-slate-200 bg-white/92 backdrop-blur md:block">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <NavLink to="/" className="focus-ring inline-flex min-h-11 items-center rounded-md text-xl font-bold text-ink">
          {t('app.brand')}
        </NavLink>
        <div className="mr-20 flex items-center gap-1">
          {items.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `focus-ring flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold ${
                  isActive ? 'bg-calm-100 text-calm-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {t(labelKey)}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
