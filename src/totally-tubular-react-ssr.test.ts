// @vitest-environment node

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  createUseTubular,
  createUseTubularReset,
  useTubular,
  useTubularReset,
} from './react.js';
import { Tubular } from './totally-tubular.js';

interface MyThing {
  drink: {
    beer: boolean;
    kind: string;
  };
}

const makeInitialState = (): MyThing => ({
  drink: {
    beer: true,
    kind: 'guiness',
  },
});

describe('server-side rendering', () => {
  it('should render the current value with useTubular', () => {
    const t = new Tubular(makeInitialState());

    function Drinks() {
      const [kind] = useTubular(t, 'drink.kind');
      return createElement('p', null, kind);
    }

    expect(renderToStaticMarkup(createElement(Drinks))).toBe('<p>guiness</p>');
  });

  it('should render the current value with a createUseTubular hook', () => {
    const t = new Tubular(makeInitialState());
    const useBoundTubular = createUseTubular(t);

    function Drinks() {
      const [kind] = useBoundTubular('drink.kind');
      return createElement('p', null, kind);
    }

    expect(renderToStaticMarkup(createElement(Drinks))).toBe('<p>guiness</p>');
  });

  it('should render a reset button using useTubularReset', () => {
    const t = new Tubular(makeInitialState());

    function ResetButton() {
      const handleReset = useTubularReset(t);
      return createElement(
        'button',
        { type: 'button', onClick: handleReset },
        'Reset',
      );
    }

    expect(renderToStaticMarkup(createElement(ResetButton))).toBe(
      '<button type="button">Reset</button>',
    );
  });

  it('should render a reset button using a createUseTubularReset hook', () => {
    const t = new Tubular(makeInitialState());
    const useBoundReset = createUseTubularReset(t);

    function ResetButton() {
      const handleReset = useBoundReset();
      return createElement(
        'button',
        { type: 'button', onClick: handleReset },
        'Reset',
      );
    }

    expect(renderToStaticMarkup(createElement(ResetButton))).toBe(
      '<button type="button">Reset</button>',
    );
  });
});
