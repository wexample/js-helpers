export type QueueWorker<TItem, TResult = unknown> = (item: TItem) => Promise<TResult> | TResult;

export type QueueCallbacks<TItem, TResult = unknown> = {
  onItemStart?: (item: TItem) => void;
  onItemSuccess?: (item: TItem, result: TResult) => void;
  onItemError?: (item: TItem, error: unknown) => void;
  onItemDone?: (item: TItem) => void;
  onDrain?: () => void;
};

export type QueueOptions<TItem, TResult = unknown> = QueueCallbacks<TItem, TResult> & {
  worker: QueueWorker<TItem, TResult>;
  concurrency?: number;
  autoStart?: boolean;
};

export default class Queue<TItem, TResult = unknown> {
  private queue: TItem[] = [];
  private activeCount = 0;
  private paused = false;
  private readonly worker: QueueWorker<TItem, TResult>;
  private readonly concurrency: number;
  private readonly autoStart: boolean;
  private readonly callbacks: QueueCallbacks<TItem, TResult>;

  constructor(options: QueueOptions<TItem, TResult>) {
    this.worker = options.worker;
    this.concurrency = Math.max(1, options.concurrency ?? 1);
    this.autoStart = options.autoStart ?? true;
    this.callbacks = {
      onItemStart: options.onItemStart,
      onItemSuccess: options.onItemSuccess,
      onItemError: options.onItemError,
      onItemDone: options.onItemDone,
      onDrain: options.onDrain,
    };
  }

  enqueue(item: TItem): void {
    this.queue.push(item);
    if (this.autoStart) {
      this.pump();
    }
  }

  enqueueMany(items: TItem[]): void {
    this.queue.push(...items);
    if (this.autoStart) {
      this.pump();
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;
    this.pump();
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }

  active(): number {
    return this.activeCount;
  }

  isIdle(): boolean {
    return this.queue.length === 0 && this.activeCount === 0;
  }

  private pump(): void {
    if (this.paused) {
      return;
    }

    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift() as TItem;
      this.runItem(item);
    }

    if (this.isIdle()) {
      this.callbacks.onDrain?.();
    }
  }

  private async runItem(item: TItem): Promise<void> {
    this.activeCount += 1;
    this.callbacks.onItemStart?.(item);

    try {
      const result = await this.worker(item);
      this.callbacks.onItemSuccess?.(item, result);
    } catch (error) {
      this.callbacks.onItemError?.(item, error);
    } finally {
      this.callbacks.onItemDone?.(item);
      this.activeCount -= 1;
      this.pump();
    }
  }
}
