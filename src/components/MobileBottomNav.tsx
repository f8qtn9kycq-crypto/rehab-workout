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

export default function MobileBottomNav({ currentPath }: { currentPath: string }) {
  const { t } = useI18n();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/96 backdrop-blur md:hidden">
      <div className="grid grid-cols-6 px-1 pt-1">
        {items.map(({ to, labelKey, icon: Icon }) => {
          const active = currentPath === to || (to !== '/' && currentPath.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`focus-ring flex min-h-[58px] flex-col items-center justify-center rounded-md text-[12px] font-semibold ${
                active ? 'text-calm-700' : 'text-slate-500'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span>{t(labelKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
