import {CUnit} from "../CUnit/CUnit";
import {GameConfig} from "../../../GameConfig";
import {IComponent} from "./CCoroutineComponent";

export abstract class CStepComponent implements IComponent {
    public isFinished: boolean = false;
    public owner: CUnit;
    public abstract removeOnDeath: boolean;
    public constructor(owner: CUnit, timerDelay: number = 0.01) {
        this.timerDelay = timerDelay;
        this.owner = owner;
    }
    abstract execute(): void;
    abstract cleanup(): void;

    resume(...args: any[]): any {
        this.execute();
    }
    stop() {
        this.cleanup();
    }
    public get timeScale(): number {
        return this.timerDelay * GameConfig.getInstance().timeScale;
    }
    private _timerDelay: number = 0.01;
    public get timerDelay(): number {
        return this._timerDelay * GameConfig.getInstance().timeScale;
    }
    public set timerDelay(delay: number) {
        this._timerDelay = delay;
    }
}