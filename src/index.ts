import { useEffect, useMemo, useRef, useState } from "react";

const id = <T>(x: T): T => x;

const registry: (() => void)[] = [];

type Listener<T> = {
  localVal: any;
  setter: (val: any) => void;
  selector: (state: T) => any;
  deps: any[];
};

export const createState = <T>(initialState: T) => {
  let state: T = initialState;
  const listeners: Listener<T>[] = [];

  const unsubListener = (listener: Listener<T>) => {
    const index = listeners.findIndex((l) => l.setter === listener.setter);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  const notifyListeners = () => {
    listeners.forEach((listener) => {
      let tmp = listener.selector(state);
      if (tmp !== listener.localVal) {
        listener.localVal = tmp;
        listener.setter(tmp);
      }
    });
  }

  const reinitialize = () => {
    state = initialState;
    notifyListeners();
  };
  registry.push(reinitialize);

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
        unsubListener(listenerRef.current);
      };
    }, []);

    return localVal;
  };

  const setState = (fn: T | ((state: T) => T)) => {
    // @ts-ignore
    state = typeof fn === "function" ? fn(state) : fn;
    notifyListeners();
  };

  const getState = () => state;

  const subscribe = (setter: (state: T) => void): (() => void) => {
    const listener: Listener<T> = {
      localVal: NaN,
      setter,
      selector: (x) => x,
      deps: []
    };
    listeners.push(listener);
    setter(state);
    return () => {
      unsubListener(listener);
    };
  };

  return [useStateLocal, setState, getState, subscribe] as const;
};

export const reinitializeAll = () => {
  registry.forEach(cb => cb());
};