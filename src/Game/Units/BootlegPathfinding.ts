import {PathfinderRectangle} from "wc3-treelib/src/TreeLib/Pathfinder/PathfinderRectangle";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreePromise} from "wc3-treelib/src/TreeLib/Utility/TreePromise";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Pathfinder/PathfindResult";
import { RectangleNode } from "wc3-treelib/src/TreeLib/Pathfinder/Node";
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
        return this.pathfinder.findPathAsync(from, to,1024, 8);
    }
    public find(from: Vector2, to: Vector2) {
        return this.pathfinder.findPath(from, to,1024);
    }

    public terrainRayCast(from: Vector2, to: Vector2, accuracy: number = 15, maxLength: number = 960) {
        let start = from.copy();
        let finalDist = math.min(from.distanceTo(to), maxLength);
        let finalAngle = from.directionTo(to);
        let currentDist = 0;
        while (currentDist < finalDist) {
            start.polarProject(accuracy, finalAngle);
            if (!PointWalkableChecker.getInstance().checkTerrainIsWalkableXY(start.x, start.y)) {
                start.recycle();
                return currentDist;
            }
            currentDist += accuracy;
        }
        start.recycle();
        return -1;
    }
    public terrainRayCastIsHit(from: Vector2, to: Vector2, accuracy?: number, maxLength?: number) {
        return this.terrainRayCast(from, to, accuracy, maxLength) >= 0;
    }
}