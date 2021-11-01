import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {PlayerStats} from "../../../PlayerManager/PlayerStats";
import {GameConfig} from "../../../../GameConfig";
import {Models} from "../../../Models";

export class CComponentPlayerDodge extends CCoroutineComponent {
    removeOnDeath = true;
    public targetOffset: Vector2;

    public constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner, 0.02);
        this.targetOffset = targetOffset.copy();
    }

    protected onStart() {
        this.addDisableMovement();
        this.addDisableFaceCommand();
        this.addDisableHitbox();
        this.addDominated();
    }
    execute(): void {
        let actionRate = PlayerStats.getInstance().rollSpeed;

        this.owner.forceFacingWithVisual(this.targetOffset.getAngleDegrees());
        this.setAnimation(ANIM_TYPE_STAND);
        this.setVisualTimescale(actionRate);

        this.addTempEffect(AddSpecialEffect(Models.EFFECT_SPIN_AIR, this.owner.position.x, this.owner.position.y));

        let target = this.targetOffset.copy();
        let endTime = 0.6 / actionRate;
        let midTime = endTime / 2;
        let pitchChange = 0;
        let heightChange = 0;
        for (let time = 0; time < endTime; time += this.lastStepSize * this.globalTimeScale) {
            let pitchValue = ((time / endTime) * 360) - pitchChange;

            let heightValue = time <= midTime ? time / midTime : (midTime - (time - midTime)) / midTime;
            heightValue = (heightValue * 96) - heightChange;

            pitchChange += pitchValue;
            heightChange += heightValue;
            this.adjustFacingPitch(pitchValue);
            this.adjustDisplayHeight(heightValue);

            this.setTempEffectsPositionToOwner();

            target.multiplyOffsetNum(this.owner.getActualMoveSpeed() * 2.5);
            this.owner.forceMove(target);
            target.updateToPoint(this.targetOffset);

            if (time >= endTime * 0.65) {
                this.setAnimation(ANIM_TYPE_SPELL);
                this.setVisualTimescale(2 / actionRate);
            }
            this.yield();
        }
        target.recycle();
        this.resetFacing();
        this.resetDisplayHeight();
        this.cleanupAllTempEffects();

        this.setAnimation(ANIM_TYPE_SPELL);
        this.setVisualTimescale(2 / actionRate);
        this.owner.forceFacingWithVisual(this.targetOffset.getAngleDegrees());

        this.yieldTimed(0.5 / actionRate);

        //Slowdown at end
        this.resetFlagChanges();
        this.neutralizeAnimation();
        this.addDominated();

        this.adjustBonusMoveSpeed(-this.owner.moveSpeed * 0.5);
        this.setVisualTimescale(0.5);
        this.yieldTimed(0.5 / actionRate);

        this.resetBonusMoveSpeed();
        this.adjustBonusMoveSpeed(-this.owner.moveSpeed * 0.2);
        this.setVisualTimescale(0.75);
        this.yieldTimed(0.2 / actionRate);
        //Done
    }
    protected onEnd() {
        this.resetBonusMoveSpeed();
        this.neutralizeAnimation();
        this.resetFlagChanges();
        this.resetVisualTimescale();
        this.resetFacing();
        this.resetDisplayHeight();
        this.cleanupAllTempEffects();
    }
    cleanup(): void {
        this.targetOffset.recycle();
    }
}