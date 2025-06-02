import { AllObjectKeys, ObservationCallback, PropType } from './types.js';

/**
 * A totally tubular instance that tracks a top-level
 * set of keys and values.
 * if you want to support nested or "deep" state updates and observations,
 * you should construct your state to be a series of Tubular instances
 */
export class Tubular<T extends object> {
  private observationCallbacks: Map<AllObjectKeys<T>, ObservationCallback<T>[]> = new Map();

  private state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  private doSomethingToPath<K extends AllObjectKeys<T>, V = PropType<T, K & string>>(
    readPath: K,
    doSomething: (currVal: V) => V,
  ) {
    let thing: any = this.state;

    if (typeof readPath !== 'string') {
      return this.getPortionOfStateByPath(thing[readPath]);
    }

    const splitPath = readPath.split('.');

    const len = splitPath.length;
    for (let i = 0; i < len; i++) {
      const p = splitPath[i] || '';
      if (i === len - 1) {
        if (thing) thing[p] = doSomething(thing[p]);
      } else thing = thing?.[p];
    }
    for (const p of splitPath) {
      thing = thing?.[p];
    }
  }

  private getPortionOfStateByPath<K extends AllObjectKeys<T>, V = PropType<T, K & string>>(readPath: K): V | null {
    let thing: any = this.state;

    if (typeof readPath !== 'string') {
      return this.getPortionOfStateByPath(thing[readPath]);
    }

    const splitPath = readPath.split('.');

    for (const p of splitPath) {
      thing = thing?.[p];
    }

    return (thing as V) ?? null;
  }

  /**
   * observe changes to some part of state that was updated
   */
  observe<K extends AllObjectKeys<T>, V = PropType<T, K & string>>(
    propPath: K,
    observeCallback: (newVal: V, oldVal: V, propPath: K) => void,
  ) {
    const prevForPath = this.observationCallbacks.get(propPath) ?? [];
    // @ts-expect-error - silce! they are the same
    this.observationCallbacks.set(propPath, [...prevForPath, observeCallback]);
  }

  /**
   * reads a portion of your state
   */
  read<K extends AllObjectKeys<T>>(readPath: K): PropType<T, K & string> | null {
    return this.getPortionOfStateByPath(readPath);
  }

  /**
   * disconnects an observer callback from totally tubular
   */
  unobserve<K extends AllObjectKeys<T>, V = PropType<T, K & string>>(
    propPath: K,
    observeCallback: (newVal: V, oldVal: V) => void,
  ) {
    const observers = this.observationCallbacks.get(propPath);

    if (!observers?.length) return;

    this.observationCallbacks.set(
      propPath,
      observers.filter(ob => ob !== observeCallback),
    );
  }

  /**
   * updates a portion of your state
   */
  update<K extends AllObjectKeys<T>>(
    updatePath: K,
    valUpdater: (oldVal: PropType<T, K & string>) => PropType<T, K & string>,
  ) {
    const prevVal = this.read(updatePath);
    let newVal: typeof prevVal | null = null;

    this.doSomethingToPath(updatePath, oldVal => {
      const n = valUpdater(oldVal);
      newVal = n;
      return n;
    });

    // @ts-expect-error - runtime safe and solid in-IDE typing assistance, so silence as required
    this.observationCallbacks.get(updatePath)?.forEach(cb => cb(newVal, prevVal, updatePath));
  }
}
