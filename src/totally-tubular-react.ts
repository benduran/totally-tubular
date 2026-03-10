import { useCallback, useEffect, useState } from 'react';

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

  /** state */
  const [val, setVal] = useState<ValueType | null>(() => tubular.read(key));

  /** callbacks */
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

  /** effects */
  useEffect(() => {
    // Sync in case the value changed between render and effect registration
    setVal(tubular.read(key) as ValueType | null);

    const observeCb: ObservationCallback<T> = (newVal) => {
      setVal(newVal as ValueType | null);
    };

    tubular.observe(key, observeCb);

    return () => {
      tubular.unobserve(key, observeCb);
    };
  }, [tubular, key]);

  return [val, handleUpdateVal] as const;
}
