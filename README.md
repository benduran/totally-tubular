# totally-tubular

A completely framework-agnostic, JavaScript / TypeScript state management and update broadcasting library wit zero dependencies, solid performance and a micro file size.

**Woahhhh**

![Keanu in Point Break, bruh](./totally-tubular.jpg)

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

**TODO**

## Things you should know

- This library _does not_ support observing arbitrary indices in an array, or objects inside of an array.
  This is intentional.
  If you want to be notified of changes to an array or you want to update some item in an array, you should use the path to the array in your state object, then perform reads or transformations on that.
- This library **mutates your originally-provided `initialState`**.
  This is for performance reasons, as mutating objects doesn't require cloning and iterating on all object properties, saving on computation time.
  If you want to ensure immutability, you should make your calls to `.update()` return new objects, array, etc.

## (Extra) Synthetic Performance Benchmarks

### Machine specs

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
