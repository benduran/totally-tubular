import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTubular, useTubularReset } from './react.js';
import { Tubular } from './totally-tubular.js';

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

describe('useTubular', () => {
  it('should read an initial value from a Tubular instance', () => {
    const initial = makeInitialState();
    initial.drink.kind = 'Guiness 0.0%';
    const t = new Tubular(initial);

    const { result } = renderHook(() => useTubular(t, 'drink.kind'));

    expect(result.current[0]).toBe('Guiness 0.0%');
  });

  it('should update a top-level value and reflect the change', () => {
    const t = new Tubular(makeInitialState());
    const animals = ['cats', 'dogs'];

    const { result, rerender } = renderHook(() => useTubular(t, 'animals'));
    expect(result.current[0]).toEqual([]);

    act(() => {
      result.current[1](animals);
    });

    rerender();
    expect(result.current[0]).toEqual(animals);
  });

  it('should update a nested value using a callback updater', () => {
    const t = new Tubular(makeInitialState());

    const { result, rerender } = renderHook(() => useTubular(t, 'food.pasta'));
    expect(result.current[0]).toBeFalsy();

    act(() => {
      result.current[1]((prev) => !prev);
    });

    rerender();
    expect(result.current[0]).toBeTruthy();
  });

  it('should notify all hooks observing the same key when one updates', () => {
    const t = new Tubular(makeInitialState());

    const { result: resultA, rerender: rerenderA } = renderHook(() =>
      useTubular(t, 'drink.beer'),
    );
    const { result: resultB, rerender: rerenderB } = renderHook(() =>
      useTubular(t, 'drink.beer'),
    );

    expect(resultA.current[0]).toBeTruthy();
    expect(resultB.current[0]).toBeTruthy();

    act(() => {
      resultA.current[1](false);
    });

    rerenderA();
    rerenderB();
    expect(resultA.current[0]).toBeFalsy();
    expect(resultB.current[0]).toBeFalsy();
  });

  it('should unobserve when the hook unmounts', () => {
    const t = new Tubular(makeInitialState());

    const { result, unmount } = renderHook(() => useTubular(t, 'drink.kind'));

    expect(result.current[0]).toBe('guiness');

    unmount();

    // Update after unmount — the store still works, but the unmounted hook
    // should no longer be observing so no "update on unmounted component" error occurs.
    act(() => {
      t.update('drink.kind', () => 'stella');
    });

    // Verify the store update took effect via a fresh hook instance.
    const { result: freshResult } = renderHook(() =>
      useTubular(t, 'drink.kind'),
    );
    expect(freshResult.current[0]).toBe('stella');
  });
});

describe('useTubularReset', () => {
  it('should restore the initial value after an update', () => {
    const t = new Tubular(makeInitialState());

    const { result, rerender } = renderHook(() => useTubular(t, 'drink.kind'));

    act(() => {
      result.current[1]('water');
    });
    rerender();
    expect(result.current[0]).toBe('water');

    const { result: resetResult } = renderHook(() => useTubularReset(t));

    act(() => {
      resetResult.current();
    });
    rerender();
    expect(result.current[0]).toBe('guiness');
  });

  it('should notify all hooks observing different keys', () => {
    const t = new Tubular(makeInitialState());

    const { result: drinkResult, rerender: rerenderDrink } = renderHook(() =>
      useTubular(t, 'drink.kind'),
    );
    const { result: pizzaResult, rerender: rerenderPizza } = renderHook(() =>
      useTubular(t, 'food.pizza'),
    );
    const { result: resetResult } = renderHook(() => useTubularReset(t));

    act(() => {
      drinkResult.current[1]('water');
      pizzaResult.current[1](false);
    });
    rerenderDrink();
    rerenderPizza();
    expect(drinkResult.current[0]).toBe('water');
    expect(pizzaResult.current[0]).toBeFalsy();

    act(() => {
      resetResult.current();
    });
    rerenderDrink();
    rerenderPizza();
    expect(drinkResult.current[0]).toBe('guiness');
    expect(pizzaResult.current[0]).toBeTruthy();
  });

  it('should not change values when nothing was updated', () => {
    const t = new Tubular(makeInitialState());

    const { result, rerender } = renderHook(() => useTubular(t, 'drink.kind'));
    const { result: resetResult } = renderHook(() => useTubularReset(t));

    act(() => {
      resetResult.current();
    });
    rerender();
    expect(result.current[0]).toBe('guiness');
  });

  it('should restore arrays to their initial value', () => {
    const state = {
      ...makeInitialState(),
      animals: ['beagle', 'corgie'] as string[],
    };
    const t = new Tubular(state);

    const { result, rerender } = renderHook(() => useTubular(t, 'animals'));
    const { result: resetResult } = renderHook(() => useTubularReset(t));

    act(() => {
      result.current[1](['yorkie']);
    });
    rerender();
    expect(result.current[0]).toEqual(['yorkie']);

    act(() => {
      resetResult.current();
    });
    rerender();
    expect(result.current[0]).toEqual(['beagle', 'corgie']);
  });

  it('should return a stable callback across re-renders', () => {
    const t = new Tubular(makeInitialState());

    const { result, rerender } = renderHook(() => useTubularReset(t));
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);
  });

  it('should allow updates after reset', () => {
    const t = new Tubular(makeInitialState());

    const { result, rerender } = renderHook(() => useTubular(t, 'drink.kind'));
    const { result: resetResult } = renderHook(() => useTubularReset(t));

    act(() => {
      result.current[1]('water');
    });
    rerender();
    expect(result.current[0]).toBe('water');

    act(() => {
      resetResult.current();
    });
    rerender();
    expect(result.current[0]).toBe('guiness');

    act(() => {
      result.current[1]('corona');
    });
    rerender();
    expect(result.current[0]).toBe('corona');
  });
});
