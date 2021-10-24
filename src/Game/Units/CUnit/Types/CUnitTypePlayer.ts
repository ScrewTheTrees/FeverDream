import {Models} from "../../../Models";
import {CUnit} from "../CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CComponentPlayerInput} from "../../CComponent/Player/CComponentPlayerInput";

export class CUnitTypePlayer extends CUnit {

    protected maxMoveTime: number = 2;
    public poise = 3;
    public modelScale = 0.9;

    public constructor(owner: player, position: Vector2) {
        super(owner, Models.UNIT_RIFLEMAN, position);

        this.addComponent(new CComponentPlayerInput(this));
    }
}


