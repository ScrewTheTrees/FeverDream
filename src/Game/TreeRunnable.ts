import {Entity} from "wc3-treelib/src/TreeLib/Entity";


/**
 * Coroutine that can be reset.
 */
export abstract class TreeThread extends Entity {
    private routine: LuaThread;

    public constructor() {
        super(0.01);
        this.routine = coroutine.create(() => this.execute());
    }
    public reset() {
        this.routine = coroutine.create(() => this.execute());
    }
    public yield(...args: any[]) {
        coroutine.yield(...args);
    }
    public yieldTimed(totalSeconds: number, ...args: any[]) {
        for (let i = 0; i < totalSeconds; i += this.timerDelay) {
            coroutine.yield(...args);
        }
    }

    step(): void {
        coroutine.resume(this.routine);
    }

    public abstract execute(): void;
}