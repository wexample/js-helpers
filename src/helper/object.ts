export function mergeDeep<T extends Record<string, any>, U extends Record<string, any>>(
  target: T = {} as T,
  source: U = {} as U
): T & U {
  const output: Record<string, any> = {...target};

  Object.entries(source || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = mergeDeep(
        typeof output[key] === 'object' && output[key] !== null
          ? output[key]
          : {},
        value as Record<string, any>
      );
    } else {
      output[key] = value;
    }
  });

  return output as T & U;
}

export default mergeDeep;
