import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {TreeThread} from "../TreeRunnable";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Models} from "../Models";
import {CCommand} from "./CCommand";
import {CAIRoutine} from "./CAIRoutine";

export class CProjectileLinear extends TreeThread {
    public owner: CUnit;
    public targetOffset: Vector2;
    public effect: effect;
    public position: Vector2;
    public speed: number = 10;
    public cliffHeight: number;
    public visualHeight: number = 0;

    public collisionSize: number = 8;

    public constructor(owner: CUnit, targetOffset: Vector2, model: string, x: number, y: number) {
        super();
        this.owner = owner;
        this.targetOffset = targetOffset.copy();
        this.effect = AddSpecialEffect(model, x, y);
        this.position = Vector2.new(x, y);
        this.cliffHeight = GetTerrainCliffLevel(this.position.x, this.position.y);
    }

    execute(): void {
        while (PointWalkableChecker.getInstance().checkTerrainXY(this.position.x, this.position.y)) {
            this.position.polarProject(this.speed,
                this.targetOffset.getAngleDegrees()
            );
            this.draw();
            this.yield();
        }

        this.position.recycle();
        this.targetOffset.recycle();
        this.position.recycle();
        DestroyEffect(this.effect);
    }

    private draw() {
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.position.getZ() + this.visualHeight);
        BlzSetSpecialEffectYaw(this.effect,
            this.targetOffset.getAngle()
        );
    }
}

export class CProjectilePlayerShoot extends CProjectileLinear {
    constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner, targetOffset, Models.PROJECTILE_PHOENIX_FIRE, owner.position.x, owner.position.y);
        this.visualHeight = 32;
    }
}

export class CCommandPlayerFire extends CCommand {
    execute(): void {
        this.owner.disableMovement += 1;
        this.owner.disableFaceCommand += 1;
        let resetAnim = this.owner.lastAnimationType;

        this.isolate(() => {
            this.owner.forceFacing(this.targetOffset.getAngleDegrees());
            this.owner.setAnimation(ANIM_TYPE_ATTACK);
            this.owner.setTimescale(0.05);

            this.yieldTimed(0.75);
            this.owner.setTimescale(1);
            new CProjectilePlayerShoot(this.owner, this.targetOffset);

            this.yieldTimed(0.5);
            //Done
        });
        this.owner.disableMovement -= 1;
        this.owner.disableFaceCommand -= 1;
        this.owner.setAnimation(resetAnim);
    }
}

export class CUnit extends Entity {
    public owner: player;
    public effect: effect;
    public lastAnimationType: animtype = ANIM_TYPE_STAND;

    public position: Vector2;
    public facingAngle: number = 0;
    public wantedAngle: number = 0;
    public isMoving: boolean = false;
    public wasMoving: boolean = false;
    private moveTime: number = 0;
    private maxMoveTime: number = 10;

    public disableMovement: number = 0;
    public disableRotation: number = 0;
    public disableFaceCommand: number = 0;
    public disableCommandUpdate: number = 0;
    public disableAI: number = 0;

    public health: number = 0;
    public maxHealth: number = 3;
    public isDead: boolean = false;
    public collisionSize: number = 32;
    public moveSpeed = 3;
    public moveSpeedBonus = 0;

    public aiRoutine?: CAIRoutine;
    public dominantCommand?: CCommand;
    public asyncCommands: CCommand[] = [];

    private checker = PointWalkableChecker.getInstance();


    public constructor(owner: player, model: string, x: number, y: number) {
        super(0.01);
        this.owner = owner;
        this.effect = AddSpecialEffect(model, x, y);
        this.position = Vector2.new(x, y);

    }
    step() {
        if (this.disableCommandUpdate <= 0) {
            this.updateCommands();
        }
        if (this.disableAI <= 0) {
            this.updateAI();
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
        this.draw();
    }


    public revive() {
        this.health = this.maxHealth;
        this.isDead = false;
    }

    public teleport(to: Vector2) {
        this.position.x = to.x;
        this.position.y = to.y;
    }
    public move(offset: Vector2) {
        if (this.disableMovement > 0) return;
        if (offset.x == 0 && offset.y == 0) return;

        this.moveTime = this.maxMoveTime;
        this.isMoving = true;

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


    private updateCommands() {
        if (this.dominantCommand) {
            if (this.dominantCommand.isFinished) {
                this.dominantCommand = undefined;
            } else {
                this.dominantCommand.timerDelay = this.timerDelay;
                this.dominantCommand.resume();
            }
        }
        for (let i = this.asyncCommands.length - 1; i >= 0; i--) {
            let command = this.asyncCommands[i];
            if (command.isFinished) Quick.Slice(this.asyncCommands, i);
            else {
                command.resume();
                command.timerDelay = this.timerDelay;
            }
        }
    }
    private updateAI() {
        if (this.aiRoutine) {
            if (this.aiRoutine.isFinished) {
                this.aiRoutine.reset();
            } else {
                this.aiRoutine.timerDelay = this.timerDelay;
                this.aiRoutine.resume();
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
        BlzSetSpecialEffectColorByPlayer(this.effect, this.owner);
        BlzSetSpecialEffectYaw(this.effect,
            this.facingAngle * bj_DEGTORAD
        );
    }
}

