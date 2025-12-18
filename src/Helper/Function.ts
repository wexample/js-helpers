export function functionIsType<TArgs extends unknown[] = unknown[], R = unknown>(
  value: unknown
): value is (...args: TArgs) => R {
  return typeof value === "function";
}