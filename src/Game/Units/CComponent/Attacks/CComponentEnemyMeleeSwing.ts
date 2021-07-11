import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";

export class CComponentEnemyMeleeSwing extends CCoroutineComponent {
    public targetOffset: Vector2;

    public constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner);
        this.targetOffset = targetOffset.copy();
    }
    execute(): void {
        this.owner.disableMovement += 1;
        this.owner.disableFaceCommand += 1;
        let resetAnim = this.owner.lastAnimationType;

        this.isolate(() => {
            this.owner.forceFacing(this.targetOffset.getAngleDegrees());
            this.owner.setAnimation(ANIM_TYPE_ATTACK);
            this.owner.setTimescale(0.1);

            this.yieldTimed(0.75);
            this.owner.setTimescale(1);
            //new CProjectilePlayerShoot(this.owner, this.targetOffset);

            this.yieldTimed(GetRandomReal(1.5, 2.5));
            //Done
        });
        this.owner.disableMovement -= 1;
        this.owner.disableFaceCommand -= 1;
        this.owner.setAnimation(resetAnim);
    }
    cleanup(): void {
        this.targetOffset.recycle();
    }
}