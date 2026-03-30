export const waitForElementSize = (
  el: HTMLElement | null,
  minHeight = 1,
  timeoutMs = 500,
  ready?: (el: HTMLElement) => boolean
): Promise<void> => {
  if (!el) {
    return Promise.resolve();
  }

  const hasSize = () =>
    (ready ? ready(el) : el.getBoundingClientRect().height >= minHeight);

  if (hasSize()) {
    return Promise.resolve();
  }

  const runRafProbe = () =>
    new Promise<void>((resolve) => {
      let attempts = 0;
      const tick = () => {
        if (hasSize() || attempts >= 8) {
          resolve();
          return;
        }
        attempts += 1;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

  const runResizeObserver = () =>
    new Promise<void>((resolve) => {
      if (typeof ResizeObserver === 'undefined') {
        resolve();
        return;
      }

      let done = false;
      const observer = new ResizeObserver(() => {
        if (done) {
          return;
        }
        if (hasSize()) {
          done = true;
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(el);

      window.setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        observer.disconnect();
        resolve();
      }, timeoutMs);
    });

  const runIntervalProbe = () =>
    new Promise<void>((resolve) => {
      let attempts = 0;
      const maxAttempts = 6;
      const intervalMs = 500;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (hasSize() || attempts >= maxAttempts) {
          clearInterval(timer);
          resolve();
        }
      }, intervalMs);
    });

  return runRafProbe().then(() => {
    if (hasSize()) {
      return;
    }
    return runResizeObserver().then(() => {
      if (hasSize()) {
        return;
      }
      return runIntervalProbe();
    });
  });
};
