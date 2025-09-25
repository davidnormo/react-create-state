import { useEffect, useState } from "react";
const id = (x) => x;
export const createState = (state) => {
    const listeners = [];
    function useStateLocal(selector) {
        selector = selector || (id);
        const [localVal, setter] = useState(() => selector(state));
        useEffect(() => {
            listeners.push({ localVal, setter, selector });
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
