const YOUTUBE_PATTERNS = [
  /[?&]v=([^&#]+)/,        // youtube.com/watch?v=ID
  /youtu\.be\/([^?&#/]+)/, // youtu.be/ID
  /\/embed\/([^?&#/]+)/,   // youtube.com/embed/ID
  /\/shorts\/([^?&#/]+)/,  // youtube.com/shorts/ID
];

export function getYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function isYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}
