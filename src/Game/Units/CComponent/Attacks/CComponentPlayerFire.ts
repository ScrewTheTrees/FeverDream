import {CCoroutineComponent} from "../CCoroutineComponent";
import {CProjectilePlayerShoot} from "../../Projectiles/CProjectile";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";

export class CComponentPlayerFire extends CCoroutineComponent {
    removeOnDeath = true;
    public targetOffset: Vector2;

    public constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner);
        this.targetOffset = targetOffset.copy();
    }

    protected onStart() {
        this.owner.disableMovement += 1;
        this.owner.disableFaceCommand += 1;
        this.owner.dominated += 1;
    }
    execute(): void {
        let resetAnim = this.owner.lastAnimationType;
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.owner.setAnimation(ANIM_TYPE_ATTACK);
        this.owner.setTimescale(0.1);

        this.yieldTimed(0.75);
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.owner.setTimescale(1);
        new CProjectilePlayerShoot(this.owner, this.targetOffset);

        this.yieldTimed(0.75);
        //Done
        this.owner.setAnimation(resetAnim);
    }
    protected onEnd() {
        this.owner.dominated -= 1;
        this.owner.disableMovement -= 1;
        this.owner.disableFaceCommand -= 1;
    }
    cleanup(): void {
        this.targetOffset.recycle();
    }
}