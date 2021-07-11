import {CStepComponent} from "./CCoroutineComponent";
import {CUnit} from "../CUnit/CUnit";

export class CComponentRemoveOnDeath extends CStepComponent {
    public constructor(owner: CUnit) {
        super(owner);
    }
    execute() {
        if (this.owner.isDead) {
            this.owner.queueForRemoval = true;
        }
    }
    cleanup(): void {
    }
}