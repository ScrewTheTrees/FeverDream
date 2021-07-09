import {TreeThread} from "../TreeRunnable";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "./CUnit";

export abstract class CCommand extends TreeThread {

    public constructor(public owner: CUnit, public targetOffset: Vector2) {
        super();
    }
    abstract execute(): void;
}