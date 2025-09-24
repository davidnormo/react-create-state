import { act, render, renderHook, screen } from "@testing-library/react";
import React from "react";
import { createState } from "./src";

React;

const [useState, setState, getState] = createState(0);

const TestComponent = () => {
  const state = useState((x) => x, []);
  return (
    <div>
      <span data-testid="state">{state}</span>
    </div>
  );
};

it("useState - get value", () => {
  const { result } = renderHook(() => useState((x) => x, []));
  expect(result.current).toBe(0);
});

it("useState - get value with deps", () => {
  let a = 1;
  const { result } = renderHook(() => useState((x) => x + a, [a]));
  expect(result.current).toBe(1);
});

it("useState - get updated value", () => {
  const { result } = renderHook(() => useState((x) => x, []));

  act(() => {
    setState(() => 1);
  });

  expect(result.current).toBe(1);
});

it("TestComponent - render with initial state", () => {
  setState(() => 0);
  render(<TestComponent />);
  expect(screen.getByTestId("state").textContent).toBe("0");
});

it("getState", () => {
  expect(getState()).toBe(0);
  setState(() => 1);
  expect(getState()).toBe(1);
});

it("encapsulation", () => {
  setState(() => 1);
  const useDoubleState = () => {
    return useState((x) => x * 2, []);
  };

  const { result } = renderHook(() => useDoubleState());

  expect(result.current).toBe(2);
});
