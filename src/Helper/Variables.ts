export const VARIABLES = {
  CLOSED: 'closed',
  COMPONENT: 'component',
  PAGE: 'page',
  ID: 'id',
  OPENED: 'opened',
  PLURAL_COMPONENT: 'components',
  PLURAL_PAGE: 'pages',
} as const;

export type VariablesValue = typeof VARIABLES[keyof typeof VARIABLES];

export default VARIABLES;
