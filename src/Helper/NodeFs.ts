import fs from 'node:fs';
import path from 'node:path';

export function nodeFsListFilesRecursively(rootPath: string, ignoredDirectoryNames: string[] = ['.git', 'node_modules']): string[] {
  const files: string[] = [];
  const directories = [rootPath];

  while (directories.length) {
    const currentPath = directories.pop();
    if (!currentPath) {
      continue;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach((entry) => {
      if (ignoredDirectoryNames.includes(entry.name)) {
        return;
      }

      const absolutePath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        directories.push(absolutePath);
        return;
      }

      if (entry.isFile()) {
        files.push(absolutePath);
      }
    });
  }

  return files;
}
