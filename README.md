# react-create-state

The state management library I wanted to use.

```ts
import { createState } from "react-create-state";

const [useCounter, setCount] = createState(0);

const useDoubleCounter = () => {
  return useCounter((n) => n * 2);
};

const Counter = () => {
  const counter = useCounter();
  const dbl = useDoubleCounter();
  return (
    <div onClick={() => setCount((n) => n + 1)}>
      My count: {counter}
      Doubled: {dlb}
    </div>
  );
};
```
