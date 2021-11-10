import {CUnit} from "../CUnit/CUnit";
import {CStepComponent} from "./CStepComponent";

export class CComponentHealOverTime extends CStepComponent {
    removeOnDeath = true;

    public seconds = 0;
    public constructor(owner: CUnit, public healingPerSecond: number, public maxSeconds: number = 1) {
        super(owner, 0.01);
    }
    step() {
        if (this.owner.isDead || this.seconds >= this.maxSeconds) {
            return this.owner.removeComponent(this);
        }
        let timeScaleChange = this.lastStepSize * this.globalTimeScale;
        this.seconds += timeScaleChange;
        let healing = this.healingPerSecond * timeScaleChange;
        this.owner.dealHealing(healing, this.owner);
    }
    cleanup(): void {
    }
}