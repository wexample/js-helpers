export const waitForAnimationEnd = (
  el: HTMLElement | null,
  softTimeoutMs = 220,
  hardTimeoutMs = 10000
): Promise<void> => {
  if (!el) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let started = false;
    let resolved = false;

    const clear = () => {
      el.removeEventListener('animationstart', onStart);
      el.removeEventListener('animationend', onEnd);
    };

    const finish = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      clear();
      resolve();
    };

    const onStart = () => {
      started = true;
      window.setTimeout(finish, hardTimeoutMs);
    };

    const onEnd = () => {
      finish();
    };

    el.addEventListener('animationstart', onStart, { once: true });
    el.addEventListener('animationend', onEnd, { once: true });

    // Soft timeout if no animation starts.
    window.setTimeout(() => {
      if (!started) {
        finish();
      }
    }, softTimeoutMs);
  });
};
