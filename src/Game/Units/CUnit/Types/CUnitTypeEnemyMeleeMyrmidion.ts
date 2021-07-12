import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {CComponentRemoveOnDeath} from "../../CComponent/CComponentRemoveOnDeath";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CAIEnemyMeleeSlowLarge} from "../../CComponent/AI/CAIEnemyMeleeSlowLarge";
import {CProjectile} from "../../Projectiles/CProjectile";

export class CUnitTypeEnemyMeleeMyrmidion extends CUnit {
    public constructor(owner: player, position: Vector2, focus?: CUnit) {
        super(owner, Models.UNIT_NAGA_MYRMIDION, position);
        this.moveSpeed = 1.5;
        this.modelScale = 0.6;
        this.setMaxHealth(75);
        this.addComponent(new CAIEnemyMeleeSlowLarge(this, focus));
        this.addComponent(new CComponentRemoveOnDeath(this));

        BlzSetSpecialEffectColorByPlayer(this.effect, Players.NEUTRAL_HOSTILE);
        this.facingAngle = TreeMath.RandAngle();
        this.wantedAngle = this.facingAngle;

        this.createSpawnEffect(Models.EFFECT_WATER_SPLASH, 2);
        this.setAnimation(ANIM_TYPE_WALK, SUBANIM_TYPE_SWIM);

    }
    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BLOOD_GREEN, 1, 5);
    }
}