import {CUnit} from "../CUnit/CUnit";
import {GameConfig} from "../../../GameConfig";
import {TreeThread} from "wc3-treelib/src/TreeLib/Utility/TreeThread";

export interface IComponent {
    isFinished: boolean;
    owner: CUnit;
    removeOnDeath: boolean;
    get timerDelay(): number;
    set timerDelay(delay: number);
    resume(...args: any[]): any;
    stop(): void;
    execute(): void;
    cleanup(): void;
}

export abstract class CCoroutineComponent extends TreeThread implements IComponent {
    public owner: CUnit;
    public abstract removeOnDeath: boolean;
    public constructor(owner: CUnit, timerDelay: number = 0.01) {
        super(timerDelay, true);
        this.owner = owner;
    }
    abstract execute(): void;
    abstract cleanup(): void;

    public destroy() {
        this.remove();
        this.cleanup();
        this.isFinished = true;
    }
    public get timeScale(): number {
        return this.timerDelay * GameConfig.getInstance().timeScale;
    }
    protected yieldTimed(totalSeconds: number, ...args: any[]) {
        for (let i = 0; i < totalSeconds; i += this.timeScale) {
            this.yield();
        }
    }
}

