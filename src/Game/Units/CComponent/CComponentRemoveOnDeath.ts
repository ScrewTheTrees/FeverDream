import {CUnit} from "../CUnit/CUnit";
import {CStepComponent} from "./CStepComponent";

export class CComponentRemoveOnDeath extends CStepComponent {
    removeOnDeath = false;
    dead = false;
    public constructor(owner: CUnit) {
        super(owner, 1);
    }
    step() {
        if (this.dead) {
            this.owner.queueForRemoval = true;
        }
        if (this.owner.isDead) {
            this.dead = true;
            this.timerYield(5);
            return;
        }
    }
    cleanup(): void {
    }
}