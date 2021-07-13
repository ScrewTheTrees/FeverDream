import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {CProjectileEnemyMelee} from "../../Projectiles/Enemy/CProjectileEnemyMelee";
import {CProjectileEnemyMeleeLarge} from "../../Projectiles/Enemy/CProjectileEnemyMeleeLarge";
import {GameConfig} from "../../../../GameConfig";

export class CComponentEnemyMeleeSlowLarge extends CCoroutineComponent {
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
        this.owner.setVisualTimeScale(0.5);
        this.yieldTimed(0.5 / GameConfig.getInstance().timeScale);

        this.owner.setVisualTimeScale(0.1);
        this.yieldTimed(0.5 / GameConfig.getInstance().timeScale);

        this.owner.setVisualTimeScale(1);
        this.yieldTimed(0.12 / GameConfig.getInstance().timeScale);
        this.createProjectile();
        this.yieldTimed(1 / GameConfig.getInstance().timeScale);
        //Done
        this.owner.setAnimation(resetAnim);
    }
    public createProjectile() {
        new CProjectileEnemyMeleeLarge(this.owner, this.targetOffset, 0.6);
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