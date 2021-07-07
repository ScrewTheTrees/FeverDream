export namespace TreeCoroutine {
    export function YieldNo(times: number, ...args: any[]) {
        for (let i = 0; i < times; i++) {
            coroutine.yield(...args);
        }
    }
    export function YieldTimed(totalSeconds: number, timeStep: number, ...args: any[]) {
        for (let i = 0; i < totalSeconds; i += timeStep) {
            coroutine.yield(...args);
        }
    }
}