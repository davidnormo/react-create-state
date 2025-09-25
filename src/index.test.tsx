import React from "react";
import { act, render, renderHook, screen } from "@testing-library/react";
import { createState } from "./index";

const [useState, setState, getState, subscribe] = createState(0);

const TestComponent = () => {
  const state = useState();
  return (
    <div>
      <span data-testid="state">{state}</span>
    </div>
  );
};

it("useState - get value with no selector", () => {
  const { result } = renderHook(() => useState());
  expect(result.current).toBe(0);
});

it("useState - get value with selector", () => {
  const { result } = renderHook(() => useState((x) => x));
  expect(result.current).toBe(0);
});

it("useState - get value with deps", () => {
  let a = 1;
  const { result, rerender } = renderHook(() => useState((x) => x + a, [a]));

  a = 2;
  expect(result.current).toBe(1);

  rerender();
  expect(result.current).toBe(2);
});

it("useState + setState - get value with deps", () => {
  let a = 1;
  const { result } = renderHook(() => useState((x) => x + a, [a]));

  a = 2;
  expect(result.current).toBe(1);

  act(() => {
    setState(2);
  });

  expect(result.current).toBe(4);
});

it("useState - get updated value", () => {
  const { result } = renderHook(() => useState());

  act(() => {
    setState(1);
  });

  expect(result.current).toBe(1);
});

it("setState with function", () => {
  setState(10);
  const { result } = renderHook(() => useState());

  act(() => {
    setState((x) => x + 1);
  });

  expect(result.current).toBe(11);
});

it("TestComponent - render with initial state", () => {
  setState(0);
  render(<TestComponent />);
  expect(screen.getByTestId("state").textContent).toBe("0");
});

it("getState", () => {
  expect(getState()).toBe(0);
  setState(1);
  expect(getState()).toBe(1);
});

it("encapsulation", () => {
  setState(1);
  const useDoubleState = () => {
    return useState((x) => x * 2);
  };

  const { result } = renderHook(() => useDoubleState());

  expect(result.current).toBe(2);
});

it("encapsulation - stringified", () => {
  setState(1);
  const useStrState = () => {
    return useState((x) => `num: ${x}`);
  };

  const { result } = renderHook(() => useStrState());

  expect(result.current).toBe("num: 1");
});

it("no zombie children allowed", () => {
  setState(0);
  const Parent = () => {
    const value = useState();

    return (
      <div>
        <span data-testid="parent">{value}</span>
        <TestComponent />
      </div>
    );
  };

  render(<Parent />);

  expect(screen.getByTestId("parent").textContent).toBe("0");
  expect(screen.getByTestId("state").textContent).toBe("0");

  act(() => {
    setState(1);
  });

  expect(screen.getByTestId("parent").textContent).toBe("1");
  expect(screen.getByTestId("state").textContent).toBe("1");
});

it("doesn't care about async", async () => {
  render(<TestComponent />);

  async function delayed() {
    await new Promise((r) => setTimeout(r, 100));
    setState(100);
  }

  await act(() => delayed());

  expect(screen.getByTestId("state").textContent).toBe("100");
});

it("subscribe", () => {
  let i = 0;
  const unsub = subscribe(() => {
    i++;
  });
  setState(10);
  setState(20);
  setState(30);
  expect(i).toBe(3);

  unsub();
  setState(40);
  setState(50);
  setState(60);
  expect(i).toBe(3);
});

it("example of substate with setter", () => {
  const [useX, setX] = createState({ a: {}, b: {} });
  const useA = () => {
    const a = useX((state) => state.a);
    const updateA = (newA: Record<string, any>) => {
      setX((state) => ({
        ...state,
        a: newA,
      }));
    };
    return [a, updateA] as const;
  };

  const { result } = renderHook(() => useA());

  expect(result.current[0]).toEqual({});
  act(() => {
    result.current[1]({ foo: "bar" });
  });
  expect(result.current[0]).toEqual({ foo: "bar" });
});

describe("complex object state", () => {
  const [useObjState, setObjState] = createState({
    a: { b: { c: 1, y: "bar" }, x: "foo" },
  });

  let renderCounts = { A: 0, B: 0, C: 0, App: 0 };

  const RenderA = () => {
    renderCounts.A++;
    const state = useObjState((x) => JSON.stringify(x.a));
    return <span data-testid="A">{state}</span>;
  };
  const RenderB = () => {
    renderCounts.B++;
    const state = useObjState((x) => JSON.stringify(x.a.b));
    return <span data-testid="B">{state}</span>;
  };
  const RenderC = () => {
    renderCounts.C++;
    const state = useObjState((x) => x.a.b.c);
    return <span data-testid="C">{state}</span>;
  };

  const App = () => {
    renderCounts.App++;
    return (
      <>
        <RenderA />
        <RenderB />
        <RenderC />
      </>
    );
  };

  beforeEach(() => {
    renderCounts = { A: 0, B: 0, C: 0, App: 0 };
  });

  it("complex - update all", () => {
    render(<App />);
    expect(renderCounts).toEqual({ A: 1, B: 1, C: 1, App: 1 });
    expect(screen.getByTestId("A").textContent).toBe(
      '{"b":{"c":1,"y":"bar"},"x":"foo"}'
    );
    expect(screen.getByTestId("B").textContent).toBe('{"c":1,"y":"bar"}');
    expect(screen.getByTestId("C").textContent).toBe("1");

    act(() => {
      setObjState((x) => {
        return {
          ...x,
          a: {
            ...x.a,
            b: {
              ...x.a.b,
              c: 2,
            },
          },
        };
      });
    });

    expect(renderCounts).toEqual({ A: 2, B: 2, C: 2, App: 1 });
    expect(screen.getByTestId("A").textContent).toBe(
      '{"b":{"c":2,"y":"bar"},"x":"foo"}'
    );
    expect(screen.getByTestId("B").textContent).toBe('{"c":2,"y":"bar"}');
    expect(screen.getByTestId("C").textContent).toBe("2");
  });

  it("complex - update A only", () => {
    render(<App />);

    expect(renderCounts).toEqual({ A: 1, B: 1, C: 1, App: 1 });
    act(() => {
      setObjState((x) => {
        return {
          ...x,
          a: {
            ...x.a,
            x: "new foo",
          },
        };
      });
    });

    expect(renderCounts).toEqual({ A: 2, B: 1, C: 1, App: 1 });

    expect(screen.getByTestId("A").textContent).toBe(
      '{"b":{"c":2,"y":"bar"},"x":"new foo"}'
    );
    expect(screen.getByTestId("B").textContent).toBe('{"c":2,"y":"bar"}');
    expect(screen.getByTestId("C").textContent).toBe("2");
  });

  it("complex - update A and B only", () => {
    render(<App />);

    expect(renderCounts).toEqual({ A: 1, B: 1, C: 1, App: 1 });
    act(() => {
      setObjState((x) => {
        return {
          ...x,
          a: {
            ...x.a,
            b: {
              ...x.a.b,
              y: "new bar",
            },
          },
        };
      });
    });

    expect(renderCounts).toEqual({ A: 2, B: 2, C: 1, App: 1 });

    expect(screen.getByTestId("A").textContent).toBe(
      '{"b":{"c":2,"y":"new bar"},"x":"new foo"}'
    );
    expect(screen.getByTestId("B").textContent).toBe('{"c":2,"y":"new bar"}');
    expect(screen.getByTestId("C").textContent).toBe("2");
  });
});
