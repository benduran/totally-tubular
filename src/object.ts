export function isArray(thing: unknown): thing is unknown[] {
  return Array.isArray(thing);
}

export function isObject(thing: unknown): thing is object {
  return typeof thing === 'object';
}

export function isNullOrUndefined(thing: unknown): thing is null | undefined {
  return thing === null || thing === undefined || typeof thing === 'undefined';
}
