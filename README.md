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

A `Tubular` instance wraps an object and gives you five things:

| Method | What it does |
|---|---|
| `read(path)` | Returns the current value at a dot-separated path |
| `update(path, fn)` | Calls `fn` with the current value, stores the return value, then notifies all observers |
| `observe(path, fn)` | Registers a callback that fires whenever `path` is updated |
| `unobserve(path, fn)` | Removes a previously registered callback |
| `reset()` | Restores every key to its initial value and notifies all observers of each change |

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

## Resetting state

Call `reset()` to restore your entire state back to the value you passed to the constructor. Every updated key is restored and every registered observer fires with the new (initial) value.

```typescript
const store = new Tubular({
  name: "Alice",
  count: 0,
  settings: { theme: "light" },
});

store.update("name", () => "Bob");
store.update("count", (prev) => prev + 1);
store.update("settings.theme", () => "dark");

store.observe("name", (newVal, oldVal) => {
  console.log(`name: ${oldVal} -> ${newVal}`);
});

store.reset();
// Logs: name: Bob -> Alice
// Reads back: "Alice", 0, { theme: "light" }
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

### Resetting from React

Import `useTubularReset` from `totally-tubular/react`. It returns a stable
callback that restores the store to its initial state. Every `useTubular` hook
watching the store re-renders with the restored value.

```tsx
import { useTubularReset } from "totally-tubular/react";

function ResetButton() {
  const handleReset = useTubularReset(store);
  return <button onClick={handleReset}>Reset</button>;
}
```

The callback identity never changes, so it's safe to pass directly as an event
handler or as a dependency to `useEffect`.

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

1,000 updates to "name" string val with 10 observers: 0.004451624999999993s
1,000 updates to "name" string val with 100 observers: 0.0014582920000000001s
1,000 updates to "name" string val with 1000 observers: 0.0038668329999999996s
10,000 updates to "name" string val with 10 observers: 0.002263458s
10,000 updates to "name" string val with 100 observers: 0.0027686669999999938s
10,000 updates to "name" string val with 1000 observers: 0.010021957999999997s
100,000 updates to "name" string val with 10 observers: 0.009292833000000002s
100,000 updates to "name" string val with 100 observers: 0.018003167000000004s
100,000 updates to "name" string val with 1000 observers: 0.09387937499999999s
1,000,000 updates to "name" string val with 10 observers: 0.11707874999999998s
1,000,000 updates to "name" string val with 100 observers: 0.18760720800000003s
1,000,000 updates to "name" string val with 1000 observers: 0.953406333s

-----medium state object-----

1,000 updates to "user.settings.theme" string val with 10 observers: 0.0004967080000001261s
1,000 updates to "user.settings.theme" string val with 100 observers: 0.0005447920000001431s
1,000 updates to "user.settings.theme" string val with 1000 observers: 0.002648750000000064s
10,000 updates to "user.settings.theme" string val with 10 observers: 0.0015272500000000945s
10,000 updates to "user.settings.theme" string val with 100 observers: 0.0019369999999998982s
10,000 updates to "user.settings.theme" string val with 1000 observers: 0.009341458000000103s
100,000 updates to "user.settings.theme" string val with 10 observers: 0.010589375000000019s
100,000 updates to "user.settings.theme" string val with 100 observers: 0.018273999999999888s
100,000 updates to "user.settings.theme" string val with 1000 observers: 0.09421074999999997s
1,000,000 updates to "user.settings.theme" string val with 10 observers: 0.12160291699999994s
1,000,000 updates to "user.settings.theme" string val with 100 observers: 0.17455837500000007s
1,000,000 updates to "user.settings.theme" string val with 1000 observers: 0.9426468749999999s

-----deep state object-----

1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.0002659169999997175s
1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.00025624999999990906s
1,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.0009017499999999927s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.0015940000000000509s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.002409874999999829s
10,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.009845749999999953s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.017372292000000015s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.02954466599999978s
100,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.10030825000000004s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 10 observers: 0.1631335829999998s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 100 observers: 0.250552416s
1,000,000 updates to "zdeepSettings.level1.level2.level3.level4.level5.level6.currentValue" string val with 1000 observers: 0.9988650829999997s
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
