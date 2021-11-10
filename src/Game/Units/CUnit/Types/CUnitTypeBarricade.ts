import {Models} from "../../../Models";
import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CComponentPlayerInput} from "../../CComponent/Player/CComponentPlayerInput";
import {CComponentRemoveOnDeath} from "../../CComponent/CComponentRemoveOnDeath";
import {CComponentHealOverTime} from "../../CComponent/CComponentHealOverTime";
import {CProjectile} from "../../Projectiles/CProjectile";

export class CUnitTypeBarricade extends CUnit {

    public poise = 8;
    public canBePushed = false;
    public projectileCollisionSize = 76;
    public terrainCollisionSize = 76;
    public crowdingCollisionSize = 76;
    public modelScale = 1;

    public constructor(owner: player, position: Vector2) {
        super(owner, Models.UNIT_BUILDING_BARRICADE, position);

        this.setMaxHealth(1, true);
        this.setMaxHealth(100, false);
        this.addComponent(new CComponentRemoveOnDeath(this));
        this.addComponent(new CComponentHealOverTime(this, 50, 2.5)); // 125 hp (100 clamp)
    }

    public onHit(other: CProjectile) {
        this.createSpawnEffect(Models.EFFECT_BALLISTA_IMPACT, 1, 5);
    }
}


