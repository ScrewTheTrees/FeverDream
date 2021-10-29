import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";
import {CAIEnemyMelee} from "../../CComponent/AI/CAIEnemyMelee";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {CComponentRemoveOnDeath} from "../../CComponent/CComponentRemoveOnDeath";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CProjectile} from "../../Projectiles/CProjectile";

export class CUnitTypeEnemyMeleeFodderSkeleton extends CUnit {
    public poise = 0.5;
    public moveSpeed = 4;
    public modelScale = 0.8;
    public projectileCollisionSize = 22;

    public constructor(owner: player, position: Vector2, focus?: CUnit) {
        super(owner, Models.UNIT_SKELETON, position);
        this.setMaxHealth(1);
        this.addComponent(new CAIEnemyMelee(this, focus));
        this.addComponent(new CComponentRemoveOnDeath(this));

        this.createSpawnEffect(Models.EFFECT_DARK_RITUAL_SPAWN);
        BlzSetSpecialEffectColorByPlayer(this.effect, Players.NEUTRAL_HOSTILE);
        this.facingAngle = TreeMath.RandAngle();
        this.wantedAngle = this.facingAngle;
    }

    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BALLISTA_IMPACT, 1, 5);
    }
}
