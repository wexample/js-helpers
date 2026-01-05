type Constructor<T = any> = abstract new (...args: any[]) => T;

/**
 * Apply mixin classes to a target class (TypeScript-compatible).
 * Copy prototype properties (except constructor) and static props.
 */
export function mixinApply(targetCtor: Constructor, mixins: Constructor[]): void {
  mixins.forEach((mixinCtor) => {
    // Copy instance members (prototype).
    Object.getOwnPropertyNames(mixinCtor.prototype).forEach((name) => {
      if (name === 'constructor') {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(mixinCtor.prototype, name);
      if (descriptor) {
        Object.defineProperty(targetCtor.prototype, name, descriptor);
      }
    });

    // Copy static members if any (excluding length/name/prototype).
    Object.getOwnPropertyNames(mixinCtor).forEach((name) => {
      if (['length', 'name', 'prototype'].includes(name)) {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(mixinCtor, name);
      if (descriptor) {
        Object.defineProperty(targetCtor, name, descriptor);
      }
    });
  });
}
