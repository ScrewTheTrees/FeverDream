import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {CProjectilePlayerShoot} from "../../Projectiles/Player/CProjectilePlayerShoot";
import {PlayerStats} from "../../../PlayerManager/PlayerStats";

export class CComponentPlayerFire extends CCoroutineComponent {
    removeOnDeath = true;
    public targetOffset: Vector2;

    public constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner);
        this.targetOffset = targetOffset.copy();
    }

    protected onStart() {
        this.addDisableMovement();
        this.addDisableFaceCommand();
        this.addDominated();
    }
    execute(): void {
        let fireRate = PlayerStats.getInstance().fireRate;
        let damage = PlayerStats.getInstance().damage;

        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.setAnimation(ANIM_TYPE_ATTACK);
        this.setVisualTimescale(0.125 / fireRate);

        this.yieldTimed(0.6 / fireRate);
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.setVisualTimescale(fireRate);
        let proj = new CProjectilePlayerShoot(this.owner, this.targetOffset);
        proj.damage = damage;

        this.yieldTimed(0.5 / fireRate);
        //Done
    }
    protected onEnd() {
        this.resetVisualTimescale();
        this.neutralizeAnimation();
        this.resetFlagChanges();
    }
    cleanup(): void {
        this.targetOffset.recycle();
    }
}