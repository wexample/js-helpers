export function objectMergeDeep<T extends Record<string, any>, U extends Record<string, any>>(
  target: T = {} as T,
  source: U = {} as U
): T & U {
  const output: Record<string, any> = { ...target };

  Object.entries(source || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = objectMergeDeep(
        typeof output[key] === 'object' && output[key] !== null ? output[key] : {},
        value as Record<string, any>
      );
    } else {
      output[key] = value;
    }
  });

  return output as T & U;
}

export function objectToType(value: unknown): string {
  return {}.toString.call(value).match(/([a-z]+)(:?\])/i)?.[1] ?? typeof value;
}

export function objectIsPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  return objectToType(value) === 'Object';
}

export function objectDeepAssignWithOptions(options: {
  nonEnum?: boolean;
  symbols?: boolean;
  descriptors?: boolean;
  proto?: boolean;
}) {
  const mergedOptions = {
    nonEnum: true,
    symbols: true,
    descriptors: true,
    proto: true,
    ...options,
  };

  return (target: any, ...sources: any[]) => {
    sources.forEach((source) => {
      if (!objectIsPlainObject(source) || !objectIsPlainObject(target)) return;

      const copyProperty = (property: string | symbol) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, property);
        if (!descriptor) return;

        if (descriptor.enumerable || mergedOptions.nonEnum) {
          if (objectIsPlainObject(source[property]) && objectIsPlainObject(target[property])) {
            descriptor.value = objectDeepAssignWithOptions(mergedOptions)(
              target[property],
              source[property]
            );
          }

          if (mergedOptions.descriptors) {
            Object.defineProperty(target, property, descriptor);
          } else {
            target[property] = descriptor.value;
          }
        }
      };

      Object.getOwnPropertyNames(source).forEach(copyProperty);

      if (mergedOptions.symbols) {
        Object.getOwnPropertySymbols(source).forEach(copyProperty);
      }

      if (mergedOptions.proto) {
        const targetProto = Object.getPrototypeOf(target);
        const sourceProto = Object.getPrototypeOf(source);
        if (targetProto && sourceProto) {
          objectDeepAssignWithOptions({ ...mergedOptions, proto: false })(targetProto, sourceProto);
        }
      }
    });
    return target;
  };
}

export function objectDeepAssign(...args: any[]): any {
  return objectDeepAssignWithOptions({
    nonEnum: true,
    symbols: true,
    descriptors: true,
    proto: true,
  }).apply(undefined, args as [any, ...any[]]);
}

export function objectCallPrototypeMethodIfExists<T extends object, R>(
  self: T,
  methodName: string,
  args: unknown[] = []
): R | undefined {
  const method = Object.getPrototypeOf(self)?.[methodName];
  if (typeof method === 'function') {
    return method.apply(self, args);
  }
  return undefined;
}

export function objectGetItemByPath(
  data: any,
  key: string | string[],
  defaultValue: any = null,
  separator = '.'
): any {
  const keys = Array.isArray(key) ? key : key.split(separator);
  let cursor: any = data;

  for (const k of keys) {
    if (cursor !== null && typeof cursor === 'object' && k in cursor) {
      cursor = cursor[k];
    } else {
      return defaultValue;
    }
  }

  return cursor;
}
