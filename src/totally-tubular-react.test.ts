import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
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

    const { result } = renderHook(() => t.useState('drink.kind'));

    expect(result.current[0]).toBe(beer);
  });

  it('should read a value from state, update it, then read it again', () => {
    const initial = makeInitialState();
    const animals = ['dogs', 'more dogs', 'extra dogs'];
    const t = new TubularReact(initial);

    const { result, rerender } = renderHook(() => t.useState('animals'));
    expect(result.current[0]).toEqual([]);

    act(() => {
      result.current[1](animals);
    });

    rerender();
    expect(result.current[0]).toEqual(animals);
  });

  it('should read a deep-state (lol) value, update it and ensure it is properly updated', () => {
    const initial = makeInitialState();
    const t = new TubularReact(initial);

    const { result, rerender } = renderHook(() => t.useState('food.pasta'));
    expect(result.current[0]).toBeFalse();

    act(() => {
      result.current[1](prev => !prev);
    });

    rerender();
    expect(result.current[0]).toBeTrue();
  });
});
