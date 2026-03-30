import fs from 'node:fs';
import path from 'node:path';

export function nodeEnvReadVarFromDotEnvFiles(variableName: string, envFiles: string[] = ['.env.local', '.env.build', '.env']): string | null {
  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const value = nodeEnvParseDotEnvLine(line, variableName);
      if (value !== null) {
        return value;
      }
    }
  }

  return null;
}

export function nodeEnvParseDotEnvLine(line: string, variableName: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const match = trimmed.match(new RegExp(`^(?:export\\s+)?${variableName}\\s*=\\s*(.*)$`));
  if (!match) {
    return null;
  }

  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value;
}
