import {TreeThread} from "../../TreeRunnable";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {CUnit} from "../CUnit/CUnit";

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
            target.onHit(this);
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


