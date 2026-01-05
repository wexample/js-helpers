export const KEY_CODE = {
  ESCAPE: 'Escape',
} as const;

export type KeyCode = (typeof KEY_CODE)[keyof typeof KEY_CODE];
