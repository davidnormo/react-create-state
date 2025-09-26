# react-create-state

![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-create-state)

The state management library I wanted to use. No signals, no wrappers. Just getting and setting the state.

```ts
import { createState } from "react-create-state";

const [useCounter, setCount] = createState(0);

const useDoubleCounter = () => {
  return useCounter((n) => n * 2);
};

const Counter = () => {
  const counter: number = useCounter();
  const dbl: number = useDoubleCounter();
  return (
    <div onClick={() => setCount((n) => n + 1)}>
      My count: {counter}
      Doubled: {dlb}
    </div>
  );
};
```

## Compared

|                          |           react-create-state            |                Zustand                 |                Jotai                 |        react-use `createGlobalState`         |
| ------------------------ | :-------------------------------------: | :------------------------------------: | :----------------------------------: | :------------------------------------------: |
| Size                     |                  490B                   |                  603B                  |                4.3KB                 |                    22KB\*                    |
| React hook               |                   ✅                    |                   ✅                   |                  ✅                  |                      ✅                      |
| Memoisation              |                   ✅                    |                   ✅                   |                  ✅                  |                      ❌                      |
| Globally accessible      |                   ✅                    |                   ✅                   |                  ✅                  |                      ❌                      |
| Update outside component |                   ✅                    |                   ✅                   |                  ✅                  |                      ❌                      |
| Peeking                  |                   ✅                    |                   ✅                   |                  ✅                  |                      ❌                      |
| Subscriptions            |                   ✅                    |                   ✅                   |                  ✅                  |                      ❌                      |
| async/promises           |                   ✅                    |                   ✅                   |                  ✅                  |                      ✅                      |
| SSR                      |                   ✅                    |                   ✅                   |                  ✅                  |                      ❌                      |
| Learning Curve           | <span style="color:green">Gentle</span> | <span style="color:yellow">Mild</span> | <span style="color:red">Steep</span> | <span style="color:green">Very Gentle</span> |
| Ergonomics\*\*           |                Pleasant                 |              Bit Awkward               |              Functional              |                    Simple                    |

\* Requires installing whole of the react-use package<br />
\*\* How easy it is to use and write code with. This is quite subjective depending on your experience and preference

## API

### `createState(state) => [useState, setState, getState, subscribe]`

The `createState` function initialises some new global state. Call this function outside of React components (or render functions).

The functions returned are documented below.

#### `useState`

```ts
const [useState] = createState({ a: { b: { c: "foo" } } });
```

React hook that returns the current state. When the state changes, the component will rerender.

```ts
const state = useState(); // { a: { b: { c: 'foo' } } }
```

It can be called with a selector function. Only when the return value of the selector changes will the component be re-rendered. I.e. the selector is memoised.

```ts
const c = useState((state) => state.a.b.c); // 'foo'
```

You can also depend on other values with a deps array:

```ts
let [greeting, setGreeting] = React.useState("Hello");
const msg = useState((state) => `${greeting} ${state.a.b.c}`, [greeting]);

msg; // 'Hello foo'

// Later...
setGreeting("Howdy");

// `msg` will update because `greeting` is in it's deps array
msg; // 'Howdy foo'
```

#### `setState`

State is updated by calling this function either with a new value or a function that takes the previous state and returns the new state.

```ts
const [useState, setState] = createState({ a: { b: { c: "foo" } } });

setState({ something: "foo" });
// or
setState((state) => ({ something: state.a.b.c }));
```

State must not be mutated. Always return new references if a value has changed.

```ts
setState((state) => ({
  ...state,
  a: {
    ...state.a,
    b: {
      ...state.a.b,
      c: "bar",
    },
  },
}));
```

This kind of immutable updates can be tiring to write so you can make use of libraries like [lodash-redux-immutability](https://github.com/sarink/lodash-redux-immutability).

```ts
setState((state) => updateIn(state, ["a", "b", "c"], "bar"));
```

You could also use [Immer](https://immerjs.github.io/immer/) but there are some [pitfalls](https://immerjs.github.io/immer/pitfalls/).

#### `getState`

Returns the current value of the state. This function can be used wherever, inside or outside a component.

```ts
const [useState, setState, getState] = createState({ a: { b: { c: "foo" } } });

const {
  a: { b },
} = getState();
console.log(b.c); // 'foo'
```

This can be handy for accessing the value of the state inside a `useEffect` without depending on the value. E.g.

```ts
const MyComponent = ({ myProp }: { myProp: string }) => {
  useEffect(() => {
    // triggered when `myProp` changes but not when the state does
    doSomething(getState());
  }, [myProp]);

  //...
};
```

#### `subscribe`

You subscribe to state changes without the `useState` hook. Subscribers are synchronously called with the current value of the state. And called for all subsequent updates. There is no guarantee which order subscribers are called in.

It returns an unsubscribe function that synchronously removes the subscription.

```ts
const [useState, setState, getState, subscribe] = createState("foo");

const unsub = subscribe((state) => {
  console.log(state);
}); // 'foo' logged

setState("bar"); // 'bar' logged

unsub();

setState("baz"); // 'baz' not logged
```

Subscriptions are useful for a number of cases:

- if you are working outside a React application
- you want to persist the state to localStorage or elsewhere
- for logging or analytic purposes

### `reinitializeAll`

This function sets all instances of `createState` back to the initial value. This is useful for unit tests to isolate each case or during SSR so each request gets the starting state.

```ts
import { createState, reinitializeAll } from "react-create-state";

const [, setNum, getNum] = createState(0);
const [, setStr, getStr] = createState("foo");
const [, setBool, getBool] = createState(true);

setNum(1);
setStr("bar");
setBool(false);

reinitializeAll();

getNum(); // 0
getStr(); // 'foo'
getBool(); // true
```

All subscriptions (including `useState` hooks) are called with the initial values.
