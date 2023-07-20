import {CProjectileMeleeCircle} from "../CProjectileMeleeCircle";
import {CUnit} from "../../CUnit/CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";

export class CProjectileEnemyMeleeLarge extends CProjectileMeleeCircle {
    constructor(owner: CUnit, targetOffset: Vector2, scale: number = 0.5) {
        super(owner, targetOffset, Models.PROJECTILE_ENEMY_MELEE, owner.getPosition());
        this.visualHeight = 32;
        this.speed = 75;
        this.collisionSize = 128;
        BlzSetSpecialEffectScale(this.effect, scale);
    }
}