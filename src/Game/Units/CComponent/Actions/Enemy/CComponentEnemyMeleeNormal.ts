import {CProjectileEnemyMelee} from "../../../Projectiles/Enemy/CProjectileEnemyMelee";
import {CComponentGenericEnemyAttack} from "./CComponentGenericEnemyAttack";

export class CComponentEnemyMeleeNormal extends CComponentGenericEnemyAttack {
    public createProjectile() {
        return new CProjectileEnemyMelee(this.owner, this.targetOffset, this.scale);
    }
}