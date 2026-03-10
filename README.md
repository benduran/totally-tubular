# totally-tubular

A framework-agnostic JavaScript / TypeScript state management library with zero dependencies, a tiny file size, and solid performance.

## Why another state management library?

State management has a tendency to get complicated fast. This library is an experiment in keeping things simple:

- **Portable.** Your store is plain TypeScript. If you swap React for Svelte, or add a Node.js background worker, the store itself doesn't change.
- **Small.** No framework coupling, no middleware pipeline, no magic — just a class that holds state, lets you read it, update it, and watch it for changes.
- **Honest.** It mutates your state in place for performance. If you want immutability, return new objects from your updater functions.

## Install

```
npm i totally-tubular --save
```

## Core concepts

A `Tubular` instance wraps an object and gives you four things:

| Method | What it does |
|---|---|
| `read(path)` | Returns the current value at a dot-separated path |
| `update(path, fn)` | Calls `fn` with the current value, stores the return value, then notifies all observers |
| `observe(path, fn)` | Registers a callback that fires whenever `path` is updated |
| `unobserve(path, fn)` | Removes a previously registered callback |

Paths are fully type-checked. TypeScript knows every valid dot-path into your state shape, so you get autocomplete and a compile error if you mistype a key.

## Quick start

```typescript
import { Tubular } from "totally-tubular";

interface AppState {
  isActive: boolean;
  count: number;
  meta: {
    title: string;
  };
  name: string;
}

const store = new Tubular<AppState>({
  isActive: false,
  count: 123,
  meta: { title: "Director" },
  name: "Test User",
});

// Watch a value for changes
store.observe("meta.title", (newVal, oldVal) =>
  console.info("title changed from", oldVal, "to", newVal),
);

console.info(store.read("meta.title")); // "Director"

// Update a value — all observers are notified immediately after
store.update("meta.title", (prev) => `Supreme ${prev}`);

console.info(store.read("meta.title")); // "Supreme Director"
```

## React

Import `useTubular` from `totally-tubular/react`. It works exactly like React's
built-in `useState` — you get back a `[value, setter]` tuple — except the value
comes from your store and every component watching the same path re-renders when
it changes.

```tsx
import { Tubular } from "totally-tubular";
import { useTubular } from "totally-tubular/react";

interface AppState {
  user: { name: string };
  count: number;
}

// Create the store once, outside your components
const store = new Tubular<AppState>({
  user: { name: "Alice" },
  count: 0,
});

function Counter() {
  const [count, setCount] = useTubular(store, "count");

  return (
    <button onClick={() => setCount((n) => (n ?? 0) + 1)}>
      Clicked {count} times
    </button>
  );
}

function Greeting() {
  // Read-only — just destructure the first element
  const [name] = useTubular(store, "user.name");
  return <p>Hello, {name}!</p>;
}
```

The setter accepts either a plain value or an updater function:

```ts
// Plain value
setCount(10);

// Updater function (receives the current value)
setCount((prev) => (prev ?? 0) + 1);
```

`useTubular` automatically unsubscribes when the component unmounts, so you
don't need to manage cleanup yourself.

## Things you should know

- **Arrays and nested objects are observed at their path, not their contents.**
  `observe("items", fn)` fires when `items` itself is replaced. To add an item
  to an array, use `update("items", prev => [...prev, newItem])`.
- **Arbitrary array indices are not observable.** You cannot do `observe("items.0", fn)`. If you need per-item reactivity, store each item in its own `Tubular` instance.
- **State is mutated in place.** `totally-tubular` does not clone your state on every update. This keeps things fast, but means the object you pass to `new Tubular(initialState)` will be modified directly. If that matters to you, pass a deep clone as the initial state.

## Performance benchmarks

### Apple M3 Max · 36 GB RAM · macOS Sequoia 15.5

