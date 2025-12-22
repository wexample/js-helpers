let locationParamsHash: URLSearchParams | null = null;

export function locationParamReload(): URLSearchParams {
  locationParamsHash = new URLSearchParams(window.location.hash.slice(1));
  return locationParamsHash;
}

export function locationHashParamGet(name: string, defaultValue = ''): string {
  const params = locationParamReload();
  const value = params.get(name);
  return value !== null ? value : defaultValue;
}

export function locationHashParamSet(name: string, value: string, ignoreHistory = false): void {
  const params = locationParamReload();
  params.set(name, value);

  const {pathname, search} = window.location;
  locationUpdate(`${pathname}${search}#${params.toString()}`, ignoreHistory);
}

export function locationUpdate(href: string, ignoreHistory = false): void {
  let nextHref = href;

  if (nextHref.endsWith('#')) {
    nextHref = nextHref.slice(0, -1);
  }

  const method: 'pushState' | 'replaceState' = ignoreHistory ? 'replaceState' : 'pushState';
  window.history[method]({manualState: true}, document.title, nextHref);
}

export function locationDetectLanguageAndRedirect(
  config: Record<string, string> & {_default: string}
): void {
  const userLanguage = (navigator.language || (navigator as unknown as {userLanguage?: string})?.userLanguage || '').toLowerCase();
  const currentPath = window.location.pathname;

  const redirectUrls = Object.values(config);
  const escaped = redirectUrls.map((url) => url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const redirectPattern = new RegExp(`^(${escaped.join('|')})`);

  if (redirectPattern.test(currentPath)) {
    return;
  }

  let redirectUrl = config._default;

  for (const [lang, url] of Object.entries(config)) {
    if (lang === '_default') {
      continue;
    }
    if (userLanguage.startsWith(lang.toLowerCase())) {
      redirectUrl = url;
      break;
    }
  }

  const restOfPath = currentPath.replace(/^\//, '');
  window.location.href = `${redirectUrl}${restOfPath}`;
}
