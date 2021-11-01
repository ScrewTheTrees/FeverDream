import {CProjectileEnemyRangedAttackArrow} from "../../../Projectiles/Enemy/CProjectileEnemyRangedAttackArrow";
import {CComponentGenericEnemyAttack} from "./CComponentGenericEnemyAttack";

export class CComponentEnemyRangedArrow extends CComponentGenericEnemyAttack {
    public createProjectile() {
        return new CProjectileEnemyRangedAttackArrow(this.owner, this.targetOffset);
    }
}