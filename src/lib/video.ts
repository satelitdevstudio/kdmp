export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      const embedMatch = parsed.pathname.match(/\/embed\/([^/]+)/);
      if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const vimeoMatch = parsed.pathname.match(/\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    if (parsed.pathname.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}

export function isDirectVideoUrl(url: string): boolean {
  try {
    return new URL(url).pathname.match(/\.(mp4|webm|ogg)$/i) !== null;
  } catch {
    return false;
  }
}
