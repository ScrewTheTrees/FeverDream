import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {CUnitPool} from "./CUnitPool";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {Models} from "../../Models";
import {CProjectile} from "../Projectiles/CProjectile";
import {GameConfig} from "../../../GameConfig";
import {BootlegCollisionMap} from "../BootlegCollisionMap";
import {IComponent} from "../CComponent/IComponent";

export abstract class CUnit extends Entity {
    public static unitPool: CUnitPool = new CUnitPool();

    public owner: player;
    public effect: effect;
    public lastAnimationType: animtype = ANIM_TYPE_STAND;
    public queueForRemoval: boolean = false;
    public modelScale: number = 1;
    public visualTimeScale: number = 1;

    public position: Vector2;
    public displayHeight: number = 0;
    public facingYaw: number = 0;
    public facingPitch: number = 0;
    public facingRoll: number = 0;
    public logicAngle: number = 0;
    public isMoving: boolean = false;
    public wasMoving: boolean = false;
    protected moveTime: number = 0;

    public disableMovement: number = 0;     //CUnit wont move at all unless you use rawMove()
    public disableRotation: number = 0;     //CUnit wont do visual rotations anymore
    public disableFaceCommand: number = 0;  //CUnit wont react to you trying to give it a new "logical" facing direction.
    public disableHitbox: number = 0;       //CUnit wont allow to get hit.
    public dominated: number = 0;           //CUnit is tagged as being busy doing something, like an attack or other actions.

    public health: number = 100;
    public maxHealth: number = 100;
    private wasDead: boolean = false;
    public isDead: boolean = false;
    public projectileCollisionSize: number = 32;
    public thiccness: number = 16;

    public poise: number = 1;

    public moveOffset: Vector2 = Vector2.new(0, 0);
    public moveSpeed = 6;
    public moveSpeedBonus = 0;

    public subComponents: IComponent[] = [];

    private collision = BootlegCollisionMap.getInstance();

    public constructor(owner: player, model: string, position: Vector2) {
        super(0.02);
        CUnit.unitPool.addUnit(this);
        this.owner = owner;
        this.effect = AddSpecialEffect(model, position.x, position.y);
        this.position = position.copy();
        BlzSetSpecialEffectColorByPlayer(this.effect, this.owner);

    }
    step() {
        this.updateCommands();
        if (!this.isDead) {
            if (this.isMoving) {
                this.move(this.moveOffset);
            }
            if (!this.isDisabledRotation()) {
                this.facingYaw = Interpolation.RotDivisionSpring(this.facingYaw, this.logicAngle, 15 / GameConfig.getInstance().timeScale);
            }
            if (!this.isDisabledMovement()) {
                if (this.moveTime <= 0) this.isMoving = false;
                else this.moveTime -= this.lastStepSize;
                if (this.isMoving != this.wasMoving) this.moveStateChanged();
                this.wasMoving = this.isMoving;
            }
            this.handleCrowding();
        }
        this.draw();

        this.wasDead = this.isDead;
    }

    private crowdingOffsetUpdate = 0;
    private crowdingOffset = Vector2.new(0, 0);
    private handleCrowding() {
        this.crowdingOffsetUpdate++;
        if (this.crowdingOffsetUpdate >= 10) {
            let other = CUnit.unitPool.getClosestAliveNotSelf(this);
            if (other) {
                this.crowdingOffset.updateTo(0, 0);

                let intersectingThicc = (this.thiccness + other.thiccness) * 2;
                let distance = this.position.distanceTo(other.position);
                if (distance < intersectingThicc) {
                    this.crowdingOffset.polarProject(1 - (distance / intersectingThicc), this.position.directionFrom(other.position));
                    this.crowdingOffset.divideOffsetNum(0.25);
                    this.crowdingOffset.divideOffsetNum(this.poise);
                }
            }
            if (this.crowdingOffset.x != 0 || this.crowdingOffset.y != 0) {
                this.forceMove(this.crowdingOffset);
            }
        }
    }
    public isDominated() {
        return this.dominated > 0;
    }
    public isDisabledMovement() {
        return this.disableMovement > 0;
    }
    public isDisabledRotation() {
        return this.disableRotation > 0;
    }
    public isDisabledFaceCommand() {
        return this.disableFaceCommand > 0;
    }
    public isDisabledHitbox() {
        return this.disableHitbox > 0;
    }

