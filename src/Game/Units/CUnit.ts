import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {TreeThread} from "../TreeRunnable";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Models} from "../Models";
import {CCommand} from "./CCommand";

export class CProjectileLinear extends TreeThread {
    public owner: CUnit;
    public targetOffset: Vector2;
    public effect: effect;
    public position: Vector2;
    public speed: number = 10;

    public constructor(owner: CUnit, targetOffset: Vector2, model: string, x: number, y: number) {
        super();
        this.owner = owner;
        this.targetOffset = targetOffset.copy();
        this.effect = AddSpecialEffect(model, x, y);
        this.position = Vector2.new(x, y);
    }

    execute(): void {
        while (PointWalkableChecker.getInstance().checkTerrainXY(this.position.x, this.position.y)) {
            this.position.polarProject(this.speed,
                this.targetOffset.getAngleDegrees() + 90
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
        BlzSetSpecialEffectZ(this.effect, this.position.getZ());
        BlzSetSpecialEffectYaw(this.effect,
            ((this.targetOffset.getAngleDegrees() + 90) * bj_DEGTORAD)
        );
    }
}

export class CCommandPlayerFire extends CCommand {
    execute(): void {
        this.owner.disableMovement += 1;
        this.owner.disableFaceCommand += 1;
        this.owner.forceFacing(this.targetOffset.getAngleDegrees());
        let resetAnim = this.owner.lastAnimationType;
        this.owner.setAnimation(ANIM_TYPE_ATTACK);
        this.owner.setTimescale(0.02);
        print("Start");

        this.yieldTimed(0.75);
        this.owner.setTimescale(1);
        new CProjectileLinear(this.owner, this.targetOffset, Models.RIFLEMAN, this.owner.position.x, this.owner.position.y);
        print("Projectile");

        this.yieldTimed(0.5);

        print("Finish");

        this.owner.setAnimation(resetAnim);
        this.owner.disableMovement -= 1;
        this.owner.disableFaceCommand -= 1;
        this.targetOffset.recycle();
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

    public health: number = 0;
    public maxHealth: number = 3;
    public isDead: boolean = false;
    public moveSpeed = 3;

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
        if (this.dominantCommand && this.dominantCommand.isFinished) {
            this.dominantCommand = undefined;
        }
        for (let i = this.asyncCommands.length - 1; i >= 0; i--) {
            let command = this.asyncCommands[i];
            if (command.isFinished) Quick.Slice(this.asyncCommands, i);
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

        let next = Vector2.new(0, 0).polarProject(this.moveSpeed,
            offset.getAngleDegrees() + 90
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
            ((this.facingAngle + 90) * bj_DEGTORAD)
        );
    }
}

