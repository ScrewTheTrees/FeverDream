import {Models} from "../../../Models";
import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CComponentPlayerInput} from "../../CComponent/Player/CComponentPlayerInput";

export class CUnitTypePlayer extends CUnit {
    public constructor(owner: player, position: Vector2) {
        super(owner, Models.UNIT_RIFLEMAN, position);

        this.addComponent(new CComponentPlayerInput(this));
        this.modelScale = 0.9;
    }
}


