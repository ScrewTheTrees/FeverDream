import {CProjectileEnemyMeleeLarge} from "../../../Projectiles/Enemy/CProjectileEnemyMeleeLarge";
import {CComponentGenericEnemyAttack} from "./CComponentGenericEnemyAttack";

export class CComponentEnemyMeleeSlowLarge extends CComponentGenericEnemyAttack {
    execute(): void {
        if (this.owner.isDead) return;

        this.setAnimation(ANIM_TYPE_ATTACK);
        this.adjustVisualTimescale(0.5);
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.yieldTimed(0.5);

        this.adjustVisualTimescale(0.1);
        this.yieldTimed(0.5);

        this.adjustVisualTimescale(1);
        this.yieldTimed(0.12);
        this.createProjectile();
        this.yieldTimed(1);
    }
    public createProjectile() {
        return new CProjectileEnemyMeleeLarge(this.owner, this.targetOffset, 0.6);
    }
}