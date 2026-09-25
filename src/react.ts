import { useCallback, useSyncExternalStore } from 'react';

import type { Tubular } from './totally-tubular.js';
import type { AllObjectKeys, ObservationCallback, PropType } from './types.js';

/**
 * A React hook that binds to a {@link Tubular} instance and a specific key path
 * within its state.
 *
 * Returns a `[value, setter]` tuple that works exactly like React's built-in
 * `useState`, except reads and writes go through the Tubular store — so every
 * component (and non-React observer) watching the same path is notified on
 * every update.
 *
 * The setter accepts either a new value directly or an updater function that
 * receives the current value and returns the next one.
 *
 * The value is read through React's `useSyncExternalStore`, so the hook is
 * safe to use during server-side rendering: the server renders the store's
 * current value without subscribing, and the client subscribes during
 * hydration.
 *
 * @example
 * ```tsx
 * const store = new Tubular({ user: { name: 'Alice' }, count: 0 });
 *
 * function Counter() {
 *   const [count, setCount] = useTubular(store, 'count');
 *   return <button onClick={() => setCount(n => (n ?? 0) + 1)}>{count}</button>;
 * }
 *
 * function Greeting() {
 *   const [name] = useTubular(store, 'user.name');
 *   return <p>Hello, {name}!</p>;
 * }
 * ```
 */
export function useTubular<T extends object, K extends string>(
  tubular: Tubular<T>,
  key: K & AllObjectKeys<T>,
) {
  type ValueType = PropType<T, K>;

  /** callbacks */
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const observeCb: ObservationCallback<T> = () => {
        onStoreChange();
      };

      tubular.observe(key, observeCb);

      return () => {
        tubular.unobserve(key, observeCb);
      };
    },
    [tubular, key],
  );

  const getSnapshot = useCallback(() => tubular.read(key), [tubular, key]);

  const handleUpdateVal = useCallback(
    (
      newValOrCallback: ValueType | ((prevVal: ValueType | null) => ValueType),
    ) => {
      if (typeof newValOrCallback === 'function') {
        tubular.update(
          key,
          newValOrCallback as (oldVal: ValueType) => ValueType,
        );
      } else {
        tubular.update(key, () => newValOrCallback);
      }
    },
    [tubular, key],
  );

  /** state */
  const val = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return [val, handleUpdateVal] as const;
}

/**
 * Creates a hook bound to a specific {@link Tubular} instance, so you never
 * have to pass the instance around at every call site.
 *
 * Call this once, outside your components (the factory itself is not a hook,
 * so module scope is safe), and it returns a hook that works exactly like
 * {@link useTubular} minus the first argument — just the key path.
 *
 * The returned function is a hook: name it with a `use` prefix so React's
 * rules-of-hooks linting recognizes it, and call it unconditionally at the top
 * level of your components. Key paths remain fully type-checked against the
 * bound store's state shape.
 *
 * @example
 * ```tsx
 * const store = new Tubular({ user: { name: 'Alice' }, count: 0 });
 *
 * const useAppState = createUseTubular(store);
 *
 * function Counter() {
 *   const [count, setCount] = useAppState('count');
 *   return <button onClick={() => setCount(n => (n ?? 0) + 1)}>{count}</button>;
 * }
 *
 * function Greeting() {
 *   const [name] = useAppState('user.name');
 *   return <p>Hello, {name}!</p>;
 * }
 * ```
 */
export function createUseTubular<T extends object>(tubular: Tubular<T>) {
  return <K extends string>(key: K & AllObjectKeys<T>) =>
    useTubular(tubular, key);
}

/**
 * A React hook that returns a stable callback to reset a {@link Tubular} store
 * back to its initial state.
 *
 * Every key in the store is restored to the value originally passed to the
 * constructor, and every registered observer (including {@link useTubular}
 * hooks) is notified of each change.
 *
 * The returned callback is stable across re-renders.
 * It never changes its identity, so it is safe to pass as a dependency to `useEffect` or as a prop
 * to memoized components.
 *
 * @example
 * ```tsx
 * const store = new Tubular({ name: 'Alice', count: 0 });
 *
 * function ResetButton() {
 *   const handleReset = useTubularReset(store);
 *   return <button onClick={handleReset}>Reset</button>;
 * }
 * ```
 */
export function useTubularReset<T extends object>(tubular: Tubular<T>) {
  return useCallback(() => tubular.reset(), [tubular]);
}

/**
 * Creates a hook bound to a specific {@link Tubular} instance that returns a
 * stable callback resetting that store back to its initial state.
 *
 * Call this once, outside your components (the factory itself is not a hook,
 * so module scope is safe), and it returns a hook that works exactly like
 * {@link useTubularReset} minus the first argument. Every bound
 * {@link useTubular} (or {@link createUseTubular}) hook watching the store
 * re-renders with the restored value.
 *
 * The returned function is a hook: name it with a `use` prefix so React's
 * rules-of-hooks linting recognizes it, and call it unconditionally at the top
 * level of your components.
 *
 * @example
 * ```tsx
 * const store = new Tubular({ name: 'Alice', count: 0 });
 *
 * const useAppReset = createUseTubularReset(store);
 *
 * function ResetButton() {
 *   const handleReset = useAppReset();
 *   return <button onClick={handleReset}>Reset</button>;
 * }
 * ```
 */
export function createUseTubularReset<T extends object>(tubular: Tubular<T>) {
  return () => useTubularReset(tubular);
}
