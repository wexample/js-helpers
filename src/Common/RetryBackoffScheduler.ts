import {
  reconnectBackoffCreateController,
  type ReconnectBackoffController,
  type ReconnectBackoffOptions,
} from '../Helper/Reconnect';

export type RetryBackoffScheduleContext = {
  attempt: number;
  delayMs: number;
};

export default class RetryBackoffScheduler {
  private readonly controller: ReconnectBackoffController;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(options: ReconnectBackoffOptions = {}) {
    this.controller = reconnectBackoffCreateController(options);
  }

  get attempt(): number {
    return this.controller.getAttempt();
  }

  get isScheduled(): boolean {
    return this.timeout !== null;
  }

  canRetry(): boolean {
    return this.controller.canRetry();
  }

  reset(): void {
    this.cancel();
    this.controller.reset();
  }

  cancel(): void {
    if (!this.timeout) {
      return;
    }

    clearTimeout(this.timeout);
    this.timeout = null;
  }

  schedule(run: () => void): RetryBackoffScheduleContext | null {
    if (this.timeout || !this.controller.canRetry()) {
      return null;
    }

    const delayMs = this.controller.nextDelay();
    const context: RetryBackoffScheduleContext = {
      attempt: this.controller.getAttempt(),
      delayMs,
    };

    this.timeout = setTimeout(() => {
      this.timeout = null;
      run();
    }, delayMs);

    return context;
  }
}
