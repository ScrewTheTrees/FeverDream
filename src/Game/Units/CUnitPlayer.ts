import {Models} from "../Models";
import {CUnit} from "./CUnit";

export class CUnitPlayer extends CUnit {
    public constructor(owner: player, x: number, y: number) {
        super(owner, Models.UNIT_RIFLEMAN, x, y);
    }
}