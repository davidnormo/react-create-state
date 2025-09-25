export declare const createState: <T>(state: T) => readonly [{
    (selector?: never, deps?: never): T;
    <Ret>(selector: ((state: T) => Ret), deps?: any[]): Ret;
}, (fn: T | ((state: T) => T)) => void, () => T, (setter: (state: T) => void) => (() => void)];
