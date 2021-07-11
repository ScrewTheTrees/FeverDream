import {TreeThread} from "../../TreeRunnable";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {CUnit} from "../CUnit/CUnit";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {Models} from "../../Models";

export abstract class CProjectile extends TreeThread {
    public owner: CUnit;
    public targetOffset: Vector2;
    public position: Vector2;

    public damage: number = 25;
    public durability: number = 1;

    protected constructor(owner: CUnit, targetOffset: Vector2, position: Vector2) {
        super();
        this.owner = owner;
        this.targetOffset = targetOffset.copy();
        this.position = position.copy();
    }
    abstract execute(): void;
    abstract onDestroy(): void;

    public targetsHit: CUnit[] = [];
    public onHit(target: CUnit) {
        if (IsPlayerEnemy(this.owner.owner, target.owner)
            && !Quick.Contains(this.targetsHit, target)
            && this.durability > 0
        ) {
            target.dealDamage(this.damage, this.owner);
            this.durability -= target.poise;
            this.targetsHit.push(target);
        }
        if (this.durability <= 0) {
            this.destroy();
        }
    }
    public destroy() {
        this.onDestroy();
        this.remove();
    }
}

export class CProjectileMeleeCircle extends CProjectile {
    public effect: effect;
    public speed: number = 16;
    public visualHeight: number = 0;
    public collisionSize: number = 32;
    public targets: CUnit[] = [];

    public constructor(owner: CUnit, targetOffset: Vector2, model: string, position: Vector2) {
        super(owner, targetOffset, position);
        this.effect = AddSpecialEffect(model, position.x, position.y);
        this.durability = 0.2;
    }
    execute(): void {
        this.position.polarProject(this.speed, this.targetOffset.getAngleDegrees());

        while (this.durability > 0) {
            this.targets = CUnit.unitPool.getAliveUnitsInRange(this.position, this.collisionSize + 128);
            for (let targ of this.targets) {
                if (targ != this.owner) {
                    if (this.position.distanceTo(targ.position) < this.collisionSize + targ.collisionSize) {
                        this.onHit(targ);
                    }
                }
            }
            Quick.Clear(this.targets);
            this.draw();
            this.durability -= this.timerDelay;
            this.yield();
        }
        this.yieldTimed(2);
        this.onDestroy();
    }
    private draw() {
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.position.getZ() + this.visualHeight);
        BlzSetSpecialEffectYaw(this.effect,
            this.targetOffset.getAngle()
        );
    }
    onDestroy(): void {
        this.remove();
        DestroyEffect(this.effect);
        this.targetOffset.recycle();
        this.position.recycle();
    }
}

export class CProjectileLinear extends CProjectile {
    public effect: effect;
    public speed: number = 16;
    public cliffHeight: number;
    public visualHeight: number = 0;
    public collisionSize: number = 16;
    public targets: CUnit[] = [];

    public constructor(owner: CUnit, targetOffset: Vector2, model: string, position: Vector2) {
        super(owner, targetOffset, position);
        this.effect = AddSpecialEffect(model, position.x, position.y);
        this.cliffHeight = GetTerrainCliffLevel(this.position.x, this.position.y);
    }

    execute(): void {
        while (this.durability > 0) {
            if (PointWalkableChecker.getInstance().checkTerrainXY(this.position.x, this.position.y)) {
                this.position.polarProject(this.speed,
                    this.targetOffset.getAngleDegrees()
                );
                this.targets = CUnit.unitPool.getAliveUnitsInRange(this.position, this.collisionSize + 128);
                for (let targ of this.targets) {
                    if (targ != this.owner) {
                        if (this.position.distanceTo(targ.position) < this.collisionSize + targ.collisionSize) {
                            this.onHit(targ);
                        }
                    }
                }
                Quick.Clear(this.targets);
                this.draw();
            } else {
                this.onDestroy();
            }
            this.yield();
        }

    }

    private draw() {
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.position.getZ() + this.visualHeight);
        BlzSetSpecialEffectYaw(this.effect,
            this.targetOffset.getAngle()
        );
    }

    onDestroy() {
        this.remove();
        DestroyEffect(this.effect);
        this.targetOffset.recycle();
        this.position.recycle();
    }
}


export class CProjectilePlayerShoot extends CProjectileLinear {
    constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner, targetOffset, Models.PROJECTILE_PLAYER_FIRE, owner.position);
        this.visualHeight = 64;
    }
}

export class CProjectileEnemyMelee extends CProjectileMeleeCircle {
    constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner, targetOffset, Models.PROJECTILE_ENEMY_MELEE, owner.position);
        this.visualHeight = 32;
        this.speed = 64;
        BlzSetSpecialEffectScale(this.effect, 0.3);
    }
}