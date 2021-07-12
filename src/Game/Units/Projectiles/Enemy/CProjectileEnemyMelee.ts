import {CProjectileMeleeCircle} from "../CProjectileMeleeCircle";
import {CUnit} from "../../CUnit/CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";

export class CProjectileEnemyMelee extends CProjectileMeleeCircle {
    constructor(owner: CUnit, targetOffset: Vector2, scale: number = 0.3) {
        super(owner, targetOffset, Models.PROJECTILE_ENEMY_MELEE, owner.position);
        this.visualHeight = 32;
        this.speed = 50;
        BlzSetSpecialEffectScale(this.effect, scale);
    }
}