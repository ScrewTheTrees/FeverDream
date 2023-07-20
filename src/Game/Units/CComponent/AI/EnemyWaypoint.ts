import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";

export class EnemyWaypoint {
    public readonly position: Vector2;
    public readonly durationBeforeUpdate: number;
    public readonly moveInstantlyOnReach: boolean = true;


    constructor(position: Vector2, durationBeforeUpdate: number = 300, moveInstantlyOnReach: boolean = true) {
        this.position = position;
        this.durationBeforeUpdate = durationBeforeUpdate;
        this.moveInstantlyOnReach = moveInstantlyOnReach;
    }
}