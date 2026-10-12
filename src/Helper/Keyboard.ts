// Shortcuts written once for every platform: `Mod` is ⌘ on a Mac and Ctrl
// elsewhere — what copying, saving, undoing use —, so `Mod+S` saves on both.
// Written as `Mod+Shift+S`, `Alt+ArrowUp`, `Escape`: modifiers first, the key
// last, case not minding.

export type KeyboardShortcut = {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
};

const KEYBOARD_MODIFIERS = ['mod', 'ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command'];

// What a key is called for a person, on a Mac (its symbols) and elsewhere.
const KEYBOARD_LABELS_MAC: Record<string, string> = {
  ctrl: '⌃', alt: '⌥', shift: '⇧', meta: '⌘',
  enter: '↩', escape: 'esc', backspace: '⌫', delete: '⌦', tab: '⇥',
  arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→',
};

const KEYBOARD_LABELS: Record<string, string> = {
  ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Win',
  enter: 'Enter', escape: 'Esc', backspace: 'Backspace', delete: 'Del', tab: 'Tab',
  arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→',
};

// A Mac, an iPhone or an iPad: where the command key does what Ctrl does
// elsewhere. Read from what the browser says of its platform, newest first.
export function keyboardIsMac(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
    || navigator.platform
    || navigator.userAgent;

  return /mac|iphone|ipad|ipod/i.test(platform);
}

export function keyboardShortcutParse(combo: string, isMac: boolean = keyboardIsMac()): KeyboardShortcut {
  const parts = combo.split('+').map((part) => part.trim()).filter(Boolean);
  const key = parts.pop() ?? '';
  const names = parts.map((part) => part.toLowerCase());
  const has = (...aliases: string[]) => names.some((name) => aliases.includes(name));
  const mod = has('mod');

  names.forEach((name) => {
    if (!KEYBOARD_MODIFIERS.includes(name)) {
      throw new Error(`Unknown modifier "${name}" in shortcut "${combo}".`);
    }
  });

  return {
    key: key.toLowerCase(),
    ctrl: has('ctrl', 'control') || (mod && !isMac),
    alt: has('alt', 'option'),
    shift: has('shift'),
    meta: has('meta', 'cmd', 'command') || (mod && isMac),
  };
}

// Whether a key pressed is this shortcut: the same modifiers, no more, and
// the same key — read on the physical key for a letter or a digit, so that
// ⌥ on a Mac, which changes the character, or a Cyrillic layout, which
// writes another letter, still give `Mod+S`.
export function keyboardShortcutMatches(
  event: KeyboardEvent,
  combo: string | KeyboardShortcut,
  isMac: boolean = keyboardIsMac()
): boolean {
  const shortcut = typeof combo === 'string' ? keyboardShortcutParse(combo, isMac) : combo;

  if (event.ctrlKey !== shortcut.ctrl
    || event.altKey !== shortcut.alt
    || event.shiftKey !== shortcut.shift
    || event.metaKey !== shortcut.meta) {
    return false;
  }

  if (event.key.toLowerCase() === shortcut.key) {
    return true;
  }

  if (/^[a-z]$/.test(shortcut.key)) {
    return event.code === `Key${shortcut.key.toUpperCase()}`;
  }

  if (/^[0-9]$/.test(shortcut.key)) {
    return event.code === `Digit${shortcut.key}`;
  }

  return false;
}

// The shortcut as a person reads it on this platform: « ⌘⇧S » on a Mac,
// « Ctrl+Shift+S » elsewhere.
export function keyboardShortcutLabel(combo: string, isMac: boolean = keyboardIsMac()): string {
  const shortcut = keyboardShortcutParse(combo, isMac);
  const labels = isMac ? KEYBOARD_LABELS_MAC : KEYBOARD_LABELS;
  const order: (keyof KeyboardShortcut)[] = isMac ? ['ctrl', 'alt', 'shift', 'meta'] : ['ctrl', 'meta', 'alt', 'shift'];
  const parts = order.filter((modifier) => shortcut[modifier]).map((modifier) => labels[modifier as string]);
  const key = labels[shortcut.key] ?? (shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);

  return isMac ? [...parts, key].join('') : [...parts, key].join('+');
}
