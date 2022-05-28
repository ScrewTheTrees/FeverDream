import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {CUnitPool} from "./CUnitPool";
import {Models} from "../../Models";
import {CProjectile} from "../Projectiles/CProjectile";
import {GameConfig} from "../../../GameConfig";
import {BootlegCollisionMap} from "../BootlegCollisionMap";
import {IComponent} from "../CComponent/IComponent";
import {Delay} from "wc3-treelib/src/TreeLib/Services/Delay/Delay";

export abstract class CUnit extends Entity {
    public static unitPool: CUnitPool = new CUnitPool();

    public owner: player;
    public effect: effect;
    public lastAnimationType: animtype = ANIM_TYPE_STAND;
    public queueForRemoval: boolean = false;
    public modelScale: number = 1;
    public visualTimeScale: number = 1;

    private position: Vector2;
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
    public grounded: number = 0;            //CUnit is tagged as being grounded, it cannot use movement abilities.

    public health: number = 100;
    public maxHealth: number = 100;
    private wasDead: boolean = false;
    public isDead: boolean = false;

    public projectileCollisionSize: number = 32;
    public terrainCollisionSize: number = 16;
    public crowdingCollisionSize: number = 32;

    public poise: number = 1; //Dictates how much this unit is pushed around by other units and how resistant it is to piercing.
    public canBePushed: boolean = true; //Will be pushed around
    public maxPush: number = 5; //How hard this thing can be pushed in one direction at max.

    public moveOffset: Vector2 = Vector2.new(0, 0);
    public moveSpeed = 6;
    public moveSpeedBonus = 0;

    public subComponents: IComponent[] = [];

    private collision = BootlegCollisionMap.getInstance();

    protected constructor(owner: player, model: string, position: Vector2) {
        super(0.02);
        this.owner = owner;
        this.effect = AddSpecialEffect(model, position.x, position.y);
        this.position = position.copy();
        CUnit.unitPool.addUnit(this);
        CUnit.unitPool.gridAddUnit(this);
        BlzSetSpecialEffectColorByPlayer(this.effect, this.owner);

        this.unstuck();
    }

