import { functionIsType } from '../Helper/Function.js';

type AnyFn<TThis, TArgs extends unknown[]> = (this: TThis, ...args: TArgs) => void | Promise<void>;

export default abstract class AsyncConstructor<TArgs extends unknown[] = unknown[]> {
  private _isReady = false;
  private _readyArgs: TArgs | null = null;
  private readonly readyCallbacks: Array<AnyFn<this, TArgs>> = [];

  get isReady(): boolean {
    return this._isReady;
  }

  protected defer(fn: () => void): void {
    if (typeof queueMicrotask === 'function') queueMicrotask(fn);
    else setTimeout(fn, 0);
  }

  ready(cb: AnyFn<this, TArgs>): void {
    if (this._isReady) {
      const args = this._readyArgs ?? ([] as unknown as TArgs);
      this.defer(() => void cb.apply(this, args));
      return;
    }
    this.readyCallbacks.push(cb);
  }

  protected async readyComplete(...args: TArgs): Promise<void> {
    if (this._isReady) return;

    this._isReady = true;
    this._readyArgs = args;

    const callbacks = this.readyCallbacks.splice(0);

    for (const cb of callbacks) {
      if (!functionIsType(cb)) {
        throw new TypeError('Ready callback must be a function.');
      }
      await cb.apply(this, args);
    }
  }

  protected seal(): void {
    Object.seal(this);
  }
}
