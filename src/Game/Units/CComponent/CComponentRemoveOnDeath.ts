import {CCoroutineComponent} from "./CCoroutineComponent";
import {CUnit} from "../CUnit/CUnit";

export class CComponentRemoveOnDeath extends CCoroutineComponent {
    removeOnDeath = false;
    public constructor(owner: CUnit) {
        super(owner);
    }
    execute() {
        while (!this.owner.isDead) {
            this.yield();
        }
        this.yieldTimed(5);
        this.owner.queueForRemoval = true;
    }
    cleanup(): void {
    }
}