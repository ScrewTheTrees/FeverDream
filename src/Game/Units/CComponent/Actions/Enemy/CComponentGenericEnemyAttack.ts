import {CCoroutineComponent} from "../../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../../CUnit/CUnit";
import {CProjectile} from "../../../Projectiles/CProjectile";

export abstract class CComponentGenericEnemyAttack extends CCoroutineComponent {
    public targetOffset: Vector2;
    removeOnDeath = true;
    public scale?: number;

    public constructor(owner: CUnit, targetOffset: Vector2, scale?: number) {
        super(owner);
        this.targetOffset = targetOffset.copy();
        this.scale = scale;
    }

    protected onStart() {
        this.addDisableMovement();
        this.addDisableFaceCommand();
        this.addDominated();
    }

    execute(): void {
        if (this.owner.isDead) return;

        this.setAnimation(ANIM_TYPE_ATTACK);
        this.adjustVisualTimescale(1);
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.yieldTimed(0.25);

        this.adjustVisualTimescale(0.2);
        this.yieldTimed(0.25);

        this.adjustVisualTimescale(1);
        this.yieldTimed(0.25);
        this.createProjectile();
        this.yieldTimed(1);
    }
    protected abstract createProjectile(): CProjectile;

    protected onEnd() {
        this.resetVisualTimescale()
        this.resetFlagChanges();
        this.resetDisplayHeight();
        this.resetBonusMoveSpeed();
        this.resetFacing();
        this.cleanupAllTempEffects();
        this.neutralizeAnimation();
    }
    cleanup(): void {
        this.targetOffset.recycle();
    }
}