import {CProjectileLinear} from "../CProjectileLinear";
import {CUnit} from "../../CUnit/CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";

export class CProjectilePlayerShoot extends CProjectileLinear {
    constructor(owner: CUnit, targetOffset: Vector2) {
        super(owner, targetOffset, Models.PROJECTILE_PLAYER_FIRE, owner.position);
        this.visualHeight = 64;
    }
}