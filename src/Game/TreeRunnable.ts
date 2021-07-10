import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Logger} from "wc3-treelib/src/TreeLib/Logger";


/**
 * Coroutine that can be reset, tracks "isFinished", has special Yield.
 * Runs in a 0.01 interval
 */
export abstract class TreeThread extends Entity {
    private routine: LuaThread;
    private _isManual: boolean = false;
    public isFinished: boolean = false;

    protected constructor(timerDelay: number = 0.01, manual: boolean = false) {
        super(timerDelay);
        this.routine = coroutine.create(() => this.runSecret());
        this.isManual = manual;
    }

    step(...args: any[]): void {
        this.update();
        this.resume(...args);
    }

    public reset() {
        this.routine = coroutine.create(() => this.runSecret());
        this.isFinished = false;
        if (!this.isManual) this.add();
    }
    public yield(...args: any[]) {
        coroutine.yield(...args);
    }
    public yieldTimed(totalSeconds: number, ...args: any[]) {
        for (let i = 0; i < totalSeconds; i += this.timerDelay) {
            coroutine.yield(...args);
        }
    }
    public resume(...args: any[]) {
        if (!this.isFinished) {
            coroutine.resume(this.routine, ...args);
        }
    }
    protected isolate(func: (this: void,...arg: any[]) => any) {
        xpcall(func, Logger.critical);
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

    get isManual(): boolean {
        return this._isManual;
    }
    set isManual(value: boolean) {
        this._isManual = value;
        if (value) {
            this.remove();
        } else this.add();
    }
}