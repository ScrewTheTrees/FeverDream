import {CUnit} from "../CUnit/CUnit";
import {GameConfig} from "../../../GameConfig";
import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {IComponent} from "./IComponent";

export abstract class CStepComponent extends Entity implements IComponent {
    public isFinished: boolean = false;
    public owner: CUnit;
    public abstract removeOnDeath: boolean;
    public constructor(owner: CUnit, timerDelay: number = 0.02) {
        super(timerDelay);
        this.owner = owner;
    }
    abstract step(): void;
    abstract cleanup(): void;

    stop() {
        this.remove();
        this.cleanup();
    }
    public get globalTimeScale(): number {
        return GameConfig.getInstance().timeScale;
    }
    public get timeScale(): number {
        return this.timerDelay * this.globalTimeScale;
    }
}