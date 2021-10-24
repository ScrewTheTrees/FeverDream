import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {CComponentRemoveOnDeath} from "../../CComponent/CComponentRemoveOnDeath";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CAIEnemyRangedKiting} from "../../CComponent/AI/CAIEnemyRangedKiting";
import {CProjectile} from "../../Projectiles/CProjectile";

export class CUnitTypeEnemyRangedSiren extends CUnit {
    public moveSpeed = 1.5;
    public modelScale = 0.6;

    public constructor(owner: player, position: Vector2, focus?: CUnit) {
        super(owner, Models.UNIT_NAGA_SIREN, position);
        this.setMaxHealth(50);
        this.addComponent(new CAIEnemyRangedKiting(this, focus));
        this.addComponent(new CComponentRemoveOnDeath(this));

        BlzSetSpecialEffectColorByPlayer(this.effect, Players.NEUTRAL_HOSTILE);
        this.facingAngle = TreeMath.RandAngle();
        this.wantedAngle = this.facingAngle;

        this.createSpawnEffect(Models.EFFECT_WATER_SPLASH, 2);
        this.setAnimation(ANIM_TYPE_MORPH, SUBANIM_TYPE_ALTERNATE_EX);
    }
    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BLOOD_GREEN, 1, 5);
    }
}