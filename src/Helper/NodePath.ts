import path from 'node:path';

export function nodePathNormalizeToAbsolute(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.length) {
    return null;
  }

  return path.resolve(trimmed);
}

export function nodePathToPosix(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

export function nodePathStripExtension(filePath: string): string {
  const extension = path.extname(filePath);
  return filePath.slice(0, -extension.length);
}
