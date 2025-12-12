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

export function color(text: string, colorCode: ColorValue = COLORS.gray): string {
  const resolved = typeof colorCode === 'string' && colorCode in COLORS
    ? COLORS[colorCode as keyof typeof COLORS]
    : colorCode || COLORS.gray;

  return `\x1b[${resolved}m${text}\x1b[0m`;
}

export function logTitle(title: string, colorCode: ColorValue = COLORS.cyan): void {
  console.log('');
  console.log(color(`# ${String(title).toUpperCase()}`, colorCode));
}

export function logPath(
  label: string,
  value: string,
  labelColor: ColorValue = COLORS.gray,
  valueColor: ColorValue = COLORS.yellow
): void {
  console.log(`${color(label, labelColor)} ${color(value, valueColor)}`);
}

export function logEntry(
  action: string,
  entry: {output: string; source: string}
): void {
  console.log(
    `${color('•', COLORS.green)} ${color(action, COLORS.blue)} ${color(entry.output, COLORS.yellow)}`
  );
  console.log(
    `    ${color('from', COLORS.gray)} ${color(entry.source, COLORS.gray)}`
  );
}

export default {
  COLORS,
  color,
  logTitle,
  logPath,
  logEntry,
};
