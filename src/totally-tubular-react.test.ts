import { describe, expect, it } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { Tubular } from './totally-tubular.js';
import { useTubular } from './totally-tubular-react.js';

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
    expect(result.current[0]).toBeFalse();

    act(() => {
      result.current[1]((prev) => !prev);
    });

    rerender();
    expect(result.current[0]).toBeTrue();
  });

  it('should notify all hooks observing the same key when one updates', () => {
    const t = new Tubular(makeInitialState());

    const { result: resultA, rerender: rerenderA } = renderHook(() =>
      useTubular(t, 'drink.beer'),
    );
    const { result: resultB, rerender: rerenderB } = renderHook(() =>
      useTubular(t, 'drink.beer'),
    );

    expect(resultA.current[0]).toBeTrue();
    expect(resultB.current[0]).toBeTrue();

    act(() => {
      resultA.current[1](false);
    });

    rerenderA();
    rerenderB();
    expect(resultA.current[0]).toBeFalse();
    expect(resultB.current[0]).toBeFalse();
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
