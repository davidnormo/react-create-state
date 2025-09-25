import { useEffect, useMemo, useRef, useState } from "react";

const id = <T>(x: T): T => x;

export const createState = <T>(state: T) => {
  const listeners: {
    localVal: any;
    setter: (val: any) => void;
    selector: (state: T) => any;
    deps: any[];
  }[] = [];

  function useStateLocal(selector?: never, deps?: never): T;
  function useStateLocal<Ret>(selector: ((state: T) => Ret), deps?: any[]): Ret;
  function useStateLocal <Ret>(
    selector?: ((state: T) => T) | ((state: T) => Ret),
    deps: any[] = []
  ): T | Ret {
    selector = selector || id<T>;
    const localVal = useMemo(() => selector(state), [...deps, state]);
    const [, setter] = useState(localVal);
    
    const listenerRef = useRef({ setter, selector, deps, localVal });
    listenerRef.current.selector = selector;
    listenerRef.current.deps = deps;
    listenerRef.current.localVal = localVal;

    useEffect(() => {
      listeners.push(listenerRef.current);
      return () => {
        const index = listeners.findIndex((l) => l.setter === setter);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      };
    }, []);

    return localVal;
  };

  const setState = (fn: T | ((state: T) => T)) => {
    // @ts-ignore
    const newState = typeof fn === "function" ? fn(state) : fn;
    state = newState;
    listeners.forEach((listener) => {
      let tmp = listener.selector(newState);
      if (tmp !== listener.localVal) {
        listener.localVal = tmp;
        listener.setter(tmp);
      }
    });
  };

  const getState = () => state;

  const subscribe = (setter: (state: T) => void): (() => void) => {
    listeners.push({
      localVal: NaN,
      setter,
      selector: (x) => x,
      deps: []
    });
    return () => {
      const index = listeners.findIndex((l) => l.setter === setter);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return [useStateLocal, setState, getState, subscribe] as const;
};
