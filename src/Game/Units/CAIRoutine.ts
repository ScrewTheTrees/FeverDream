import {TreeThread} from "../TreeRunnable";
import {CUnit} from "./CUnit";

export abstract class CAIRoutine extends TreeThread {
    public constructor(public owner: CUnit) {
        super(0.01, true);
    }
    abstract execute(): void;
}