import {CProjectileLinear} from "../CProjectileLinear";
import {CUnit} from "../../CUnit/CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";

export class CProjectileEnemyRangedAttackSmall extends CProjectileLinear {
    constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner, targetOffset, Models.PROJECTILE_ENEMY_RANGED_SMALL, owner.position);
        this.visualHeight = 64;
        this.speed = 7;
    }
}