import {Models} from "../../../Models";
import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CComponentPlayerInput} from "../../CComponent/Player/CComponentPlayerInput";
import {CComponentRemoveOnDeath} from "../../CComponent/CComponentRemoveOnDeath";

export class CUnitTypeDummy extends CUnit {

    public poise = 5;
    public modelScale = 0.6;

    public constructor(owner: player, position: Vector2) {
        super(owner, Models.UNIT_PEON, position);

        this.setMaxHealth(1000, true);
        this.addComponent(new CComponentRemoveOnDeath(this));
    }
}


