export const waitForTransitionEnd = (
  el: HTMLElement | null,
  propertyName: string,
  softTimeoutMs = 50,
  hardTimeoutMs = 1000
): Promise<void> => {
  if (!el) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let started = false;
    let resolved = false;

    const clear = () => {
      el.removeEventListener('transitionrun', onStart);
      el.removeEventListener('transitionend', onEnd);
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

    const onEnd = (event: TransitionEvent) => {
      if (event.target !== el || event.propertyName !== propertyName) {
        return;
      }
      finish();
    };

    el.addEventListener('transitionrun', onStart, { once: true });
    el.addEventListener('transitionend', onEnd);

    window.setTimeout(() => {
      if (!started) {
        finish();
      }
    }, softTimeoutMs);
  });
};
