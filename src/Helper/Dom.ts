export const DOM_ATTRIBUTE = {
  HREF: 'href',
  ID: 'id',
  REL: 'rel',
  SRC: 'src',
} as const;

export const DOM_ATTRIBUTE_VALUE = {
  STYLESHEET: 'stylesheet',
} as const;

export const DOM_INSERT_POSITION = {
  BEFORE_END: 'beforeend' as InsertPosition,
} as const;

export const DOM_TAG_NAME = {
  A: 'a',
  DIV: 'div',
  LINK: 'link',
  SCRIPT: 'script',
} as const;

export type DomScrollToBottomOptions = {
  container?: HTMLElement | null;
  behavior?: ScrollBehavior;
  retries?: number;
  includeHidden?: boolean;
};

export function domAppendInnerHtml(el: HTMLElement, html: string): void {
  el.insertAdjacentHTML(DOM_INSERT_POSITION.BEFORE_END, html);
}

export function domFindPreviousNode(el: HTMLElement): HTMLElement | null {
  let current: ChildNode | null = el;

  do {
    current = current?.previousSibling ?? null;
  } while (current && current.nodeType === Node.TEXT_NODE);

  return current as HTMLElement | null;
}

/**
 * Return first scrollable parent.
 *
 * @see https://stackoverflow.com/a/42543908/2057976
 */
export function domFindScrollParent(element: HTMLElement, includeHidden = false): HTMLElement {
  const style = getComputedStyle(element);
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
  const excludeStaticParent = style.position === 'absolute';

  if (style.position === 'fixed') {
    return document.body;
  }

  let parent: HTMLElement | null = element.parentElement;
  while (parent) {
    const parentStyle = getComputedStyle(parent);

    if (
      (!excludeStaticParent || parentStyle.position !== 'static') &&
      overflowRegex.test(parentStyle.overflow + parentStyle.overflowY + parentStyle.overflowX)
    ) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return document.body;
}

export function domToggleMainOverlay(visible: boolean | null = null): void {
  const overlay = document.getElementById('main-overlay');
  if (!overlay) return;

  const classList = overlay.classList;
  const shouldShow = visible !== null ? visible : !classList.contains('visible');

  classList[shouldShow ? 'add' : 'remove']('visible');
}

export function domCreateHtmlDocumentFromHtml(html: string): HTMLHtmlElement {
  const root = document.createElement('html');
  root.innerHTML = html;
  return root;
}

export function domRemoveAllClasses(el: HTMLElement, classesToRemove: Iterable<string>): void {
  for (const className of classesToRemove) {
    el.classList.remove(className);
  }
}

export function domReplaceByOneClass(
  el: HTMLElement,
  newState: string,
  classesToRemove: Iterable<string>
): void {
  domRemoveAllClasses(el, classesToRemove);
  el.classList.add(newState);
}

export function domScrollToBottom(
  anchorElement: HTMLElement | null,
  options: DomScrollToBottomOptions = {}
): void {
  if (!anchorElement) {
    return;
  }

  const { container = null, behavior = 'auto', retries = 0, includeHidden = false } = options;

  const scrollContainer = container ?? domFindScrollParent(anchorElement, includeHidden);
  if (!scrollContainer) {
    return;
  }

  const targetTop = scrollContainer.scrollHeight;

  if (typeof scrollContainer.scrollTo === 'function') {
    scrollContainer.scrollTo({
      top: targetTop,
      behavior,
    });
  } else {
    scrollContainer.scrollTop = targetTop;
  }

  if (retries > 0) {
    window.requestAnimationFrame(() => {
      domScrollToBottom(anchorElement, {
        container: scrollContainer,
        behavior,
        retries: retries - 1,
        includeHidden,
      });
    });
  }
}
