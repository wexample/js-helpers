export function arrayDeleteItem<T>(haystack: T[], needle: T): T[] {
  return arrayDeleteByIndex(haystack, haystack.indexOf(needle));
}

export function arrayDeleteByIndex<T>(haystack: T[], index: number): T[] {
  if (index !== -1) {
    haystack.splice(index, 1);
  }

  return haystack;
}

/**
 * Functions "arguments" object may be transformed to real array for extra manipulations.
 */
export function arrayFromArguments<T>(args: ArrayLike<T>): T[] {
  return Array.prototype.slice.call(args);
}

export function arrayShallowCopy<T>(array: T[]): T[] {
  return array.slice(0);
}

export function arrayUnique<T>(array: T[]): T[] {
  return array.filter((value, index) => array.indexOf(value) === index);
}

export function arrayFindByIndex<T>(array: T[], position: number): T | undefined {
  return array[position >= 0 ? position : array.length + position];
}
