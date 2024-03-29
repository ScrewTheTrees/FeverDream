import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {CComponentRemoveOnDeath} from "../../CComponent/CComponentRemoveOnDeath";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CAIEnemyMeleeSlowLarge} from "../../CComponent/AI/CAIEnemyMeleeSlowLarge";
import {CProjectile} from "../../Projectiles/CProjectile";

export class CUnitTypeEnemyMeleeMyrmidion extends CUnit {
    public poise = 2;
    public projectileCollisionSize = 32;
    public terrainCollisionSize = 24;
    public crowdingCollisionSize = 48;
    public moveSpeed = 4;
    public modelScale = 0.6;


    public constructor(owner: player, position: Vector2, focus?: CUnit, defaultAi: boolean = true) {
        super(owner, Models.UNIT_NAGA_MYRMIDION, position);
        this.setMaxHealth(85); //4 Hits at the start, should be 3 hits after 2 damage upgrades.
        if (defaultAi) this.addAiComponent(new CAIEnemyMeleeSlowLarge(this, focus));
        this.addComponent(new CComponentRemoveOnDeath(this));

        BlzSetSpecialEffectColorByPlayer(this.effect, Players.NEUTRAL_HOSTILE);
        this.forceFacingWithVisual(TreeMath.RandAngle());

        this.createSpawnEffect(Models.EFFECT_WATER_SPLASH, 2);
        this.setAnimation(ANIM_TYPE_WALK, SUBANIM_TYPE_SWIM);

    }
    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BLOOD_GREEN, 1, 5);
    }
}