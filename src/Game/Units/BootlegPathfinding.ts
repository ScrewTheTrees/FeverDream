import {PathfinderGrid} from "wc3-treelib/src/TreeLib/Pathfinder/PathfinderGrid";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreePromise} from "wc3-treelib/src/TreeLib/Utility/TreePromise";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Pathfinder/PathfindResult";

export class BootlegPathfinding {
    private static _instance: BootlegPathfinding;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new BootlegPathfinding();
        }
        return this._instance;
    }

    public pathfinder: PathfinderGrid;

    private constructor() {
        this.pathfinder = new PathfinderGrid(31000, 31000, -31000, -31000,
            64, true, true, true);

    }
    public findAsync(from: Vector2, to: Vector2): TreePromise<PathfindResult> {
        return this.pathfinder.findPathAsync(from, to,4096, 16);
    }
    public find(from: Vector2, to: Vector2) {
        return this.pathfinder.findPath(from, to,4096);
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