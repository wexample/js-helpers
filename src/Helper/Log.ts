export const COLORS = {
  blue: '34',
  cyan: '36',
  gray: '90',
  green: '32',
  magenta: '35',
  yellow: '33',
  red: '31',
} as const;

type ColorValue = keyof typeof COLORS | string;

export function logColor(text: string, colorCode: ColorValue = COLORS.gray): string {
  const resolved = typeof colorCode === 'string' && colorCode in COLORS
    ? COLORS[colorCode as keyof typeof COLORS]
    : colorCode || COLORS.gray;

  return `\x1b[${resolved}m${text}\x1b[0m`;
}

export function logTitle(title: string, colorCode: ColorValue = COLORS.cyan): void {
  console.log('');
  console.log(logColor(`# ${String(title).toUpperCase()}`, colorCode));
}

export function logPath(
  label: string,
  value: string,
  labelColor: ColorValue = COLORS.gray,
  valueColor: ColorValue = COLORS.yellow
): void {
  console.log(`${logColor(label, labelColor)} ${logColor(value, valueColor)}`);
}

export function logEntry(
  action: string,
  entry: {output: string; source: string}
): void {
  console.log(
    `${logColor('•', COLORS.green)} ${logColor(action, COLORS.blue)} ${logColor(entry.output, COLORS.yellow)}`
  );
  console.log(
    `    ${logColor('from', COLORS.gray)} ${logColor(entry.source, COLORS.gray)}`
  );
}
