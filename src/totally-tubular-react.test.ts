import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TubularReact } from './totally-tubular-react.js';

describe('TubularReact', () => {
  interface MyThing {
  animals: string[];
  drink: {
    beer: boolean;
    kind: string;
  };
  food: {
    pasta: boolean;
    pizza: boolean;
  };
}

const makeInitialState = (): MyThing => ({
  animals: [],
  drink: {
    beer: true,
    kind: 'guiness',
  },
  food: {
    pasta: false,
    pizza: true,
  },
});

  it('should read a value from state', () => {
    const initial = makeInitialState();
    const beer = 'Guiness 0.0%';
    initial.drink.kind = beer;

    const t = new TubularReact(initial);

    const { result } = renderHook(() => t.useState('drink.beer'));

    expect(result.current[0]).toBe(beer);
  });
});
