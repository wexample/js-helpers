export default abstract class AbstractMixin {
  protected static applyOnce(
    instance: any,
    apply: (instance: any) => void,
    flag?: string
  ): boolean {
    const key = flag || `__mixin_${AbstractMixin.name}`;

    if (instance[key]) {
      return false;
    }

    instance[key] = true;
    apply(instance);

    return true;
  }
}
