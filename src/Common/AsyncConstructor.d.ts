export default abstract class {
    isReady: boolean;
    readyCallbacks: Function[];
    async(callback: any): void;
    ready(callback: Function): void;
    readyComplete(...args: any[]): Promise<void>;
    /**
     * Execute an array of callbacks functions.
     */
    callbacks(callbacksArray: any, args?: any[], thisArg?: any): Promise<void>;
    seal(): void;
}
//# sourceMappingURL=AsyncConstructor.d.ts.map