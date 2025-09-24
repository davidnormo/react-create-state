import { useEffect, useMemo, useState } from "react";

export const createState = <T>(
  state: T
): [
  <Ret>(selector: (state: T) => Ret, deps: any[]) => Ret,
  (fn: (state: T) => T) => void,
  () => T
] => {
  const listeners: any[] = [];

  const useStateLocal = <Ret>(
    selector: (state: T) => Ret,
    deps: any[]
  ): Ret => {
    const [, setter] = useState(true);

    useEffect(() => {
      listeners.push(setter);
      return () => {
        const index = listeners.indexOf(setter);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      };
    }, []);

    return useMemo(() => selector(state), [...deps, state]);
  };

  const setState = (fn: (state: T) => T) => {
    const newState = fn(state);
    state = newState;
    listeners.forEach((listener) => listener((v: boolean) => !v));
  };

  const getState = () => state;

  return [useStateLocal, setState, getState];
};
