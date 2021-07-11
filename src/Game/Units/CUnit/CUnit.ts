import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {IComponent} from "../CComponent/CCoroutineComponent";
import {CUnitPool} from "./CUnitPool";

export abstract class CUnit extends Entity {
    public static unitPool: CUnitPool = new CUnitPool();

    public owner: player;
    public effect: effect;
    public lastAnimationType: animtype = ANIM_TYPE_STAND;
    public queueForRemoval: boolean = false;

    public position: Vector2;
    public facingAngle: number = 0;
    public wantedAngle: number = 0;
    public isMoving: boolean = false;
    public wasMoving: boolean = false;
    private moveTime: number = 0;
    private maxMoveTime: number = 3;

    public disableMovement: number = 0;
    public disableRotation: number = 0;
    public disableFaceCommand: number = 0;
    public disableCommandUpdate: number = 0;
    public dominated: number = 0;

    public health: number = 100;
    public maxHealth: number = 100;
    private wasDead: boolean = false;
    public isDead: boolean = false;
    public collisionSize: number = 32;
    public poise: number = 1;

    public moveOffset: Vector2 = Vector2.new(0, 0);
    public moveSpeed = 3;
    public moveSpeedBonus = 0;

    public subComponents: IComponent[] = [];

    private checker = PointWalkableChecker.getInstance();

    public constructor(owner: player, model: string, position: Vector2) {
        super(0.01);
        CUnit.unitPool.addUnit(this);
        this.owner = owner;
        this.effect = AddSpecialEffect(model, position.x, position.y);
        this.position = position.copy();
        BlzSetSpecialEffectColorByPlayer(this.effect, this.owner);

    }
    step() {
        if (this.isDead && !this.wasDead) {
            for (let i = this.subComponents.length - 1; i >= 0; i--) {
                let comp = this.subComponents[i];
                if (comp.removeOnDeath) {
                    this.removeComponent(comp);
                }
            }
            this.setAnimation(ANIM_TYPE_DEATH);
            this.setTimescale(1);
            CUnit.unitPool.update();
        }
        if (this.queueForRemoval) {
            CUnit.unitPool.update();
            this.remove();
        }
        if (this.disableCommandUpdate <= 0) {
            this.updateCommands();
        }
        if (!this.isDead) {
            if (this.isMoving) {
                this.move(this.moveOffset);
            }
            if (this.disableRotation <= 0) {
                this.facingAngle = Interpolation.RotDivisionSpring(this.facingAngle, this.wantedAngle, 15);
            }
            if (this.disableMovement <= 0) {
                if (this.moveTime <= 0) this.isMoving = false;
                else this.moveTime -= 1;
                if (this.isMoving != this.wasMoving) this.moveStateChanged();
                this.wasMoving = this.isMoving;
            }
        }
        this.draw();

        this.wasDead = this.isDead;
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
            this.moveSpeed + this.moveSpeedBonus,
            offset.getAngleDegrees(),
        );

        this.setFacing(next.getAngleDegrees());
        if (this.checker.checkTerrainXY(this.position.x + next.x, this.position.y)) {
            this.position.x += next.x;
        }
        if (this.checker.checkTerrainXY(this.position.x, this.position.y + next.y)) {
            this.position.y += next.y;
        }
    }
    public setFacing(angle: number) {
        if (this.disableFaceCommand > 0) return;
        this.wantedAngle = angle % 360;
    }
    public forceFacing(angle: number) {
        this.wantedAngle = angle % 360;
    }
    public setAnimation(type: animtype) {
        this.lastAnimationType = type;
        BlzPlaySpecialEffect(this.effect, type);
    }
    public setTimescale(scale: number) {
        BlzSetSpecialEffectTimeScale(this.effect, scale)
    }
    public dealDamage(damage: number, attacker: CUnit) {
        this.health -= damage;
        this.clampHealth();
    }
    public setMaxHealth(mh: number) {
        this.maxHealth = mh;
        this.clampHealth();
    }
    public dealHealing(damage: number, healer: CUnit) {
        this.health += damage;
        this.clampHealth();
    }

    private clampHealth() {
        if (this.health >= this.maxHealth) {
            this.health = this.maxHealth;
        }
        if (this.health <= 0) {
            this.isDead = true;
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
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.position.getZ());
        BlzSetSpecialEffectYaw(this.effect,
            this.facingAngle * bj_DEGTORAD
        );
    }

    public onDelete() {
        BlzSetSpecialEffectTimeScale(this.effect, 99999);
        BlzSetSpecialEffectScale(this.effect, 0);
        DestroyEffect(this.effect);

        for (let i = this.subComponents.length - 1; i >= 0; i--) {
            let comp = this.subComponents[i];
            this.removeComponent(comp);
        }
    }
}
