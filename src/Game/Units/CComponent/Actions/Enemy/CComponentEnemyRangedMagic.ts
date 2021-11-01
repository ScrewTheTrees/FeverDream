import {CProjectileEnemyRangedAttackMagic} from "../../../Projectiles/Enemy/CProjectileEnemyRangedAttackMagic";
import {CComponentEnemyRangedArrow} from "./CComponentEnemyRangedArrow";

export class CComponentEnemyRangedMagic extends CComponentEnemyRangedArrow {
    public createProjectile() {
        return new CProjectileEnemyRangedAttackMagic(this.owner, this.targetOffset);
    }
}