```
-----shallow state object-----

1,000 updates to "name" string val with 10 observers: 0.0036749580000000038s
1,000 updates to "name" string val with 100 observers: 0.0004760830000000027s
1,000 updates to "name" string val with 1000 observers: 0.002774291000000005s
10,000 updates to "name" string val with 10 observers: 0.0014766249999999986s
10,000 updates to "name" string val with 100 observers: 0.0023700000000000045s
10,000 updates to "name" string val with 1000 observers: 0.010886792s
100,000 updates to "name" string val with 10 observers: 0.012480834000000001s
100,000 updates to "name" string val with 100 observers: 0.022641292000000007s
100,000 updates to "name" string val with 1000 observers: 0.102325125s
1,000,000 updates to "name" string val with 10 observers: 0.16086666700000002s
1,000,000 updates to "name" string val with 100 observers: 0.26716437499999995s
1,000,000 updates to "name" string val with 1000 observers: 1.0726739170000001s

-----medium state object-----

1,000 updates to "user.settings.theme" string val with 10 observers: 0.000344333000000006s
1,000 updates to "user.settings.theme" string val with 100 observers: 0.00034458300000005695s
1,000 updates to "user.settings.theme" string val with 1000 observers: 0.0011382089999999608s
10,000 updates to "user.settings.theme" string val with 10 observers: 0.0012657919999999195s
10,000 updates to "user.settings.theme" string val with 100 observers: 0.002091625000000022s
10,000 updates to "user.settings.theme" string val with 1000 observers: 0.010777082999999948s
100,000 updates to "user.settings.theme" string val with 10 observers: 0.009487583000000086s
100,000 updates to "user.settings.theme" string val with 100 observers: 0.01902945799999998s
100,000 updates to "user.settings.theme" string val with 1000 observers: 0.11656079100000011s
1,000,000 updates to "user.settings.theme" string val with 10 observers: 0.14811841699999992s
1,000,000 updates to "user.settings.theme" string val with 100 observers: 0.27773633299999984s
1,000,000 updates to "user.settings.theme" string val with 1000 observers: 1.0240415829999998s

-----deep state object-----

1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.0012417919999998049s
1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.0003201250000001892s
1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.0011683750000001964s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.0014113330000000133s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.002289249999999811s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.01099350000000004s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.014709209000000101s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.024220374999999877s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.10777845800000023s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.22398191699999961s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.2829787500000002s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 1.1015419579999999s
```

### Intel i9-13900HX · 32 GB RAM · Windows 11

```
-----shallow state object-----

1,000 updates to "name" string val with 10 observers: 0.0046989000000000015s
1,000 updates to "name" string val with 100 observers: 0.0009328000000000003s
1,000 updates to "name" string val with 1000 observers: 0.0012964000000000055s
10,000 updates to "name" string val with 10 observers: 0.002852000000000004s
10,000 updates to "name" string val with 100 observers: 0.003517799999999994s
10,000 updates to "name" string val with 1000 observers: 0.012490899999999996s
100,000 updates to "name" string val with 10 observers: 0.0199987s
100,000 updates to "name" string val with 100 observers: 0.03123379999999999s
100,000 updates to "name" string val with 1000 observers: 0.1196829s
1,000,000 updates to "name" string val with 10 observers: 0.2171915s
1,000,000 updates to "name" string val with 100 observers: 0.24709929999999997s
1,000,000 updates to "name" string val with 1000 observers: 1.1660891999999998s

-----medium state object-----

1,000 updates to "user.settings.theme" string val with 10 observers: 0.0007828999999999269s
1,000 updates to "user.settings.theme" string val with 100 observers: 0.0004992999999999483s
1,000 updates to "user.settings.theme" string val with 1000 observers: 0.0013275000000001s
10,000 updates to "user.settings.theme" string val with 10 observers: 0.0032917999999999667s
10,000 updates to "user.settings.theme" string val with 100 observers: 0.004183099999999967s
10,000 updates to "user.settings.theme" string val with 1000 observers: 0.012704099999999927s
100,000 updates to "user.settings.theme" string val with 10 observers: 0.023384700000000067s
100,000 updates to "user.settings.theme" string val with 100 observers: 0.03393959999999993s
100,000 updates to "user.settings.theme" string val with 1000 observers: 0.1242770999999998s
1,000,000 updates to "user.settings.theme" string val with 10 observers: 0.23742110000000002s
1,000,000 updates to "user.settings.theme" string val with 100 observers: 0.26894860000000015s
1,000,000 updates to "user.settings.theme" string val with 1000 observers: 1.2531396s

-----deep state object-----

1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.0003414999999999964s
1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.00033490000000028884s
1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.0016161000000001877s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.0022989000000002307s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.0037910000000001675s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.014288300000000163s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.025205199999999876s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.03601400000000012s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.13781609999999955s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.27891269999999985s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.36865729999999985s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 1.3965289000000003s
```
