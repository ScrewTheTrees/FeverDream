import {TreeThread} from "../../TreeRunnable";
import {CUnit} from "../CUnit/CUnit";

export interface IComponent {
    isFinished: boolean;
    owner: CUnit;
    get timerDelay(): number;
    set timerDelay(delay: number);
    resume(...args: any[]): any;
    execute(): void;
    cleanup(): void;
}

export abstract class CCoroutineComponent extends TreeThread implements IComponent {
    public owner: CUnit;
    public constructor(owner: CUnit) {
        super(0.01, true);
        this.owner = owner;
    }
    abstract execute(): void;
    abstract cleanup(): void;

    public destroy() {
        this.remove();
        this.cleanup();
        this.isFinished = true;
    }
}

export abstract class CStepComponent implements IComponent {
    public isFinished: boolean = false;
    public owner: CUnit;
    public constructor(owner: CUnit) {
        this.owner = owner;
    }
    abstract execute(): void;
    abstract cleanup(): void;

    resume(...args: any[]): any {
        this.execute();
    }
    private _timerDelay: number = 0.01;
    get timerDelay(): number {
        return this._timerDelay;
    }
    set timerDelay(delay: number) {
        this._timerDelay = delay;
    }
}