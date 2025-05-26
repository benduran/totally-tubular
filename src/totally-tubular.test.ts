import { describe, expect, test } from 'vitest';

import { Tubular } from './totally-tubular.js';

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

describe('totally-tubular', () => {
  test('should update one single property', () => {
    const t = new Tubular(initialState);
    const newVal = 'old speckled hen';
    t.update('drink.kind', () => newVal);
    expect(t.read('drink.kind')).toBe(newVal);
  });
});
