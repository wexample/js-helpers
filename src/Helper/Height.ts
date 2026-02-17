import { waitForTransitionEnd } from './Transition';

export const expandHeight = async (
  el: HTMLElement,
  propertyName = 'height'
): Promise<void> => {
  el.style.height = '0px';
  el.style.overflow = 'hidden';
  void el.offsetHeight;
  const targetHeight = el.scrollHeight;
  el.style.height = `${targetHeight}px`;
  await waitForTransitionEnd(el, propertyName);
  el.style.height = '';
  el.style.overflow = '';
};

export const collapseHeight = async (
  el: HTMLElement,
  propertyName = 'height'
): Promise<void> => {
  el.style.height = `${el.scrollHeight}px`;
  el.style.overflow = 'hidden';
  void el.offsetHeight;
  el.style.height = '0px';
  await waitForTransitionEnd(el, propertyName);
};
