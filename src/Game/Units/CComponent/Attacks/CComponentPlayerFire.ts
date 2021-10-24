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
        this.owner.disableMovement += 1;
        this.owner.disableFaceCommand += 1;
        this.owner.dominated += 1;
    }
    execute(): void {
        let fireRate = PlayerStats.getInstance().fireRate;
        let resetAnim = this.owner.lastAnimationType;
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.owner.setAnimation(ANIM_TYPE_ATTACK);
        this.owner.setVisualTimeScale(0.125 / fireRate);

        this.yieldTimed(0.6 / fireRate);
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.owner.setVisualTimeScale(fireRate);
        let proj = new CProjectilePlayerShoot(this.owner, this.targetOffset);
        proj.damage = PlayerStats.getInstance().damage;
        this.yieldTimed(0.5 / fireRate);
        //Done
        this.owner.setVisualTimeScale(1);
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