const EXTENSION_REGEX = /\.[^.]+$/;
const CAMELCASE_REGEX = /([a-z0-9])([A-Z])/g;
const DELIMITER_REGEX = /[\s_]+/g;
const DASH_REGEX = /-+/g;
const TRIM_DASH_REGEX = /^-+|-+$/g;

/**
 * Convert any value to a file-system/URL friendly kebab-case string.
 * Non-string inputs are stringified and trimmed before transformations.
 */
export function stringToKebab(value?: unknown): string {
  if (value === undefined || value === null) {
    return 'index';
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return 'index';
  }

  const kebab = normalized
    .replace(EXTENSION_REGEX, '')
    .replace(CAMELCASE_REGEX, '$1-$2')
    .replace(DELIMITER_REGEX, '-')
    .replace(DASH_REGEX, '-')
    .replace(TRIM_DASH_REGEX, '')
    .toLowerCase();

  return kebab || 'index';
}

