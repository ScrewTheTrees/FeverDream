import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {GridTree} from "wc3-treelib/src/TreeLib/Utility/Data/GridTree";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {CUnit} from "./CUnit";

function positionEval(val: CUnit) {
    return val.getPosition();
}
export class CUnitPool extends Entity {
    public aliveGrid: GridTree<CUnit> = new GridTree<CUnit>(positionEval);
    public deadGrid: GridTree<CUnit> = new GridTree<CUnit>(positionEval);

    public alivePool: CUnit[] = [];
    public deadPool: CUnit[] = [];

    private gridDist = 1024;

    constructor() {
        super(0.1);
    }
    step(): void {
        this.update();
    }

    update(): void {
        for (let i = this.alivePool.length - 1; i >= 0; i--) {
            let thing = this.alivePool[i];
            if (thing.queueForRemoval) {
                Quick.Remove(this.alivePool, thing);
                thing.onDelete();
            } else if (thing.isDead) {
                Quick.Remove(this.alivePool, thing);
                Quick.PushIfMissing(this.deadPool, thing);
            }
        }
        for (let i = this.deadPool.length - 1; i >= 0; i--) {
            let thing = this.deadPool[i];
            if (thing.queueForRemoval) {
                Quick.Remove(this.deadPool, thing);
                thing.onDelete();
            } else if (!thing.isDead) {
                Quick.Remove(this.deadPool, thing);
                Quick.PushIfMissing(this.alivePool, thing);
            }
        }
    }

    public gridUpdatePosition(u: CUnit, position: Vector2) {
        return this.gridUpdatePositionXY(u, u.getPosition().x, u.getPosition().y, position.x, position.y);
    }
    public gridUpdatePositionXY(u: CUnit, oldX: number, oldY: number, newX: number, newY: number) {
        if (!u.isDead) {
            this.aliveGrid.moveFromCoordinateToCoordinate(oldX, oldY, newX, newY, u);
        } else {
            this.deadGrid.moveFromCoordinateToCoordinate(oldX, oldY, newX, newY, u);
        }
    }
    public gridUpdateIsDead(u: CUnit, wasDead: boolean, isDead: boolean) {
        if (wasDead) {
            this.deadGrid.removeAtCoordinate(u.getPosition().x, u.getPosition().y, u);
        } else {
            this.aliveGrid.removeAtCoordinate(u.getPosition().x, u.getPosition().y, u);
        }
        if (isDead) {
            this.deadGrid.addToCoordinate(u.getPosition().x, u.getPosition().y, u);
        } else {
            this.aliveGrid.addToCoordinate(u.getPosition().x, u.getPosition().y, u);
        }
    }
    public gridAddUnit(u: CUnit) {
        if (u.isDead) {
            this.deadGrid.addToCoordinate(u.getPosition().x, u.getPosition().y, u);
        } else {
            this.aliveGrid.addToCoordinate(u.getPosition().x, u.getPosition().y, u);
        }
    }
    public gridRemove(u: CUnit) {
        this.deadGrid.removeAtCoordinate(u.getPosition().x, u.getPosition().y, u);
        this.aliveGrid.removeAtCoordinate(u.getPosition().x, u.getPosition().y, u);
    }

    public addUnit(u: CUnit) {
        if (!u.isDead) {
            Quick.PushIfMissing(this.alivePool, u);
        } else {
            Quick.PushIfMissing(this.deadPool, u);
        }
    }

    public removeUnit(u: CUnit) {
        Quick.Remove(this.alivePool, u);
        Quick.Remove(this.deadPool, u);
    }

    public getClosestAliveToPosition(pos: Vector2, filter?: (u: CUnit) => boolean, maxRange: number = math.maxinteger) {
        let newUnit = this.aliveGrid.fetchClosest(pos, math.min(maxRange, this.gridDist), filter);
        if (newUnit != undefined) {
            return newUnit;
        }
        let distance = maxRange;
        let candidate = undefined;
        for (let i = 0; i < this.alivePool.length; i++) {
            let candice = this.alivePool[i];
            if (candice.isDead) continue;
            let dist = candice.getPosition().distanceToSquared(pos);
            if (dist < distance) {
                if (!filter || filter(candice)) {
                    candidate = candice;
                    distance = dist;
                }
            }
        }
        return candidate;
    }


