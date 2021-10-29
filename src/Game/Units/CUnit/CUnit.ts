import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {IComponent} from "../CComponent/CCoroutineComponent";
import {CUnitPool} from "./CUnitPool";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {Models} from "../../Models";
import {CProjectile} from "../Projectiles/CProjectile";
import {GameConfig} from "../../../GameConfig";
import {BootlegCollisionMap} from "../BootlegCollisionMap";

export abstract class CUnit extends Entity {
    public static unitPool: CUnitPool = new CUnitPool();

    public owner: player;
    public effect: effect;
    public lastAnimationType: animtype = ANIM_TYPE_STAND;
    public queueForRemoval: boolean = false;
    public modelScale: number = 1;
    public visualTimeScale: number = 1;

    public position: Vector2;
    public facingAngle: number = 0;
    public wantedAngle: number = 0;
    public isMoving: boolean = false;
    public wasMoving: boolean = false;
    protected moveTime: number = 0;
    protected maxMoveTime: number = 25;

    public disableMovement: number = 0;
    public disableRotation: number = 0;
    public disableFaceCommand: number = 0;
    public disableCommandUpdate: number = 0;
    public dominated: number = 0;

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
        if (this.disableCommandUpdate <= 0) {
            this.updateCommands();
        }
        if (!this.isDead) {
            if (this.isMoving) {
                this.move(this.moveOffset);
            }
            if (this.disableRotation <= 0) {
                this.facingAngle = Interpolation.RotDivisionSpring(this.facingAngle, this.wantedAngle, 15 / GameConfig.getInstance().timeScale);
            }
            if (this.disableMovement <= 0) {
                if (this.moveTime <= 0) this.isMoving = false;
                else this.moveTime -= 1;
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
                this.moveRaw(this.crowdingOffset)
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
    public isDisabledCommandUpdate() {
        return this.disableCommandUpdate > 0;
    }

    public addComponent(command: IComponent) {
        if (!Quick.Contains(this.subComponents, command)) {
            this.subComponents.push(command)
            command.timerDelay = this.timerDelay;
            command.resume();
        }
    }
    public removeComponent(command: IComponent) {
        Quick.Remove(this.subComponents, command);
        command.stop();
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
    public setAutoMoveData(offset: Vector2) {
        if (this.disableMovement > 0) return;
        if (offset.x == 0 && offset.y == 0) return;

        this.moveTime = this.maxMoveTime;
        this.isMoving = true;
        this.moveOffset.updateToPoint(offset);
    }
    public move(offset: Vector2) {
        if (this.disableMovement > 0) return;
        if (offset.x == 0 && offset.y == 0) return;

        let next = Vector2.new(0, 0).polarProject(
            this.getActualMoveSpeed(),
            offset.getAngleDegrees(),
        );

        this.setFacing(next.getAngleDegrees());
        this.moveRaw(next);
    }
    getActualMoveSpeed() {
        return (this.moveSpeed + this.moveSpeedBonus) * GameConfig.getInstance().timeScale;
    }
    public moveRaw(offset: Vector2) {
        if (this.collision.getCollisionCircle(this.position.x + offset.x, this.position.y, this.thiccness)) {
            this.position.x += offset.x;
        }
        if (this.collision.getCollisionCircle(this.position.x, this.position.y + offset.y, this.thiccness)) {
            this.position.y += offset.y;
        }
    }
    public setFacing(angle: number) {
        if (this.disableFaceCommand > 0) return;
        this.wantedAngle = angle % 360;
    }
    public forceFacing(angle: number) {
        this.wantedAngle = angle % 360;
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
            } else {
                command.resume();
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
        let zExtra = 0;
        if (IsTerrainPathable(this.position.x, this.position.y, PATHING_TYPE_AMPHIBIOUSPATHING)) {
            zExtra -= 32;
        }
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.position.getZ() + zExtra);
        BlzSetSpecialEffectScale(this.effect, this.modelScale);
        BlzSetSpecialEffectTimeScale(this.effect, this.visualTimeScale * GameConfig.getInstance().timeScale);
        BlzSetSpecialEffectYaw(this.effect,
            this.facingAngle * bj_DEGTORAD
        );
    }

    public onDelete() {
        this.position.updateTo(30000, 30000);
        BlzSetSpecialEffectPosition(this.effect, 30000, 30000, -6000);
        this.modelScale = 0;
        Delay.addDelay(() => {
            BlzSetSpecialEffectTimeScale(this.effect, 1);
            BlzSetSpecialEffectScale(this.effect, 0);
            DestroyEffect(this.effect);
        });
        for (let i = this.subComponents.length - 1; i >= 0; i--) {
            let comp = this.subComponents[i];
            this.removeComponent(comp);
        }
        this.remove();
    }
    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BLOOD_RED, 1, 5);
    }
}

