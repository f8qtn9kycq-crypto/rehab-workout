const youtubeIdPattern = /^[a-zA-Z0-9_-]{6,}$/;

function getYouTubeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function toYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsed = new URL(url);
    const host = getYouTubeHost(url);

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/videoseries')) {
        const list = parsed.searchParams.get('list');
        return list ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}` : '';
      }

      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/').filter(Boolean)[1];
        return youtubeIdPattern.test(id) ? `https://www.youtube.com/embed/${id}` : '';
      }

      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v') ?? '';
        return youtubeIdPattern.test(id) ? `https://www.youtube.com/embed/${id}` : '';
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/').filter(Boolean)[1] ?? '';
        return youtubeIdPattern.test(id) ? `https://www.youtube.com/embed/${id}` : '';
      }
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
      return youtubeIdPattern.test(id) ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch {
    return '';
  }

  return '';
}

export function isValidYouTubeEmbedUrl(url) {
  const embedUrl = toYouTubeEmbedUrl(url);
  if (!embedUrl) return false;

  try {
    const parsed = new URL(embedUrl);
    return parsed.protocol === 'https:' && parsed.hostname === 'www.youtube.com' && parsed.pathname.startsWith('/embed/');
  } catch {
    return false;
  }
}

export function toYouTubeSearchUrl(url, title = '') {
  const query = encodeURIComponent(title || 'rehab exercise physical therapy');

  if (!url || typeof url !== 'string') {
    return `https://www.youtube.com/results?search_query=${query}`;
  }

  try {
    const parsed = new URL(url);
    const host = getYouTubeHost(url);

    if ((host === 'youtube.com' || host === 'm.youtube.com') && parsed.pathname === '/results') {
      return url;
    }
  } catch {
    return `https://www.youtube.com/results?search_query=${query}`;
  }

  return `https://www.youtube.com/results?search_query=${query}`;
}

export function getVideoFallbackState(exercise) {
  const embedUrl = toYouTubeEmbedUrl(exercise?.youtubeEmbedUrl);

  return {
    embedUrl,
    shouldFallback: !isValidYouTubeEmbedUrl(embedUrl),
    searchUrl: toYouTubeSearchUrl(exercise?.youtubeSearchUrl, exercise?.title),
  };
}
