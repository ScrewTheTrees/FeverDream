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
        if (!this._isManual) {
            this.resume(...args);
        } else {
            this.remove();
        }
    }

    public reset() {
        if (!this.isFinished) this.onEnd();
        this.routine = coroutine.create(() => this.runSecret());
        this.isFinished = false;
        if (!this.isManual) this.add();
        this.onStart();
    }
    public stop() {
        if (!this.isFinished) {
            this.onEnd();
            this.remove();
        }
        this.isFinished = true;
    }
    protected yield(...args: any[]) {
        coroutine.yield(...args);
    }
    protected yieldTimed(totalSeconds: number, ...args: any[]) {
        for (let i = 0; i < totalSeconds; i += this.timerDelay) {
            this.yield(...args);
        }
    }
    public resume(...args: any[]) {
        if (!this.isFinished) {
            coroutine.resume(this.routine, ...args);
        }
    }
    protected isolate(func: (this: void, ...arg: any[]) => any) {
        xpcall(func, Logger.critical);
    }

    private runSecret() {
        this.onStart();
        this.isolate(() => {
            this.execute();
        });
        this.stop();
    }

    protected onStart() {
    };
    protected abstract execute(): void;
    protected onEnd() {
    };

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