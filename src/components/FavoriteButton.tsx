import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useI18n } from '../services/i18n';
import { readFavorites, toggleFavorite } from '../services/favoriteStorage';
export default function FavoriteButton({ id, title }: { id: string; title: string }) {
  const { t } = useI18n();
  const [state, setState] = useState(readFavorites);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const refresh = () => setState(readFavorites());
    window.addEventListener('rehab:favorites', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('rehab:favorites', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const active = state.ids.includes(id);
  return <div className="mt-2">
    <button type="button" disabled={state.error} aria-pressed={active} aria-label={`${t(active ? 'favorites.remove' : 'favorites.add')}: ${title}`} onClick={() => setFailed(!toggleFavorite(id))} className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-calm-800">
      <Star size={16} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />{t(active ? 'favorites.saved' : 'favorites.add')}
    </button>
    {(failed || state.error) && <p role="alert" className="mt-1 text-sm text-red-800">{t('favorites.error')}</p>}
  </div>;
}
