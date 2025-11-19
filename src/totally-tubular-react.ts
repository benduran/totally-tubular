import { useCallback, useEffect, useState } from 'react';

import { Tubular } from './totally-tubular.js';
import { AllObjectKeys, ObservationCallback, PropType } from './types.js';

/**
 * All the same behavior as the normally Tubular class,
 * but includes some react hooks mapped onto the state object
 * for easy access to reading from the state object in react,
 * as well as updating the state
 */
export class TubularReact<T extends object> extends Tubular<T> {
  /**
   * returns a typical useState() like tuple
   * for you to read and / or update a piece
   * of Tubular state
   */
  useState<K extends AllObjectKeys<T>>(key: K) {
    type ValueType = PropType<T, K & string>;

    /** state */
    const [val, setVal] = useState<ValueType | null>(this.read(key));

    /** callbacks */
    const handleUpdateVal = useCallback(
      (newValOrCallback: ValueType | ((prevVal: ValueType | null) => ValueType)) => {
        if (typeof newValOrCallback === 'function') {
          this.update(key, newValOrCallback as (oldVal: ValueType) => ValueType);
        } else {
          this.update(key, () => newValOrCallback);
        }
      },
      [key],
    );

    /** effects */
    useEffect(() => {
      const observeCb: ObservationCallback<T> = newVal => {
        setVal(newVal as ValueType | null);
      };

      this.observe(key, observeCb);

      return () => {
        this.unobserve(key, observeCb);
      };
    }, [key]);

    return [val, handleUpdateVal] as const;
  }
}
