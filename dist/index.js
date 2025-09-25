import { useEffect, useMemo, useRef, useState } from "react";
const id = (x) => x;
export const createState = (state) => {
    const listeners = [];
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
                const index = listeners.findIndex((l) => l.setter === setter);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            };
        }, []);
        return localVal;
    }
    ;
    const setState = (fn) => {
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
    const subscribe = (setter) => {
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
    return [useStateLocal, setState, getState, subscribe];
};
