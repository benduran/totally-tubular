/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Tubular } from './totally-tubular.js';
import { AllObjectKeys, ObservationCallback } from './types.js';

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
    /** state */
    const [val, setVal] = useState(this.read(key));

    /** refs */
    const prevVal = useRef<typeof val>(null);

    /** callbacks */
    const handleUpdateVal = useCallback((newValOrCallback: typeof val | ((prevVal: typeof val) => typeof val)) => {
      if (typeof newValOrCallback === 'function') {
        // @ts-expect-error - ts is extremely confused by this and doesn't know this is a function
        const newVal = newValOrCallback(prevVal.current);
        setVal(newVal as typeof val);
        return;
      }
      setVal(newValOrCallback);
    }, []);

    /** effects */
    useEffect(() => {
      const observeCb: ObservationCallback<T> = newVal => {
        setVal(newVal as typeof val);
      };

      this.observe(key, observeCb);

      return () => {
        this.unobserve(key, observeCb);
      };
    }, [key]);

    return useMemo(() => [val, handleUpdateVal], [val, handleUpdateVal]);
  }
}
