export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function formatUrl(rawUrl) {
  if (!rawUrl) return '';
  return rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;
}

export function extractHostname(rawUrl) {
  try {
    const formatted = formatUrl(rawUrl);
    return new URL(formatted).hostname;
  } catch {
    return rawUrl;
  }
}
