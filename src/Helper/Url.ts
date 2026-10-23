export function urlAppendQueryString(
  path: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const url = new URL(path, 'http://dummy');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  return url.pathname + url.search + url.hash;
}

export function urlParse(url: string): URL {
  if (!/^https?:\/\//i.test(url)) {
    const normalized = url.startsWith('/') ? url : `/${url}`;
    return new URL(`${window.location.origin}${normalized}`);
  }

  return new URL(url);
}
