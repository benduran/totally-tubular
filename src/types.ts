export type TSPrimitve =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | undefined
  | null;

/**
 * Single-check collection guard.
 * `readonly any[]` covers both `any[]` and `ReadonlyArray<any>` since `Array<T>`
 * extends `ReadonlyArray<T>`. One distributive check instead of four sequential ones.
 */
type IsCollection<T> = T extends readonly any[] | Map<any, any> | Set<any>
  ? true
  : false;

/**
 * Produces every dot-separated key path into T as a string union.
 *
 * - The `Depth` tuple acts as a recursion counter: when its length reaches 5 the
 *   type resolves to `never`, which caps the union size and prevents the language
 *   server from hanging on deeply-nested or self-referential shapes.
 * - Top-level keys are included as bare strings (`K`), so this type supersedes
 *   `keyof T & string` — there is no need for a separate union with `keyof T`.
 * - Collections (arrays, Map, Set) are terminated at their key rather than
 *   recursed into.
 * - Returning `never` (not `''`) from every terminal branch avoids the need for
 *   a secondary `Extract<D, string>` pass over the full union.
 */
export type DotNestedKeys<T, Depth extends 1[] = []> = Depth['length'] extends 5
  ? never
  : T extends object
    ? IsCollection<T> extends true
      ? never
      : {
          [K in keyof T & string]: IsCollection<T[K]> extends true
            ? K
            : T[K] extends object
              ? K | `${K}.${DotNestedKeys<T[K], [...Depth, 1]>}`
              : K;
        }[keyof T & string]
    : never;

/**
 * All valid key paths into T (top-level and dot-nested).
 *
 * `DotNestedKeys<T>` already emits top-level string keys alongside nested paths,
 * so a `keyof T` union is redundant and was previously responsible for duplicate
 * entries that the checker had to deduplicate on every instantiation.
 */
export type AllObjectKeys<T> = DotNestedKeys<T>;

/**
 * Resolves the value type at a dot-separated path P within T.
 *
 * The intermediate `Rest extends AllObjectKeys<T[Head]>` guard that previously
 * existed here forced a full re-evaluation of `AllObjectKeys` at every recursive
 * level. It has been removed: if `Rest` is not a valid path the recursion
 * naturally returns `never`, which is the correct result.
 */
export type PropType<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer Head}.${infer Rest}`
    ? Head extends keyof T
      ? PropType<T[Head], Rest>
      : never
    : never;

/**
 * Callback invoked by Tubular whenever an observed path changes.
 *
 * The previous definition used defaulted type parameters
 * (`K = AllObjectKeys<T>`, `V = PropType<T, K & string>`). Default type
 * parameters are eagerly evaluated by the checker at *every* reference to
 * `ObservationCallback<T>`, causing a full `AllObjectKeys<T>` + distributed
 * `PropType` expansion each time. Using `unknown` for the value parameters
 * defers any narrowing to call sites that actually need it, which is a far
 * smaller surface area.
 */
export type ObservationCallback<T> = (
  newVal: unknown,
  oldVal: unknown,
  propPath: AllObjectKeys<T>,
) => void;
