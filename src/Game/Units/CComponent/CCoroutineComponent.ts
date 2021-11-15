import {CUnit} from "../CUnit/CUnit";
import {GameConfig} from "../../../GameConfig";
import {TreeThread} from "wc3-treelib/src/TreeLib/Utility/TreeThread";
import {IComponent} from "./IComponent";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";

export abstract class CCoroutineComponent extends TreeThread implements IComponent {
    public owner: CUnit;
    public abstract removeOnDeath: boolean;

    protected constructor(owner: CUnit, timerDelay: number = 0.01) {
        super(timerDelay, false);
        this.owner = owner;
    }
    abstract execute(): void;
    abstract cleanup(): void;

    protected onUpdateStep() {
        /*if ((this.removeOnDeath && this.owner.isDead)
            || this.owner.queueForRemoval
        ) {
            this.stop();
        }*/
    }

    public destroy() {
        if (!this.isFinished) {
            super.stop();
            this.cleanup();
            // @ts-ignore
            this.owner = null;
        }
    }
    public get globalTimeScale(): number {
        return GameConfig.getInstance().timeScale;
    }
    public get timeStep(): number {
        return this._timerDelay * this.globalTimeScale;
    }
    public yieldTimed(totalSeconds: number, inYield?: () => any) {
        for (let i = 0; i < totalSeconds; i += this.timeStep) {
            if (inYield) inYield();
            this.yield();
        }
        this.lastYieldDuration = totalSeconds;
    }

    protected effects!: effect[];
    public addTempEffect(gfx: effect) {
        if (!this.effects) this.effects = [];
        Quick.Push(this.effects, gfx);
        return gfx;
    }
    public cleanupAllTempEffects() {
        if (this.effects) {
            let gfx = this.effects.pop();
            while (gfx) {
                DestroyEffect(gfx);
                gfx = this.effects.pop();
            }
        }
    }
    public setTempEffectsTimeScale(value: number) {
        if (this.effects) {
            for (let gfx of this.effects) {
                BlzSetSpecialEffectTimeScale(gfx, value * this.globalTimeScale);
            }
        }
    }
    public setTempEffectsScale(value: number) {
        if (this.effects) {
            for (let gfx of this.effects) {
                BlzSetSpecialEffectScale(gfx, value);
            }
        }
    }
    public setTempEffectsPosition(x: number, y: number, z: number) {
        if (this.effects) {
            for (let gfx of this.effects) {
                BlzSetSpecialEffectPosition(gfx, x, y, z);
            }
        }
    }
    public setTempEffectsPositionToOwner() {
        this.setTempEffectsPosition(this.owner.getPosition().x, this.owner.getPosition().y, this.owner.getZValue());
    }

    protected displayHeightAdjust: number = 0;
    public adjustDisplayHeight(change: number) {
        this.displayHeightAdjust += change;
        this.owner.displayHeight += change;
    }
    public resetDisplayHeight() {
        this.owner.displayHeight -= this.displayHeightAdjust;
        this.displayHeightAdjust = 0;
    }

    protected bonusMoveSpeedAdjust: number = 0;
    public adjustBonusMoveSpeed(change: number) {
        this.bonusMoveSpeedAdjust += change;
        this.owner.moveSpeedBonus += change;
    }
    public resetBonusMoveSpeed() {
        this.owner.moveSpeedBonus -= this.bonusMoveSpeedAdjust;
        this.bonusMoveSpeedAdjust = 0;
    }

