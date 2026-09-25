export type PollWhileVisibleOptions = {
  // The time between two runs while they succeed.
  intervalMs: number;
  // The longest time between two runs while they keep failing: each failure
  // doubles the wait up to this.
  maxIntervalMs?: number;
  // One run. Answering false, or throwing, counts as a failure.
  run: () => Promise<boolean | void> | boolean | void;
};

export type PollHandle = {
  stop: () => void;
};

/**
 * Runs something again and again while the page is in sight, and never two at
 * once: the next run is scheduled once the last one has answered, so a slow
 * answer never finds them piling up. A tab out of sight does not run, and
 * picks up again when it comes back; a failing run makes the next one wait
 * twice as long, up to `maxIntervalMs`, and a success brings the pace back.
 * For a page telling a server it is still looking — the server decides what
 * that is worth.
 */
export function pollWhileVisible(options: PollWhileVisibleOptions): PollHandle {
  const maxIntervalMs = options.maxIntervalMs ?? options.intervalMs;
  let delayMs = options.intervalMs;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let stopped = false;

  const schedule = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }

    if (stopped || running || document.hidden) {
      return;
    }

    timer = setTimeout(tick, delayMs);
  };

  const tick = async (): Promise<void> => {
    timer = null;
    running = true;
    let succeeded = false;

    try {
      succeeded = (await options.run()) !== false;
    } catch {
      succeeded = false;
    }

    running = false;
    delayMs = succeeded ? options.intervalMs : Math.min(delayMs * 2, maxIntervalMs);
    schedule();
  };

  document.addEventListener('visibilitychange', schedule);
  schedule();

  return {
    stop: (): void => {
      stopped = true;
      document.removeEventListener('visibilitychange', schedule);

      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
