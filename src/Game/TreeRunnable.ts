import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Logger} from "wc3-treelib/src/TreeLib/Logger";


/**
 * Coroutine that can be reset, tracks "isFinished", has special Yield.
 * Runs in a 0.01 interval
 */
export abstract class TreeThread extends Entity {
    private routine: LuaThread;
    public isFinished: boolean = false;

    protected constructor(timerDelay: number = 0.01) {
        super(timerDelay);
        this.routine = coroutine.create(() => this.runSecret());
    }
    public reset() {
        this.routine = coroutine.create(() => this.runSecret());
        this.isFinished = false;
        this.add();
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
        this.update();
        coroutine.resume(this.routine);
    }

    private runSecret() {
        xpcall(() => {
            this.execute();
        }, Logger.critical)
        this.remove();
        this.isFinished = true;
    }

    public update() {
    };
    public abstract execute(): void;
}