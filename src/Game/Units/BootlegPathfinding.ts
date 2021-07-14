import {PathfinderGrid} from "wc3-treelib/src/TreeLib/Pathfinder/PathfinderGrid";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";

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
        this.pathfinder.useCache = false;

    }
    public find(from: Vector2, to: Vector2) {
        return this.pathfinder.findPath(from, to, 256);
    }

    public terrainRayCast(from: Vector2, to: Vector2, accuracy: number = 32) {
        let start = from.copy();
        let finalDist = from.distanceTo(to);
        let finalAngle = from.directionTo(to);
        let currentDist = 0;
        while (currentDist < finalDist) {
            start.polarProject(accuracy, finalAngle);
            if (!PointWalkableChecker.getInstance().checkTerrainXY(start.x, start.y)) {
                return currentDist;
            }
            currentDist += 32;
        }
        start.recycle();
        return -1;
    }
    public terrainRayCastIsHit(from: Vector2, to: Vector2, accuracy?: number) {
        return this.terrainRayCast(from, to, accuracy) >= 0;
    }
}