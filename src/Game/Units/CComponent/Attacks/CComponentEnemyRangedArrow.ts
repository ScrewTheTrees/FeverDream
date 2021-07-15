import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {CProjectileEnemyRangedAttackArrow} from "../../Projectiles/Enemy/CProjectileEnemyRangedAttackArrow";

export class CComponentEnemyRangedArrow extends CCoroutineComponent {
    public targetOffset: Vector2;
    removeOnDeath = true;

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
        this.owner.setVisualTimeScale(1);
        this.yieldTimed(0.25);

        this.owner.setVisualTimeScale(0.2);
        this.yieldTimed(0.25);

        this.owner.setVisualTimeScale(1);
        this.yieldTimed(0.25);
        this.createProjectile();
        this.yieldTimed(1);
        //Done
        this.owner.setAnimation(resetAnim);
    }
    private createProjectile() {
        new CProjectileEnemyRangedAttackArrow(this.owner, this.targetOffset);
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