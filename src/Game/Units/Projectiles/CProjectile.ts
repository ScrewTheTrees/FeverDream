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
    abstract onDeath(): void;

    public targetsHit: CUnit[] = [];
    public onHit(target: CUnit) {
        if (IsPlayerEnemy(this.owner.owner, target.owner) && !Quick.Contains(this.targetsHit, target)) {
            target.dealDamage(this.damage, this.owner);
            print(GetPlayerName(this.owner.owner), GetPlayerName(target.owner));
            print("Damage!", this.damage);
            this.durability -= target.poise;
            this.targetsHit.push(target);
            if (this.durability <= 0) {
                this.destroy();
            }
        }
    }
    public destroy() {
        this.onDeath();
        this.remove();
    }
}

export class CProjectileLinear extends CProjectile {
    public effect: effect;
    public speed: number = 10;
    public cliffHeight: number;
    public visualHeight: number = 0;
    public collisionSize: number = 16;

    public constructor(owner: CUnit, targetOffset: Vector2, model: string, position: Vector2) {
        super(owner, targetOffset, position);
        this.owner = owner;
        this.effect = AddSpecialEffect(model, position.x, position.y);
        this.cliffHeight = GetTerrainCliffLevel(this.position.x, this.position.y);
    }

    execute(): void {
        while (!this.owner.queueForRemoval) {
            if (PointWalkableChecker.getInstance().checkTerrainXY(this.position.x, this.position.y)) {
                this.position.polarProject(this.speed,
                    this.targetOffset.getAngleDegrees()
                );
                let targets = CUnit.unitPool.getAliveUnitsInRange(this.position, 128);
                for (let targ of targets) {
                    if (targ != this.owner) {
                        //print(targets.length);
                        //this.onHit(targ);
                    }
                }
                this.draw();
            } else {
                this.onDeath();
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

    onDeath() {
        this.remove();
        DestroyEffect(this.effect);
        //this.targetOffset.recycle();
        //this.position.recycle();
    }
}


export class CProjectilePlayerShoot extends CProjectileLinear {
    constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner, targetOffset, Models.PROJECTILE_PHOENIX_FIRE, owner.position);
        this.visualHeight = 64;
    }
}