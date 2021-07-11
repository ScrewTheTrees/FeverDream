import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Models} from "../../../Models";
import {CComponentAIEnemyMelee} from "../../CComponent/AI/CComponentAIEnemyMelee";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {CComponentRemoveOnDeath} from "../../CComponent/CComponentRemoveOnDeath";

export class CUnitTypeEnemyTutorialMelee extends CUnit {
    public constructor(owner: player, position: Vector2) {
        super(owner, Models.UNIT_SKELETON, position);
        this.moveSpeed = 2;
        this.setMaxHealth(1);
        this.addComponent(new CComponentAIEnemyMelee(this));
        this.addComponent(new CComponentRemoveOnDeath(this));
        BlzSetSpecialEffectColorByPlayer(this.effect, Players.NEUTRAL_HOSTILE);
    }
}