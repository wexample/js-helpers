const CAMEL_REGEX = /^[a-z][a-z0-9]*([A-Z][a-z0-9]*)+$/;
const PASCAL_REGEX = /^[A-Z][a-zA-Z0-9]*$/;
const CONSTANT_REGEX = /^[A-Z][A-Z0-9_]*$/;
const SNAKE_REGEX = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const KEBAB_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const DOT_REGEX = /^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/;
const PATH_REGEX = /^[a-z][a-z0-9]*(\/[a-z0-9]+)*$/;
const TITLE_REGEX = /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/;

const LOREM_BASE =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

type TranslationArgs = Record<string, unknown>;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWords(value?: string | null): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  let text = trimmed;

  // Replace any non-alphanumeric separators with spaces.
  text = text.replace(/[^A-Za-z0-9]+/g, ' ');
  // Split camelCase / PascalCase.
  text = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  // Split multiple caps like "JSONParser" -> "JSON Parser".
  text = text.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

// Casing conversions
export function stringToSnakeCase(value: string): string {
  return normalizeWords(value).join('_');
}

export function stringToKebabCase(value: string): string {
  return normalizeWords(value).join('-');
}

export function stringToDotCase(value: string): string {
  return normalizeWords(value).join('.');
}

export function stringToPathCase(value: string): string {
  return normalizeWords(value).join('/');
}

export function stringToCamelCase(value: string): string {
  const words = normalizeWords(value);
  if (!words.length) return '';
  return (
    words[0] +
    words
      .slice(1)
      .map((w) => stringCapitalizeFirst(w))
      .join('')
  );
}

export function stringToPascalCase(value: string): string {
  return normalizeWords(value)
    .map((w) => stringCapitalizeFirst(w))
    .join('');
}

export function stringToConstantCase(value: string): string {
  return normalizeWords(value).join('_').toUpperCase();
}

export function stringToTitleCase(value: string): string {
  return normalizeWords(value)
    .map((w) => stringCapitalizeFirst(w))
    .join(' ');
}

export function stringConvertCaseMap(): Record<string, (text: string) => string> {
  return {
    snake: stringToSnakeCase,
    kebab: stringToKebabCase,
    camel: stringToCamelCase,
    pascal: stringToPascalCase,
    constant: stringToConstantCase,
    title: stringToTitleCase,
    dot: stringToDotCase,
    path: stringToPathCase,
  };
}

export function stringConvertCase(
  text: string,
  toFormat: keyof ReturnType<typeof stringConvertCaseMap>
): string {
  const converters = stringConvertCaseMap();
  const converter = converters[toFormat];
  if (!converter) {
    throw new Error(
      `Invalid format '${toFormat}'. Must be one of: ${Object.keys(converters).join(', ')}`
    );
  }
  return converter(text);
}

export function stringDetectCase(text: string): string {
  if (!text || !text.trim()) return 'unknown';
  const value = text.trim();

  if (CONSTANT_REGEX.test(value)) return 'constant';
  if (SNAKE_REGEX.test(value)) return 'snake';
  if (KEBAB_REGEX.test(value)) return 'kebab';
  if (DOT_REGEX.test(value)) return 'dot';
  if (PATH_REGEX.test(value)) return 'path';
  if (CAMEL_REGEX.test(value)) return 'camel';
  if (PASCAL_REGEX.test(value)) return 'pascal';
  if (TITLE_REGEX.test(value)) return 'title';

  const separators =
    (value.includes('_') ? 1 : 0) +
    (value.includes('-') ? 1 : 0) +
    (value.includes('.') ? 1 : 0) +
    (value.includes('/') ? 1 : 0) +
    (/[a-z][A-Z]/.test(value) ? 1 : 0);

  if (separators > 1) return 'mixed';
  return 'unknown';
}

export function stringIsCamelCase(text: string): boolean {
  return stringDetectCase(text) === 'camel';
}

export function stringIsPascalCase(text: string): boolean {
  return stringDetectCase(text) === 'pascal';
}

export function stringIsSnakeCase(text: string): boolean {
  return stringDetectCase(text) === 'snake';
}

export function stringIsKebabCase(text: string): boolean {
  return stringDetectCase(text) === 'kebab';
}

export function stringIsConstantCase(text: string): boolean {
  return stringDetectCase(text) === 'constant';
}

