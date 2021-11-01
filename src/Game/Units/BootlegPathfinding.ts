import {PathfinderRectangle} from "wc3-treelib/src/TreeLib/Pathfinder/PathfinderRectangle";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreePromise} from "wc3-treelib/src/TreeLib/Utility/TreePromise";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Pathfinder/PathfindResult";
import {RectangleNode} from "wc3-treelib/src/TreeLib/Pathfinder/Node";
import {TreeThread} from "wc3-treelib/src/TreeLib/Utility/TreeThread";

export class BootlegPathfinding {
    private static _instance: BootlegPathfinding;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new BootlegPathfinding();
        }
        return this._instance;
    }

    public pathfinder: PathfinderRectangle;

    private constructor() {
        this.pathfinder = new PathfinderRectangle(31000, 31000, -31000, -31000,
            64, true, true, true);

    }
    public findAsync(from: Vector2, to: Vector2): TreePromise<PathfindResult<RectangleNode>, TreeThread> {
        return this.pathfinder.findPathAsync(from, to, 2048, 256);
    }
    public find(from: Vector2, to: Vector2) {
        return this.pathfinder.findPath(from, to, 256);
    }
}