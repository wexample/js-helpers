import { timeSleep } from './Time';

export type ReconnectBackoffOptions = {
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitterRatio?: number;
  maxAttempts?: number;
  random?: () => number;
};

export type ReconnectBackoffResolvedOptions = {
  initialDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitterRatio: number;
  maxAttempts: number;
  random: () => number;
};

export type ReconnectAttemptContext = {
  attempt: number;
  delayMs: number;
  error: unknown;
};

export type ReconnectAttemptCallbacks = {
  onRetry?: (context: ReconnectAttemptContext) => void | Promise<void>;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_RECONNECT_BACKOFF_OPTIONS: ReconnectBackoffResolvedOptions = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  factor: 2,
  jitterRatio: 0.2,
  maxAttempts: Number.POSITIVE_INFINITY,
  random: Math.random,
};

export function reconnectBackoffResolveOptions(
  options: ReconnectBackoffOptions = {}
): ReconnectBackoffResolvedOptions {
  const resolved: ReconnectBackoffResolvedOptions = {
    ...DEFAULT_RECONNECT_BACKOFF_OPTIONS,
    ...options,
  };

  if (resolved.initialDelayMs < 0) {
    throw new Error('initialDelayMs must be >= 0.');
  }

  if (resolved.maxDelayMs < 0) {
    throw new Error('maxDelayMs must be >= 0.');
  }

  if (resolved.factor < 1) {
    throw new Error('factor must be >= 1.');
  }

  if (resolved.jitterRatio < 0 || resolved.jitterRatio > 1) {
    throw new Error('jitterRatio must be between 0 and 1.');
  }

  if (resolved.maxAttempts < 1 && Number.isFinite(resolved.maxAttempts)) {
    throw new Error('maxAttempts must be >= 1.');
  }

  return resolved;
}

export function reconnectBackoffBaseDelay(
  attempt: number,
  options: ReconnectBackoffOptions = {}
): number {
  const resolved = reconnectBackoffResolveOptions(options);
  const safeAttempt = Math.max(1, attempt);
  const baseDelay = resolved.initialDelayMs * resolved.factor ** (safeAttempt - 1);

  return Math.min(resolved.maxDelayMs, baseDelay);
}

export function reconnectBackoffApplyJitter(
  delayMs: number,
  options: ReconnectBackoffOptions = {}
): number {
  const resolved = reconnectBackoffResolveOptions(options);
  if (delayMs <= 0 || resolved.jitterRatio === 0) {
    return Math.max(0, delayMs);
  }

  const amplitude = delayMs * resolved.jitterRatio;
  const offset = (resolved.random() * 2 - 1) * amplitude;
  const jitteredDelay = delayMs + offset;

  return Math.max(0, Math.min(resolved.maxDelayMs, jitteredDelay));
}

export function reconnectBackoffDelay(
  attempt: number,
  options: ReconnectBackoffOptions = {}
): number {
  const baseDelay = reconnectBackoffBaseDelay(attempt, options);
  return reconnectBackoffApplyJitter(baseDelay, options);
}

export type ReconnectBackoffController = {
  getAttempt: () => number;
  nextDelay: () => number;
  canRetry: () => boolean;
  reset: () => void;
};

export function reconnectBackoffCreateController(
  options: ReconnectBackoffOptions = {}
): ReconnectBackoffController {
  const resolved = reconnectBackoffResolveOptions(options);
  let attempt = 0;

  return {
    getAttempt: () => attempt,

    canRetry: () => {
      if (!Number.isFinite(resolved.maxAttempts)) {
        return true;
      }

      return attempt < resolved.maxAttempts;
    },

    nextDelay: () => {
      attempt += 1;
      return reconnectBackoffDelay(attempt, resolved);
    },

    reset: () => {
      attempt = 0;
    },
  };
}

export async function reconnectBackoffAttempt<T>(
  operation: () => Promise<T> | T,
  options: ReconnectBackoffOptions = {},
  callbacks: ReconnectAttemptCallbacks = {}
): Promise<T> {
  const controller = reconnectBackoffCreateController(options);

  while (true) {
    try {
      const result = await operation();
      controller.reset();
      return result;
    } catch (error) {
      const nextAttempt = controller.getAttempt() + 1;
      const shouldRetry = callbacks.shouldRetry?.(error, nextAttempt) ?? true;
      if (!shouldRetry || !controller.canRetry()) {
        throw error;
      }

      const delayMs = controller.nextDelay();
      await callbacks.onRetry?.({
        attempt: controller.getAttempt(),
        delayMs,
        error,
      });
      await timeSleep(delayMs);
    }
  }
}
