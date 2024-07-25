export const isNode = new Function(
  'try {return this===global;}catch(e){ return false;}',
);
export const isBrowser = new Function(
  'try {return this===window;}catch(e){ return false;}',
);
export function hasGlobalThis() {
  return typeof globalThis !== 'undefined';
}
