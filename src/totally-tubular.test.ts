import { describe, expect, test, vi } from 'vitest';

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

describe('totally-tubular', () => {
  test('should update one single property', () => {
    const t = new Tubular(makeInitialState());
    const newVal = 'old speckled hen';
    t.update('drink.kind', () => newVal);
    expect(t.read('drink.kind')).toBe(newVal);
  });

  test('should ensure update is called multiple times', () => {
    const t = new Tubular(makeInitialState());
    const initialBeer = t.read('drink.kind');

    const v1 = 'ginger beer';
    const v2 = 'corona';
    const v3 = "London's Pride";

    const ob = vi.fn();

    t.observe('drink.kind', ob);
    t.update('drink.kind', () => v1);
    t.update('drink.kind', () => v2);
    t.update('drink.kind', () => v3);

    expect(ob).toHaveBeenNthCalledWith(1, v1, initialBeer, 'drink.kind');
    expect(ob).toHaveBeenNthCalledWith(2, v2, v1, 'drink.kind');
    expect(ob).toHaveBeenNthCalledWith(3, v3, v2, 'drink.kind');
  });

  test('should update an array', () => {
    const t = new Tubular(makeInitialState());
    t.update('animals', (prev) => [...prev, 'birds']);
    t.update('animals', (prev) => [...prev, 'cats']);
    t.update('animals', (prev) => [...prev, 'dogs']);
    expect(t.read('animals')).toStrictEqual(['birds', 'cats', 'dogs']);
  });

  test('should update one item in an array', () => {
    const t = new Tubular({
      ...makeInitialState(),
      animals: ['beagle', 'corgie', 'dachshund'],
    });
    t.update('animals', (prev) => prev.toSpliced(1, 1, 'yorkie'));
    expect(t.read('animals')).toStrictEqual(['beagle', 'yorkie', 'dachshund']);
  });

  test('should observe and then disconnect', () => {
    const t = new Tubular(makeInitialState());
    const foodOb = vi.fn();
    const pizzaOb = vi.fn();
    t.observe('food.pasta', foodOb);
    t.observe('food.pizza', pizzaOb);
    t.update('food.pasta', (prev) => !prev);
    t.update('food.pizza', (prev) => !prev);
    t.unobserve('food.pasta', foodOb);
    t.update('food.pasta', (prev) => !prev);
    t.update('food.pizza', (prev) => !prev);

    expect(t.read('food.pasta')).toBeFalsy();
    expect(t.read('food.pizza')).toBeTruthy();
    expect(foodOb).toHaveBeenCalledTimes(1);
    expect(pizzaOb).toHaveBeenCalledTimes(2);
  });

  test('should observe an array and object', () => {
    const t = new Tubular(makeInitialState());
    const animalsOb = vi.fn();
    const drinkOb = vi.fn();
    t.observe('animals', animalsOb);
    t.observe('drink', drinkOb);
    t.update('animals', (prev) => [...prev, 'dogs']);
    t.update('animals', (prev) => [...prev, 'more dogs']);
    t.update('drink', (prev) => ({ ...prev, beer: false, kind: 'water' }));
    t.update('drink', (prev) => ({ ...prev, beer: true, kind: 'is not beer' }));
    expect(animalsOb).toHaveBeenNthCalledWith(1, ['dogs'], [], 'animals');
    expect(animalsOb).toHaveBeenNthCalledWith(
      2,
      ['dogs', 'more dogs'],
      ['dogs'],
      'animals',
    );
    expect(drinkOb).toHaveBeenNthCalledWith(
      1,
      { beer: false, kind: 'water' },
      { beer: true, kind: 'guiness' },
      'drink',
    );
    expect(drinkOb).toHaveBeenNthCalledWith(
      2,
      { beer: true, kind: 'is not beer' },
      { beer: false, kind: 'water' },
      'drink',
    );
  });
});

