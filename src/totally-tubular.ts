import { AllObjectKeys, PropType } from './types.js';

/**
 * A totally tubular instance that tracks a top-level
 * set of keys and values.
 * if you want to support nested or "deep" state updates and observations,
 * you should construct your state to be a series of Tubular instances
 */
export class Tubular<T extends object> {
  private state: T;

  constructor(initialState: T) {
    this.state = initialState;
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
   * reads a portion of your state
   */
  read<K extends AllObjectKeys<T>>(readPath: K): PropType<T, K & string> | null {
    return this.getPortionOfStateByPath(readPath);
  }

  /**
   * updates a portion of your state
   */
  update<K extends AllObjectKeys<T>>(updatePath: K, val: PropType<T, K & string>) {}
}
interface MyThing {
  drink: {
    beer: boolean;
    kind: string;
  };
  food: {
    pasta: boolean;
    pizza: boolean;
  };
}

const initialState: MyThing = {
  drink: {
    beer: true,
    kind: 'guiness',
  },
  food: {
    pasta: false,
    pizza: true,
  },
};

const t = new Tubular(initialState);

console.info(t.read('drink2.kind'));
