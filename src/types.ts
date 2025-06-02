export type TSPrimitve = string | number | bigint | boolean | symbol | undefined | null;

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

// Helper type to detect common collections
type IsCollection<T> = T extends any[]
  ? true
  : T extends ReadonlyArray<any>
    ? true
    : T extends Map<any, any>
      ? true
      : T extends Set<any>
        ? true
        : false;

// Updated DotNestedKeys: if T is a collection type, we terminate recursion
type DotNestedKeys<T> = (
  T extends object
    ? IsCollection<T> extends true
      ? '' // For collections, do not dive into nested keys
      : { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

export type AllObjectKeys<T> = keyof T | DotNestedKeys<T>;

export type PropType<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer Head}.${infer Rest}`
    ? Head extends keyof T
      ? Rest extends AllObjectKeys<T[Head]>
        ? PropType<T[Head], Rest>
        : never
      : never
    : never;

export type ObservationCallback<T, K = AllObjectKeys<T>, V = PropType<T, K & string>> = (
  newVal: V,
  oldVal: V,
  propPath: K,
) => void;
