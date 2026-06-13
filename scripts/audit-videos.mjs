import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/data/exercises.ts', import.meta.url), 'utf8');
const exerciseBlocks = source.match(/\{\n\s+id: '[\s\S]*?\n\s+\}/g) ?? [];

function getField(block, field) {
  const match = block.match(new RegExp(`${field}: '([^']*)'`));
  return match?.[1] ?? '';
}

function isYouTubeEmbedUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    return (
      (host === 'youtube.com' || host === 'm.youtube.com') &&
      (url.pathname.startsWith('/embed/') || url.pathname === '/embed/videoseries')
    );
  } catch {
    return false;
  }
}

function isYouTubeSearchUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    return (host === 'youtube.com' || host === 'm.youtube.com') && url.pathname === '/results';
  } catch {
    return false;
  }
}

function safeSearchUrl(title) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title || 'rehab exercise physical therapy')}`;
}

const findings = exerciseBlocks.flatMap((block) => {
  const id = getField(block, 'id');
  const title = getField(block, 'title');
  const youtubeEmbedUrl = getField(block, 'youtubeEmbedUrl');
  const youtubeSearchUrl = getField(block, 'youtubeSearchUrl');
  const exerciseFindings = [];

  if (!youtubeEmbedUrl) {
    exerciseFindings.push('empty embed; written steps and search fallback should be used');
  } else if (!isYouTubeEmbedUrl(youtubeEmbedUrl)) {
    exerciseFindings.push(`invalid or non-embeddable embed URL: ${youtubeEmbedUrl}`);
  }

  if (!youtubeSearchUrl) {
    exerciseFindings.push('missing search fallback URL');
  } else if (!isYouTubeSearchUrl(youtubeSearchUrl)) {
    exerciseFindings.push(`non-search fallback URL: ${youtubeSearchUrl}`);
  }

  return exerciseFindings.map((issue) => ({ id, title, issue, fallback: safeSearchUrl(title) }));
});

if (findings.length === 0) {
  console.log('Video audit passed: no malformed video URLs found.');
} else {
  console.log(`Video audit found ${findings.length} item(s):`);
  for (const finding of findings) {
    console.log(`- ${finding.id} (${finding.title}): ${finding.issue}`);
    console.log(`  safe fallback: ${finding.fallback}`);
  }
}