export function stringIsDotCase(text: string): boolean {
  return stringDetectCase(text) === 'dot';
}

export function stringIsPathCase(text: string): boolean {
  return stringDetectCase(text) === 'path';
}

export function stringIsTitleCase(text: string): boolean {
  return stringDetectCase(text) === 'title';
}

// Formatting helpers
export function stringCapitalizeFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function stringFirstLetterLower(text: string): string {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

export function stringFirstLetterUpper(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function stringFormat(text: string, args: TranslationArgs): string {
  return Object.entries(args).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(key, 'g'), String(value));
  }, text);
}

export function stringToClass(text: string): string {
  return stringCapitalizeFirst(stringToCamelCase(text));
}

export function stringToCamel(text: string): string {
  return stringToCamelCase(text);
}

export function stringToKebab(text: string): string {
  return stringToKebabCase(text);
}

export function stringToSnake(text: string): string {
  return (
    text
      // Add underscore between lower and upper letters
      .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1_$2')
      // Add underscore between lower and number
      .replace(/([\p{Ll}0-9])(\p{Lu})/gu, '$1_$2')
      // Remove dash before numbers
      .replace(/-(\d)/g, '$1')
      .toLowerCase()
  );
}

export function stringToScreamingSnake(text: string): string {
  return stringToKebab(text).replace(/-/g, '_').toUpperCase();
}

export function stringPathToTagName(text: string): string {
  return text.split('/').join('-').toLowerCase();
}

/**
 * Build a stable identifier from a string.
 *
 * Rules (kept in sync with PHP `DomHelper::buildStringIdentifier()`):
 * - Replace any non [a-zA-Z0-9-] character with '-'
 * - Convert to kebab-case
 * - Collapse multiple '-' into one and trim '-' at both ends
 * - Keep legacy behavior by removing dashes before numbers (e.g. "vue-2" -> "vue2")
 */
export function stringBuildIdentifier(input: string): string {
  const kebab = stringToKebab(input.replace(/[^a-zA-Z0-9-]/g, '-'));

  return kebab
    .replace(/-(\d)/g, '$1')
    .replace(/-+/g, '-')
    .replace(/^[-]+|[-]+$/g, '');
}

// Text utilities
export function stringAppendMissingLines(lines: string[], content: string): string {
  let normalized = stringRemoveTrailingEmptyLines(content);
  const currentLines = normalized.split('\n');

  const seen = new Set(currentLines);
  const linesToAdd: string[] = [];

  for (const line of lines) {
    if (!seen.has(line)) {
      linesToAdd.push(line);
      seen.add(line);
    }
  }

  if (linesToAdd.length) {
    normalized = stringEnsureEndWithNewLine(normalized);
    normalized += linesToAdd.join('\n') + '\n';
  }

  return normalized;
}

export function stringEnsureEndWithNewLine(text: string): string {
  return text.endsWith('\n') ? text : `${text}\n`;
}

export function stringRemoveTrailingEmptyLines(content: string): string {
  if (!content) return content;

  const lines = content.split('\n');
  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  let result = lines.join('\n');
  if (result && content.endsWith('\n')) {
    result += '\n';
  }

  return result;
}

export function stringGenerateLoremIpsum(length = 100): string {
  if (length <= 0) return '';

  const text = `${LOREM_BASE} `.repeat(Math.floor(length / (LOREM_BASE.length + 1)) + 1);
  let cut = text.slice(0, length).trimEnd();

  if (cut.length === length && length < text.length && !/[ .,!?;:]$/.test(cut)) {
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 0) {
      cut = cut.slice(0, lastSpace);
    }
  }

  return cut.trim();
}

export function stringRemovePrefix(text: string, prefix: string): string {
  return text.replace(new RegExp(`^${escapeRegExp(prefix)}`), '');
}

export function stringRenderBoolean(boolean: boolean): string {
  return boolean ? 'True' : 'False';
}

export function stringReplaceParams(text: string, params: Record<string, unknown>): string {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`%${escapeRegExp(key)}%`, 'g'), String(value));
  }, text);
}

export function stringTruncate(text: string, limit: number): string {
  if (limit <= 0) return '';
  return text.length > limit ? `${text.slice(0, Math.max(0, limit - 3))}...` : text;
}

export default stringToKebab;