    public addComponent(command: IComponent) {
        if (!Quick.Contains(this.subComponents, command)) {
            this.subComponents.push(command);
        }
    }
    public removeComponent(command: IComponent) {
        Quick.Remove(this.subComponents, command);
        command.destroy();
    }
    public revive() {
        this.health = this.maxHealth;
        this.isDead = false;
        CUnit.unitPool.update();
    }
    public teleport(to: Vector2) {
        this.position.x = to.x;
        this.position.y = to.y;
    }
    public setAutoMoveData(offset: Vector2, seconds: number = 0.1): boolean {
        if (this.disableMovement > 0) return false;
        if (offset.x == 0 && offset.y == 0) return false;

        this.moveTime = seconds;
        this.isMoving = true;
        this.moveOffset.updateToPoint(offset);
        return true;
    }
    public move(offset: Vector2) {
        if (this.isDisabledMovement()) return;
        if (offset.x == 0 && offset.y == 0) return;

        let next = Vector2.new(0, 0).polarProject(
            this.getActualMoveSpeed(),
            offset.getAngleDegrees(),
        );

        this.setFacing(next.getAngleDegrees());
        this.forceMove(next);
    }
    getActualMoveSpeed() {
        return math.max(0, this.moveSpeed + this.moveSpeedBonus) * GameConfig.getInstance().timeScale;
    }
    public forceMove(offset: Vector2) {
        if (this.collision.getCollisionCircle(this.position.x + offset.x, this.position.y, this.thiccness)) {
            this.position.x += offset.x;
        }
        if (this.collision.getCollisionCircle(this.position.x, this.position.y + offset.y, this.thiccness)) {
            this.position.y += offset.y;
        }
    }
    public setFacing(angle: number) {
        if (this.isDisabledFaceCommand()) return;
        this.forceFacing(angle);
    }
    public forceFacing(angle: number) {
        this.logicAngle = angle % 360;
    }
    public forceFacingWithVisual(angle: number) {
        this.logicAngle = angle % 360;
        this.facingYaw = angle % 360;
    }
    public setAnimation(type: animtype, ...subanims: subanimtype[]) {
        BlzSpecialEffectClearSubAnimations(this.effect);
        this.lastAnimationType = type;
        for (let subAnim of subanims) {
            BlzSpecialEffectAddSubAnimation(this.effect, subAnim);
        }
        BlzPlaySpecialEffect(this.effect, type);
    }
    public setVisualTimeScale(scale: number) {
        this.visualTimeScale = scale;
        BlzSetSpecialEffectTimeScale(this.effect, this.visualTimeScale * GameConfig.getInstance().timeScale);
    }
    public canBeHit() {
        return !this.isDisabledHitbox();
    }
    public dealDamage(damage: number, attacker: CUnit) {
        this.health -= damage;
        this.clampHealth(attacker);
    }
    public setMaxHealth(mh: number) {
        this.maxHealth = mh;
        this.clampHealth();
    }
    public dealHealing(damage: number, healer: CUnit) {
        this.health += damage;
        this.clampHealth(healer);
    }
    public createSpawnEffect(effectPath: string, scale: number = 1, duration: number = 2) {
        let eff = AddSpecialEffect(effectPath, this.position.x, this.position.y);
        BlzSetSpecialEffectScale(eff, scale);
        Delay.addDelay(() => {
            DestroyEffect(eff);
        }, duration);
        return eff;
    }
    public killUnit() {
        for (let i = this.subComponents.length - 1; i >= 0; i--) {
            let comp = this.subComponents[i];
            if (comp.removeOnDeath) {
                this.removeComponent(comp);
            }
        }
        this.health = 0;
        this.moveTime = 0;
        this.isDead = true;
        this.isMoving = false;
        this.wasMoving = false;
        this.setAnimation(ANIM_TYPE_DEATH);
        this.setVisualTimeScale(1);
        CUnit.unitPool.update();
    }
    public getZValue() {
        let zExtra = this.displayHeight;
        if (IsTerrainPathable(this.position.x, this.position.y, PATHING_TYPE_AMPHIBIOUSPATHING)) {
            zExtra -= 32;
        }

        return this.position.getZ() + zExtra;
    }

    private clampHealth(dealer?: CUnit) {
        if (this.health >= this.maxHealth) {
            this.health = this.maxHealth;
        }
        if (this.health <= 0) {
            this.isDead = true;
            this.killUnit();
        }
    }
    private updateCommands() {
        for (let i = this.subComponents.length - 1; i >= 0; i--) {
            let command = this.subComponents[i];
            if (command.isFinished || this.queueForRemoval) {
                this.removeComponent(command);
            }
        }
    }
    private moveStateChanged() {
        if (this.isMoving) {
            this.setAnimation(ANIM_TYPE_WALK);
        } else {
            this.setAnimation(ANIM_TYPE_STAND);
        }
    }
    private draw() {
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.getZValue());
        BlzSetSpecialEffectScale(this.effect, this.modelScale);
        BlzSetSpecialEffectTimeScale(this.effect, this.visualTimeScale * GameConfig.getInstance().timeScale);
        BlzSetSpecialEffectOrientation(this.effect,
            this.facingYaw * bj_DEGTORAD,
            this.facingPitch * bj_DEGTORAD,
            this.facingRoll * bj_DEGTORAD
        );
    }

    public onDelete() {
        for (let i = this.subComponents.length - 1; i >= 0; i--) {
            let comp = this.subComponents[i];
            this.removeComponent(comp);
        }

        this.position.updateTo(30000, 30000);
        BlzSetSpecialEffectPosition(this.effect, 30000, 30000, -6000);
        this.modelScale = 0;
        Delay.addDelay(() => {
            BlzSetSpecialEffectTimeScale(this.effect, 1);
            BlzSetSpecialEffectScale(this.effect, 0);
            DestroyEffect(this.effect);
        });
        this.remove();
    }
    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BLOOD_RED, 1, 5);
    }
}

