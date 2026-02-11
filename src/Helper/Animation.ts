export const waitForAnimationEnd = (
  el: HTMLElement | null,
  timeoutMs = 220
): Promise<void> => {
  if (!el) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, timeoutMs);
    const onEnd = () => {
      clearTimeout(timeout);
      resolve();
    };
    el.addEventListener('animationend', onEnd, { once: true });
  });
};
