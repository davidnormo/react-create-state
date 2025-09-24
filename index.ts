import { useEffect, useState } from "react";

export const createState = <T>(state: T) => {
  const listeners: {
    localVal: any;
    setter: (val: any) => void;
    selector: (state: T) => any;
    deps: any[];
  }[] = [];

  const useStateLocal = <Ret>(
    selector: (state: T) => Ret,
    deps: any[]
  ): Ret => {
    const [localVal, setter] = useState(() => selector(state));

    useEffect(() => {
      listeners.push({ localVal, setter, selector, deps });
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
      deps: [],
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
