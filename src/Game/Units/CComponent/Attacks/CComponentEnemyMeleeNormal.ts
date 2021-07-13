import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {CProjectileEnemyMelee} from "../../Projectiles/Enemy/CProjectileEnemyMelee";

export class CComponentEnemyMeleeNormal extends CCoroutineComponent {
    public targetOffset: Vector2;
    removeOnDeath = true;
    public scale?: number;

    public constructor(owner: CUnit, targetOffset: Vector2, scale?: number) {
        super(owner);
        this.targetOffset = targetOffset.copy();
        this.scale = scale;
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
        new CProjectileEnemyMelee(this.owner, this.targetOffset, this.scale);
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