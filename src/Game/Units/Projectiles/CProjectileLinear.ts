import {CUnit} from "../CUnit/CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {CProjectile} from "./CProjectile";
import {GameConfig} from "../../../GameConfig";
import {BootlegCollisionMap} from "../BootlegCollisionMap";

export class CProjectileLinear extends CProjectile {
    public effect: effect;
    public speed: number = 12;
    public cliffHeight: number;
    public visualHeight: number = 0;
    public collisionSize: number = 16;
    public travelTime: number = 10;

    public constructor(owner: CUnit, targetOffset: Vector2, model: string, position: Vector2) {
        super(owner, targetOffset, position);
        this.effect = AddSpecialEffect(model, position.x, position.y);
        this.cliffHeight = GetTerrainCliffLevel(this.position.x, this.position.y);
    }

    private collisionMap = BootlegCollisionMap.getInstance();
    execute(): void {
        while (this.durability > 0) {
            this.travelTime -= this.timeScale;
            if (this.travelTime <= 0) {
                return this.destroy();
            }
            if (this.collisionMap.getCollisionAtCoordinateEmpty(this.position.x, this.position.y)) {
                this.position.polarProject(this.speed * GameConfig.getInstance().timeScale,
                    this.targetOffset.getAngleDegrees()
                );
                this.targets = CUnit.unitPool.getAliveUnitsInRange(this.position, this.collisionSize + 128, undefined, this.targets);
                for (let targ of this.targets) {
                    if (targ != this.owner) {
                        if (this.position.distanceTo(targ.getPosition()) < this.collisionSize + targ.projectileCollisionSize) {
                            if (this.onHit(targ)) return;
                        }
                    }
                }
                Quick.Clear(this.targets);
                this.draw();
            } else {
                return this.destroy();
            }
            this.yield();
        }

    }

    private draw() {
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.position.getZ() + this.visualHeight);
        BlzSetSpecialEffectTimeScale(this.effect, GameConfig.getInstance().timeScale);
        BlzSetSpecialEffectYaw(this.effect,
            this.targetOffset.getAngle()
        );
    }

    destroy() {
        DestroyEffect(this.effect);
        super.destroy();
    }
}