import {CCoroutineComponent} from "../../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../../CUnit/CUnit";
import {PlayerStats} from "../../../../PlayerManager/PlayerStats";
import {CUnitTypeBarricade} from "../../../CUnit/Types/CUnitTypeBarricade";

export class CComponentPlayerPlaceBarricade extends CCoroutineComponent {
    removeOnDeath = true;
    public targetOffset: Vector2;

    public constructor(owner: CUnit, targetPosition: Vector2) {
        super(owner);
        this.targetOffset = this.owner.getPosition().createOffsetTo(targetPosition);
    }

    protected onStart() {
        this.addDisableMovement();
        this.addDisableFaceCommand();
        this.addDominated();
    }

    execute(): void {
        if (this.owner.isDead) return;

        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        let actionRate = PlayerStats.getInstance().actionRate;

        let pos = this.owner.getPosition().copy().polarProject(128, this.targetOffset.getAngleDegrees());
        let barricade = new CUnitTypeBarricade(this.owner.owner, pos);
        pos.recycle();

        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        this.setAnimation(ANIM_TYPE_SPELL);
        this.setVisualTimescale(1.5 / actionRate);
        this.yieldTimed(0.8 / actionRate, () => {
            if (barricade.isDead) return this.owner.removeComponent(this);
        });
        this.setAnimation(ANIM_TYPE_STAND);
        this.setAnimation(ANIM_TYPE_SPELL);
        this.setVisualTimescale(1.5 / actionRate);
        this.yieldTimed(0.8 / actionRate, () => {
            if (barricade.isDead) return this.owner.removeComponent(this);
        });
        this.setAnimation(ANIM_TYPE_STAND);
        this.setAnimation(ANIM_TYPE_SPELL);
        this.setVisualTimescale(1.5 / actionRate);
        this.yieldTimed(0.8 / actionRate, () => {
            if (barricade.isDead) return this.owner.removeComponent(this);
        });
    }

    protected onEnd() {
        this.resetVisualTimescale();
        this.resetFlagChanges();

        this.owner.wasMoving = false;
        this.owner.isMoving = false;
        this.neutralizeAnimation();
    }
    cleanup(): void {
        this.targetOffset.recycle();
    }
}