    protected animationTypeReset?: animtype;
    public setAnimation(type: animtype, ...subAnimTypes: subanimtype[]) {
        this.animationTypeReset = this.owner.lastAnimationType;
        if (this.owner.lastAnimationType != type) {
            this.owner.setAnimation(type, ...subAnimTypes);
        }
    }
    public resetAnimation() {
        if (this.animationTypeReset) {
            this.owner.setAnimation(this.animationTypeReset);
        }
        this.animationTypeReset = undefined;
    }
    public neutralizeAnimation() {
        if (!this.owner.isDominated()) {
            if (this.owner.isMoving && this.owner.lastAnimationType != ANIM_TYPE_WALK) {
                this.owner.setAnimation(ANIM_TYPE_WALK);
                this.owner.wasMoving = true;
            } else if (!this.owner.isMoving && !this.owner.isDominated()) {
                this.owner.setAnimation(ANIM_TYPE_STAND);
                this.owner.isMoving = false;
                this.owner.wasMoving = false;
            }
        }
    }

    protected timeScaleAdjust: number = 0;
    public setVisualTimescale(value: number) {
        this.resetVisualTimescale();
        this.timeScaleAdjust = this.owner.visualTimeScale - (this.owner.visualTimeScale - value);
        this.owner.addVisualTimeScale(this.timeScaleAdjust);
    }
    public adjustVisualTimescale(value: number) {
        this.resetVisualTimescale();
        this.timeScaleAdjust = value;
        this.owner.addVisualTimeScale(value);
    }
    public resetVisualTimescale() {
        if (this.timeScaleAdjust > 0) {
            this.owner.removeVisualTimeScale(this.timeScaleAdjust);
            this.timeScaleAdjust = 0;
        }
    }

    protected facingPitchAdjust: number = 0;
    protected facingYawAdjust: number = 0;
    protected facingRollAdjust: number = 0;
    public adjustFacingPitch(change: number) {
        this.facingPitchAdjust += change;
        this.owner.facingPitch += change;
    }
    public adjustFacingYaw(change: number) {
        this.facingYawAdjust += change;
        this.owner.facingYaw += change;
    }
    public adjustFacingRoll(change: number) {
        this.facingRollAdjust += change;
        this.owner.facingRoll += change;
    }
    public resetFacing() {
        this.owner.facingPitch -= this.facingPitchAdjust;
        this.owner.facingYaw -= this.facingYawAdjust;
        this.owner.facingRoll -= this.facingRollAdjust;

        this.facingPitchAdjust = 0;
        this.facingYawAdjust = 0;
        this.facingRollAdjust = 0;
    }

    //Flags
    protected disableMovementChange: number = 0;
    protected disableRotationChange: number = 0;
    protected disableFaceCommandChange: number = 0;
    protected disableHitboxChange: number = 0;
    protected dominatedChange: number = 0;
    protected groundedChange: number = 0;

    public resetFlagChanges() {
        this.owner.disableMovement -= this.disableMovementChange;
        this.owner.disableRotation -= this.disableRotationChange;
        this.owner.disableFaceCommand -= this.disableFaceCommandChange;
        this.owner.disableHitbox -= this.disableHitboxChange;
        this.owner.dominated -= this.dominatedChange;
        this.owner.grounded -= this.groundedChange;

        this.disableMovementChange = 0;
        this.disableRotationChange = 0;
        this.disableFaceCommandChange = 0;
        this.disableHitboxChange = 0;
        this.dominatedChange = 0;
        this.groundedChange = 0;
    }

    public addDisableMovement(change: number = 1) {
        this.disableMovementChange += change;
        this.owner.disableMovement += change;
    }
    public addDisableRotation(change: number = 1) {
        this.disableRotationChange += change;
        this.owner.disableRotation += change;
    }
    public addDisableFaceCommand(change: number = 1) {
        this.disableFaceCommandChange += change;
        this.owner.disableFaceCommand += change;
    }
    public addDisableHitbox(change: number = 1) {
        this.disableHitboxChange += change;
        this.owner.disableHitbox += change;
    }
    public addDominated(change: number = 1) {
        this.dominatedChange += change;
        this.owner.dominated += change;
    }
    public addGrounded(change: number = 1) {
        this.groundedChange += change;
        this.owner.grounded += change;
    }
}

