export function arrayDeleteItem<T>(haystack: T[], needle: T): T[] {
  return haystack.filter(item => item !== needle);
}

export function arrayDeleteIndex<T>(haystack: T[], index: number): T[] {
  return haystack.filter((_, i) => i !== index);
}
