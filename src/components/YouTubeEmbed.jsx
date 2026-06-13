import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../services/i18n';
import { isValidYouTubeEmbedUrl, toYouTubeEmbedUrl, toYouTubeSearchUrl } from '../services/videoUtils';

export default function YouTubeEmbed({ title, url, fallbackUrl = '', active = true }) {
  const embedUrl = useMemo(() => toYouTubeEmbedUrl(url), [url]);
  const isValid = useMemo(() => isValidYouTubeEmbedUrl(embedUrl), [embedUrl]);
  const safeFallbackUrl = useMemo(() => toYouTubeSearchUrl(fallbackUrl, title), [fallbackUrl, title]);
  const [src, setSrc] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    setSrc(active && isValid ? embedUrl : '');
    return () => setSrc('');
  }, [active, embedUrl, isValid]);

  if (!isValid) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        {t('video.fallback')}
        {safeFallbackUrl ? (
          <a className="focus-ring mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-3 font-semibold text-calm-700" href={safeFallbackUrl} target="_blank" rel="noreferrer">
            {t('video.search')}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
      <iframe
        title={title ? t('video.title', { title }) : t('video.defaultTitle')}
        src={src}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
