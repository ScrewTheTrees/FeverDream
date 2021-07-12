import {CUnit} from "../CUnit/CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {CProjectile} from "./CProjectile";

export class CProjectileMeleeCircle extends CProjectile {
    public effect: effect;
    public speed: number = 16;
    public visualHeight: number = 0;
    public collisionSize: number = 40;
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