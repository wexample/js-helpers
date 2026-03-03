export type SerializeForLogOptions = {
  maxDepth?: number;
};

export function serializeForLog(
  value: unknown,
  options: SerializeForLogOptions = {},
  depth = 0,
  seen?: WeakSet<object>
): unknown {
  const maxDepth = options.maxDepth ?? 5;

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'undefined') {
    return undefined;
  }

  if (depth >= maxDepth) {
    return '[MaxDepth]';
  }

  if (value instanceof Error) {
    const err = value as Error & { cause?: unknown };
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: typeof err.cause === 'undefined'
        ? undefined
        : serializeForLog(err.cause, options, depth + 1, seen),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeForLog(item, options, depth + 1, seen));
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const nextSeen = seen || new WeakSet<object>();

    if (nextSeen.has(objectValue)) {
      return '[Circular]';
    }

    nextSeen.add(objectValue);

    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(objectValue)) {
      output[key] = serializeForLog(item, options, depth + 1, nextSeen);
    }
    return output;
  }

  return String(value);
}