describe('reset', () => {
  test('should restore top-level primitives after updates', () => {
    const t = new Tubular(makeInitialState());
    t.update('drink.kind', () => 'water');
    t.update('food.pizza', () => false);
    t.reset();
    expect(t.read('drink.kind')).toBe('guiness');
    expect(t.read('food.pizza')).toBe(true);
  });

  test('should restore nested objects after whole-object replacement', () => {
    const t = new Tubular(makeInitialState());
    t.update('drink', () => ({ beer: false, kind: 'water' }));
    t.reset();
    expect(t.read('drink')).toStrictEqual({ beer: true, kind: 'guiness' });
    expect(t.read('drink.beer')).toBe(true);
    expect(t.read('drink.kind')).toBe('guiness');
  });

  test('should restore arrays with initial values', () => {
    const state = {
      ...makeInitialState(),
      animals: ['beagle', 'corgie', 'dachshund'] as string[],
    };
    const t = new Tubular(state);
    t.update('animals', (prev) => [...prev, 'yorkie']);
    t.update('animals', (prev) => prev.toSpliced(1, 1));
    t.reset();
    expect(t.read('animals')).toStrictEqual(['beagle', 'corgie', 'dachshund']);
  });

  test('should restore empty arrays', () => {
    const t = new Tubular(makeInitialState());
    t.update('animals', (prev) => [...prev, 'dogs']);
    t.reset();
    expect(t.read('animals')).toStrictEqual([]);
  });

  test('should notify observers on reset', () => {
    const t = new Tubular(makeInitialState());
    const drinkOb = vi.fn();
    const pizzaOb = vi.fn();
    t.observe('drink.kind', drinkOb);
    t.observe('food.pizza', pizzaOb);
    t.update('drink.kind', () => 'water');
    t.update('food.pizza', () => false);
    t.reset();
    expect(drinkOb).toHaveBeenNthCalledWith(
      2,
      'guiness',
      'water',
      'drink.kind',
    );
    expect(pizzaOb).toHaveBeenNthCalledWith(
      2,
      true,
      false,
      'food.pizza',
    );
  });

  test('should be idempotent', () => {
    const t = new Tubular(makeInitialState());
    t.update('drink.kind', () => 'water');
    t.reset();
    t.reset();
    expect(t.read('drink.kind')).toBe('guiness');
    expect(t.read('food.pizza')).toBe(true);
  });

  test('should restore all paths after multiple different updates', () => {
    const t = new Tubular(makeInitialState());
    t.update('drink.kind', () => 'water');
    t.update('food.pizza', () => false);
    t.update('food.pasta', () => true);
    t.update('animals', () => ['dogs']);
    t.reset();
    expect(t.read('drink.kind')).toBe('guiness');
    expect(t.read('food.pizza')).toBe(true);
    expect(t.read('food.pasta')).toBe(false);
    expect(t.read('animals')).toStrictEqual([]);
  });

  test('should work with empty initial state', () => {
    const t = new Tubular<Record<string, never>>({});
    expect(() => t.reset()).not.toThrow();
  });

  test('should restore deeply nested objects', () => {
    interface DeepThing {
      a: { b: { c: { d: string } } };
    }
    const initialState: DeepThing = { a: { b: { c: { d: 'hello' } } } };
    const t = new Tubular(initialState);
    t.update('a.b.c.d', () => 'world');
    expect(t.read('a.b.c.d')).toBe('world');
    t.reset();
    expect(t.read('a.b.c.d')).toBe('hello');
  });

  test('should allow updates after reset', () => {
    const t = new Tubular(makeInitialState());
    t.update('drink.kind', () => 'water');
    t.reset();
    t.update('drink.kind', () => 'corona');
    expect(t.read('drink.kind')).toBe('corona');
  });

  test('observers should still fire after reset', () => {
    const t = new Tubular(makeInitialState());
    const ob = vi.fn();
    t.observe('drink.kind', ob);
    t.update('drink.kind', () => 'water');
    t.reset();
    t.update('drink.kind', () => 'corona');
    expect(ob).toHaveBeenCalledTimes(3);
    expect(ob).toHaveBeenNthCalledWith(
      3,
      'corona',
      'guiness',
      'drink.kind',
    );
  });
});
