# react-state

The state management library I wanted to use.

```ts
const [useCounter, setCount] = createState(0);

const useDoubleCounter = () => {
  return useCounter(n => n * 2)
}

const Counter = () => {
  const counter = useCounter(n => n);
  const dbl = useDoubleCounter();
  return (
    <div onClick={() => setCount(n => n + 1)}>
      My count: {counter}
      Doubled: {dlb}
    </div>
  );
}
```

