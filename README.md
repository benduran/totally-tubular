# totally-tubular

A completely framework-agnostic, JavaScript / TypeScript state management and update broadcasting library wit zero dependencies, solid performance and a micro file size.

**Woahhhh**

## But why is there _another_ state management library? I already use XYZ library.

Great! I'm glad you found something that works for you!
This library (`totally-tubular`) was an experiment that manifested out of feeling
like state management is overcomplicated these days and often riddled with "gotchas"
and easy-to-oopsie performance faux pas.

Additionally, our shipped JavaScript bundles should be getting **smaller**, not **bigger**,
but it's all-too-easy, especially when crafting enterprise software, to keep shoving more libraries
into your bundle with questionable benefits, when there often exists a much simpler, closer-to-vanilla
way to do what you need to do.

As a final point, your state management system should be fully-portable, so if you swap out
your rendering layer, be it React, Svelte, Angular, or something else, the meat-and-potatoes of
your state management shouldn't need to be fully rewritten.

## Install

```
npm i totally-tubular --save
```

## Quick start

```typescript
import { Tubular } from "./src/totally-tubular.js";

interface MyStateShape {
  isActive: boolean;
  count: number;
  meta: {
    title: string;
  };
  name: string;
}

const initialState: MyStateShape = {
  isActive: false,
  count: 123,
  meta: {
    title: "Director",
  },
  name: "Test User",
};

const t = new Tubular(initialState);

// listen to any of the keys / values in your state object for changes
// and do whatever you need with the values
t.observe("meta.title", (newVal, oldVal, propPath) =>
  console.info(propPath, "was updated from", oldVal, "to", newVal),
);

console.info(t.read("meta.title")); // will print 'Director'

// update any of the keys / values in your state object.
// all observers will be notified after the value has been set
t.update("meta.title", (prev) => `Supreme ${prev}`);
console.info(t.read("meta.title")); // will print the updated 'Supreme Director' value
```

### React example

Since React is one of the most popular UI libraries, here is how you might mimick the vanilla example, above, but in a React application.

```tsx
import { Tubular } from "totally-tubular";
import { useEffect, useState } from "react";

interface MyState {
  permissions: {
    entitlements: string[];
  };
  time: number;
  username: string;
}

const initialState: MyState = {
  permissions: { entitlements: [] },
  username: "Test User",
  time: Date.now(),
};

const t = new Tubular<MyState>(initialState);

const getTime = (timestamp: number) => {
  const d = new Date();
  d.setTime(timestamp);
  return d.toLocaleTimeString();
};

export default function App() {
  /** state */
  const [username, setUsername] = useState(initialState.username);
  const [time, setTime] = useState(initialState.time);

  /** effects */
  useEffect(() => {
    t.observe("username", (v) => setUsername(v));
    t.observe("time", (t) => setTime(t));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => t.update("time", (oldVal) => oldVal + 1000), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <strong>User: {username}</strong>
      <div>The time: {getTime(time)}</div>
    </div>
  );
}
```

## Things you should know

- This library _does not_ support observing arbitrary indices in an array, or objects inside of an array.
  This is intentional.
  If you want to be notified of changes to an array or you want to update some item in an array, you should use the path to the array in your state object, then perform reads or transformations on that.
- This library **mutates your originally-provided `initialState`**.
  This is for performance reasons, as mutating objects doesn't require cloning and iterating on all object properties, saving on computation time.
  If you want to ensure immutability, you should make your calls to `.update()` return new objects, array, etc.

## (Extra) Synthetic Performance Benchmarks

### Machine specs

#### Apple Machine

CPU: M3 Max
RAM: 36GB
OS: MacOS Sequoia 15.5

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

#### Windows Machine

CPU: Intel i9-13900HX
RAM: 32GB
OS: Windows 11

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
