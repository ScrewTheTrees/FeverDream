import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Hooks} from "wc3-treelib/src/TreeLib/Hooks";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";

export class BootlegCollisionMap {
    private static _instance: BootlegCollisionMap;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new BootlegCollisionMap();
        }
        return this._instance;
    }

    private gridNegative: number = 32_768;
    private grid: boolean[][] = [];
    private readonly gridSize;

    private checker: PointWalkableChecker = PointWalkableChecker.getInstance();

    public constructor(gridNegative: number = 32_768, gridSize: number = 32) {
        this.gridNegative = gridNegative;
        this.gridSize = gridSize;

        Hooks.hookArguments(ModifyGateBJ, (operation, gate) => {
            Delay.addDelay(() => {
                let pp = Vector2.fromWidget(gate);
                this.clearByCoordinates(pp.x - 600, pp.y - 600, pp.x + 600, pp.y + 600);
                pp.recycle();
            }, 0.25);
        });
    }

    //Coordinate
    public getCollisionCircle(x: number, y: number, radius: number, precision: number = 8): boolean {
        const p = Vector2.new(x, y);
        let result = this.getCollisionAtCoordinate(p.x, p.y);
        if (!result) {
            let checkPoint = p.copy();
            let angle = 0;
            let anglePerStep = 360 / precision;
            for (let i = 0; i < precision; i++) {
                checkPoint.updateToPoint(p);
                checkPoint.polarProject(radius, angle)
                result = this.getCollisionAtCoordinate(checkPoint.x, checkPoint.y);
                if (!result) break;
                angle += anglePerStep;
            }
            checkPoint.recycle();
        }
        p.recycle();
        return result;
    }
    public getCollisionAtCoordinate(x: number, y: number) {
        x += this.gridNegative;
        y += this.gridNegative;
        x = math.floor(x / this.gridSize);
        y = math.floor(y / this.gridSize);
        if (this.grid[x] == null) {
            this.grid[x] = [];
        }
        let value = this.grid[x][y];
        if (value == null) {
            value = this.updateCollisionAtIndices(x, y);
        }
        return value;
    }
    public clearByCoordinates(x1: number, y1: number, x2: number, y2: number) {
        x1 += this.gridNegative;
        y1 += this.gridNegative;
        x2 += this.gridNegative;
        y2 += this.gridNegative;
        let minX = math.floor(math.min(x1, x2) / this.gridSize);
        let maxX = math.floor(math.max(x1, x2) / this.gridSize);
        let minY = math.floor(math.min(y1, y2) / this.gridSize);
        let maxY = math.floor(math.max(y1, y2) / this.gridSize);

        this.clearByIndices(minX, minY, maxX, maxY)
    }

    //Special
    public terrainRayCast(from: Vector2, to: Vector2, accuracy: number = 30, maxLength: number = 960) {
        let start = from.copy();
        let finalDist = math.min(from.distanceTo(to), maxLength);
        let finalAngle = from.directionTo(to);
        let currentDist = 0;
        while (currentDist < finalDist) {
            start.polarProject(accuracy, finalAngle);
            if (!this.getCollisionAtCoordinate(start.x, start.y)) {
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


    //Indices
    public updateCollisionAtIndices(x: number, y: number) {
        if (this.grid[x] == null) {
            this.grid[x] = [];
        }
        let half = this.gridSize / 2;
        let value = this.checker.checkTerrainIsWalkableXY((x * this.gridSize) + half - this.gridNegative, (y * this.gridSize) + half - this.gridNegative);
        this.grid[x][y] = value;
        return value;
    }
    public clearByIndices(x1: number, y1: number, x2: number, y2: number) {
        let minX = math.min(x1, x2) / this.gridSize;
        let maxX = math.max(x1, x2) / this.gridSize;
        let minY = math.min(y1, y2) / this.gridSize;
        let maxY = math.max(y1, y2) / this.gridSize;

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                if (this.grid[x] == null) {
                    this.grid[x] = [];
                }
                delete this.grid[x][y];
            }
        }
    }
}