    public getClosestAliveNotSelf(u: CUnit, filter?: (u: CUnit) => boolean, maxRange: number = math.maxinteger) {
        let otherFilter: (u: CUnit) => boolean = (check) => check != u && (!filter || filter(check));
        let newUnit = this.aliveGrid.fetchClosest(u.getPosition(), math.min(maxRange, this.gridDist), otherFilter);
        if (newUnit != undefined) {
            return newUnit;
        }

        let distance = maxRange;
        let candidate = undefined;
        for (let i = 0; i < this.alivePool.length; i++) {
            let candice = this.alivePool[i];
            if (candice == u || u.isDead) continue;
            let dist = candice.getPosition().distanceToSquared(u.getPosition());
            if (dist < distance) {
                if (!filter || filter(candice)) {
                    candidate = candice;
                    distance = dist;
                }
            }
        }
        return candidate;
    }

    public getAliveUnitsInRange(pos: Vector2, range: number, filter?: (filterUnit: CUnit) => boolean, checkArr?: CUnit[]) {
        let units = checkArr || [];
        if (range <= this.gridDist) {
            return this.aliveGrid.fetchInCircleR(pos, range, filter, checkArr);
        }

        for (let u of this.alivePool) {
            if (!u.isDead && u.getPosition().distanceTo(pos) <= range) {
                if (filter == null || filter(u)) {
                    units.push(u);
                }
            }
        }
        return units;
    }
    public getAliveUnitsInRangeNotSelf(dude: CUnit, range: number, filter?: (filterUnit: CUnit) => boolean, checkArr?: CUnit[]) {
        let aliveUnitsInRange = this.getAliveUnitsInRange(dude.getPosition(), range, undefined, checkArr);
        for (let i = aliveUnitsInRange.length - 1; i >= 0; i--) {
            let value = aliveUnitsInRange[i];
            if (dude == value) Quick.Slice(aliveUnitsInRange, i);
        }
        return aliveUnitsInRange
    }

    public getRandomAlive(filter?: (filterUnit: CUnit) => boolean) {
        let arr = this.checkArr;
        for (let i = 0; i < this.alivePool.length; i++) {
            let u = this.alivePool[i];
            if (!u.isDead && (filter == null || filter(u))) {
                arr.push(u);
            }
        }
        return ChooseOne(...arr);
    }





    public getHostileAliveUnitsInRange(dude: CUnit, range: number, filter?: (filterUnit: CUnit) => boolean, checkArr?: CUnit[]) {
        let aliveUnitsInRange = this.getAliveUnitsInRange(dude.getPosition(), range, undefined, checkArr);
        for (let i = aliveUnitsInRange.length - 1; i >= 0; i--) {
            let value = aliveUnitsInRange[i];
            if (IsPlayerEnemy(value.owner, dude.owner)) Quick.Slice(aliveUnitsInRange, i);
        }
        return aliveUnitsInRange
    }
    public getClosestAliveEnemy(pos: Vector2, unit: CUnit, maxRange?: number) {
        return this.getClosestAliveToPosition(pos, (u) => IsPlayerEnemy(unit.owner, u.owner), maxRange);
    }
    public getRandomAliveEnemy(unit: CUnit) {
        return this.getRandomAlive((u) => IsPlayerEnemy(unit.owner, u.owner));
    }

    public getAliveAlliedUnitsInRange(dude: CUnit, range: number,filter?: (filterUnit: CUnit) => boolean,  checkArr?: CUnit[]) {
        let aliveUnitsInRange = this.getAliveUnitsInRange(dude.getPosition(), range, undefined, checkArr);
        for (let i = aliveUnitsInRange.length - 1; i >= 0; i--) {
            let value = aliveUnitsInRange[i];
            if (IsPlayerAlly(value.owner, dude.owner)) Quick.Slice(aliveUnitsInRange, i);
        }
        return aliveUnitsInRange
    }
    public getClosestAliveAlly(pos: Vector2, unit: CUnit, maxRange?: number) {
        return this.getClosestAliveToPosition(pos, (u) => IsPlayerAlly(unit.owner, u.owner), maxRange);
    }
    public getRandomAliveAlly(unit: CUnit) {
        return this.getRandomAlive((u) => IsPlayerAlly(unit.owner, u.owner));
    }


    private _checkArr: CUnit[] = [];
    get checkArr(): CUnit[] {
        Quick.Clear(this._checkArr);
        return this._checkArr;
    }
}