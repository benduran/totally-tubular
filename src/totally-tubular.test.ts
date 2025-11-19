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
    t.update('animals', prev => [...prev, 'birds']);
    t.update('animals', prev => [...prev, 'cats']);
    t.update('animals', prev => [...prev, 'dogs']);
    expect(t.read('animals')).toStrictEqual(['birds', 'cats', 'dogs']);
  });

  test('should update one item in an array', () => {
    const t = new Tubular({ ...makeInitialState(), animals: ['beagle', 'corgie', 'dachshund'] });
    t.update('animals', prev => prev.toSpliced(1, 1, 'yorkie'));
    expect(t.read('animals')).toStrictEqual(['beagle', 'yorkie', 'dachshund']);
  });

  test('should observe and then disconnect', () => {
    const t = new Tubular(makeInitialState());
    const foodOb = vi.fn();
    const pizzaOb = vi.fn();
    t.observe('food.pasta', foodOb);
    t.observe('food.pizza', pizzaOb);
    t.update('food.pasta', prev => !prev);
    t.update('food.pizza', prev => !prev);
    t.unobserve('food.pasta', foodOb);
    t.update('food.pasta', prev => !prev);
    t.update('food.pizza', prev => !prev);

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
    t.update('animals', prev => [...prev, 'dogs']);
    t.update('animals', prev => [...prev, 'more dogs']);
    t.update('drink', prev => ({ ...prev, beer: false, kind: 'water' }));
    t.update('drink', prev => ({ ...prev, beer: true, kind: 'is not beer' }));
    expect(animalsOb).toHaveBeenNthCalledWith(1, ['dogs'], [], 'animals');
    expect(animalsOb).toHaveBeenNthCalledWith(2, ['dogs', 'more dogs'], ['dogs'], 'animals');
    expect(drinkOb).toHaveBeenNthCalledWith(1, { beer: false, kind: 'water' }, { beer: true, kind: 'guiness' }, 'drink');
    expect(drinkOb).toHaveBeenNthCalledWith(2, { beer: true, kind: 'is not beer' }, { beer: false, kind: 'water' }, 'drink');
  });
});