    step() {
        this.updateComponents();
        if (!this.isDead) {
            if (this.isMoving) {
                this.move(this.moveOffset);
            }
            if (!this.isDisabledRotation()) {
                this.facingYaw = Interpolation.RotDivisionSpring(this.facingYaw, this.logicAngle, 10 / GameConfig.timeScale);
            }
            if (!this.isDisabledMovement()) {
                if (this.moveTime <= 0) this.isMoving = false;
                else this.moveTime -= this.timerDelay;
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
    private crowdingArray: CUnit[] = [];
    private handleCrowding() {
        if (!this.canBePushed) return this.crowdingOffset.updateTo(0, 0);

        this.crowdingOffsetUpdate -= this.timerDelay;
        if (this.crowdingOffsetUpdate <= 0) {
            this.crowdingOffset.updateTo(0, 0);

            this.crowdingOffsetUpdate = 0.5; //Remotly low number when waiting for literally anything.

            Quick.Clear(this.crowdingArray);
            this.crowdingArray = CUnit.unitPool.getAliveUnitsInRangeNotSelf(this, 60 + (this.crowdingCollisionSize * 2), this.crowdingArray);
            for (let other of this.crowdingArray) {
                let intersectingThicc = (this.crowdingCollisionSize + other.crowdingCollisionSize);
                let distance = this.position.distanceTo(other.getPosition());
                if (distance <= intersectingThicc) {
                    let power = math.min(16, (((1 - (distance / intersectingThicc)) / 0.25) / this.poise) * other.poise)
                    this.crowdingOffset.polarProject(power, this.position.directionFrom(other.getPosition()));
                }
                let diff = (distance * this.timerDelay) / (this.getActualMoveSpeed() * 2);
                this.crowdingOffsetUpdate = math.max(0.15, math.min(this.crowdingOffsetUpdate, diff));
            }
            let gc = GameConfig;
            this.crowdingOffset.x = math.min(math.max(this.crowdingOffset.x * gc.timeScale, -this.maxPush), this.maxPush)
            this.crowdingOffset.y = math.min(math.max(this.crowdingOffset.y * gc.timeScale, -this.maxPush), this.maxPush)
        }//this.crowdingOffsetUpdate

        if (this.crowdingOffset.x != 0 || this.crowdingOffset.y != 0) {
            this.forceMove(this.crowdingOffset);
        }
    }
    public getPosition(): Vector2 {
        return this.position;
    }
    public setPosition(v: Vector2) {
        this.setPositionXY(v.x, v.y);
    }
    public setPositionXY(x: number, y: number) {
        CUnit.unitPool.gridUpdatePositionXY(this, this.position.x, this.position.y, x, y);
        this.position.x = x;
        this.position.y = y;
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
    public isDominated() {
        return this.dominated > 0;
    }
    public isGrounded() {
        return this.grounded > 0;
    }

    public addComponent<T extends IComponent>(command: T) {
        if (!Quick.Contains(this.subComponents, command)) {
            this.subComponents.push(command);
            command.step();
        }
        return command;
    }
    public removeComponent(command: IComponent) {
        Quick.Remove(this.subComponents, command);
        command.destroy();
    }
    public teleport(to: Vector2) {
        this.setPositionXY(to.x, to.y);
    }
    public setAutoMoveData(offset: Vector2, seconds: number = 0.1): boolean {
        if (this.disableMovement > 0) return false;
        if (offset.x == 0 && offset.y == 0) return false;

        this.moveTime = seconds;
        if (this.moveTime > 0) this.isMoving = true;
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
        return math.max(0, this.moveSpeed + this.moveSpeedBonus) * GameConfig.timeScale;
    }
    private forceMoveVector = Vector2.new(0, 0);
    public forceMove(offset: Vector2) {
        let nextCandidate = this.forceMoveVector.updateToPoint(this.getPosition());
        if (this.collision.getCollisionCircleEmpty(nextCandidate.x + offset.x, nextCandidate.y, this.terrainCollisionSize)) {
            nextCandidate.x += offset.x;
        }
        if (this.collision.getCollisionCircleEmpty(nextCandidate.x, nextCandidate.y + offset.y, this.terrainCollisionSize)) {
            nextCandidate.y += offset.y;
        }
        this.setPosition(nextCandidate);
    }
    public unstuck() {
        let xs = this.position.x;
        let ys = this.position.y;

        if (this.collision.getCollisionCircleEmpty(xs, ys, this.terrainCollisionSize)) return; //No change needed.

        for (let d = 1; d <= 32; d++) {
            for (let i = 0; i < d + 1; i++) {
                let x1 = xs - d + (i * 32);
                let y1 = ys - (i * 32);
                if (this.collision.getCollisionCircleEmpty(x1, y1, this.terrainCollisionSize)) return this.setPositionXY(x1, y1);

                let x2 = xs + d - (i * 32);
                let y2 = ys + (i * 32);
                if (this.collision.getCollisionCircleEmpty(x2, y2, this.terrainCollisionSize)) return this.setPositionXY(x2, y2);
            }
            for (let i = 1; i < d; i++) {
                let x1 = xs - (i * 32);
                let y1 = ys + d - (i * 32);
                if (this.collision.getCollisionCircleEmpty(x1, y1, this.terrainCollisionSize)) return this.setPositionXY(x1, y1);

                let x2 = xs + (i * 32);
                let y2 = ys - d + (i * 32);
                if (this.collision.getCollisionCircleEmpty(x2, y2, this.terrainCollisionSize)) return this.setPositionXY(x2, y2);
            }
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

        if (this.isDead) {
            type = ANIM_TYPE_DEATH;
        }
        this.lastAnimationType = type;
        for (let subAnim of subanims) {
            BlzSpecialEffectAddSubAnimation(this.effect, subAnim);
        }
        BlzPlaySpecialEffect(this.effect, type);
    }
    public setVisualTimeScale(scale: number) {
        this.visualTimeScale = scale;
        BlzSetSpecialEffectTimeScale(this.effect, this.visualTimeScale * GameConfig.timeScale);
    }
    public addVisualTimeScale(scale: number) {
        this.setVisualTimeScale(this.visualTimeScale * scale);
    }
    public removeVisualTimeScale(scale: number) {
        this.setVisualTimeScale(this.visualTimeScale / scale);
    }
    public canBeHit() {
        return !this.isDisabledHitbox();
    }
    public dealDamage(damage: number, attacker: CUnit) {
        this.health -= damage;
        this.clampHealth(attacker);
    }
    public setMaxHealth(mh: number, setCurrentHealth: boolean = false) {
        this.maxHealth = mh;
        if (setCurrentHealth) this.health = this.maxHealth;
        this.clampHealth();
    }
    public dealHealing(damage: number, healer: CUnit) {
        this.health += damage;
        this.clampHealth(healer);
    }
    public createSpawnEffect(effectPath: string, scale: number = 1, duration: number = 2) {
        let eff = AddSpecialEffect(effectPath, this.getPosition().x, this.getPosition().y);
        BlzSetSpecialEffectScale(eff, scale);
        Delay.addDelay(() => {
            DestroyEffect(eff);
            // @ts-ignore
            eff = null;
        }, duration);
        return eff;
    }
    public killUnit(dealer?: CUnit) {
        for (let i = this.subComponents.length - 1; i >= 0; i--) {
            let comp = this.subComponents[i];
            if (comp.removeOnDeath) {
                this.removeComponent(comp);
            }
        }
        CUnit.unitPool.gridUpdateIsDead(this, this.isDead, true);
        this.health = 0;
        this.moveTime = 0;
        this.isDead = true;
        this.isMoving = false;
        this.wasMoving = false;
        this.setAnimation(ANIM_TYPE_DEATH);
        this.setVisualTimeScale(1);
        CUnit.unitPool.update();
    }
    public revive() {
        CUnit.unitPool.gridUpdateIsDead(this, this.isDead, false);
        this.health = this.maxHealth;
        this.isDead = false;
        CUnit.unitPool.update();
    }
    public getZValue() {
        let zExtra = this.displayHeight;
        if (IsTerrainPathable(this.getPosition().x, this.getPosition().y, PATHING_TYPE_AMPHIBIOUSPATHING)) {
            zExtra -= 32;
        }

        return this.position.getZ() + zExtra;
    }

    private clampHealth(dealer?: CUnit) {
        if (this.health >= this.maxHealth) {
            this.health = this.maxHealth;
        }
        if (this.health <= 0) {
            this.killUnit(dealer);
        }
    }
    private updateComponents() {
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
        BlzSetSpecialEffectColorByPlayer(this.effect, this.owner);
        BlzSetSpecialEffectPosition(this.effect, this.position.x, this.position.y, this.getZValue())
        BlzSetSpecialEffectScale(this.effect, this.modelScale);
        BlzSetSpecialEffectTimeScale(this.effect, this.visualTimeScale * GameConfig.timeScale);
        BlzSetSpecialEffectOrientation(this.effect,
            this.facingYaw * bj_DEGTORAD,
            this.facingPitch * bj_DEGTORAD,
            this.facingRoll * bj_DEGTORAD
        );
    }

    public onDelete() {
        CUnit.unitPool.gridRemove(this);
        CUnit.unitPool.update();
        for (let i = this.subComponents.length - 1; i >= 0; i--) {
            let comp = this.subComponents[i];
            this.removeComponent(comp);
        }
        this.setPositionXY(30000, 30000);
        BlzSetSpecialEffectPosition(this.effect, 30000, 30000, -6000);
        BlzSetSpecialEffectTimeScale(this.effect, 1);
        BlzSetSpecialEffectScale(this.effect, 0);
        DestroyEffect(this.effect);

        this.position.recycle();
        this.remove();
    }
    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BLOOD_RED, 1, 5);
    }
}

