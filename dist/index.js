import { useEffect, useMemo, useRef, useState } from "react";
const id = (x) => x;
const registry = [];
export const createState = (initialState) => {
    let state = initialState;
    const listeners = [];
    const unsubListener = (listener) => {
        const index = listeners.findIndex((l) => l.setter === listener.setter);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    };
    const notifyListeners = () => {
        listeners.forEach((listener) => {
            let tmp = listener.selector(state);
            if (tmp !== listener.localVal) {
                listener.localVal = tmp;
                listener.setter(tmp);
            }
        });
    };
    const reinitialize = () => {
        state = initialState;
        notifyListeners();
    };
    registry.push(reinitialize);
    function useStateLocal(selector, deps = []) {
        selector = selector || (id);
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
    }
    ;
    const setState = (fn) => {
        // @ts-ignore
        state = typeof fn === "function" ? fn(state) : fn;
        notifyListeners();
    };
    const getState = () => state;
    const subscribe = (setter) => {
        const listener = {
            localVal: NaN,
            setter,
            selector: (x) => x,
            deps: []
        };
        listeners.push(listener);
        return () => {
            unsubListener(listener);
        };
    };
    return [useStateLocal, setState, getState, subscribe];
};
export const reinitializeAll = () => {
    registry.forEach(cb => cb());
};
