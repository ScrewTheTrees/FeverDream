import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {GridTree} from "wc3-treelib/src/TreeLib/Utility/Data/DataTree/GridTree";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {CUnit} from "./CUnit";
import {DataTreeFilter} from "wc3-treelib/src/TreeLib/Utility/Data/DataTree/DataTreeFilter";
import {DataTreePositionEvaluation} from "wc3-treelib/src/TreeLib/Utility/Data/DataTree/DataTreePositionEvaluation";

class CUnitEvaluation extends DataTreePositionEvaluation<CUnit> {
    evaluate(value: CUnit): Vector2 {
        return value.getPosition();
    }
}

class NotSelfFilter extends DataTreeFilter<CUnit> {
    public unit?: CUnit;
    evaluate(value: CUnit): boolean {
        return value != this.unit;
    }
    apply(check: CUnit): this {
        this.unit = check;
        return this;
    }
}

class IsEnemyFilter extends DataTreeFilter<CUnit> {
    public unit?: CUnit;
    evaluate(value: CUnit): boolean {
        if (!this.unit) return true;
        return IsPlayerEnemy(value.owner, this.unit.owner);
    }
    apply(check: CUnit): this {
        this.unit = check;
        return this;
    }
}

class IsAllyFilter extends DataTreeFilter<CUnit> {
    public unit?: CUnit;
    evaluate(value: CUnit): boolean {
        if (!this.unit) return true;
        return IsPlayerAlly(value.owner, this.unit.owner);
    }
    apply(check: CUnit) {
        this.unit = check;
        return this;
    }
}

export class CUnitPool extends Entity {
    public aliveGrid: GridTree<CUnit> = new GridTree<CUnit>(new CUnitEvaluation());
    public deadGrid: GridTree<CUnit> = new GridTree<CUnit>(new CUnitEvaluation());

    public alivePool: CUnit[] = [];
    public deadPool: CUnit[] = [];

    private gridDist = 1024;

    private notSelfFilter = new NotSelfFilter();
    private isEnemyFilter = new IsEnemyFilter();
    private isAllyFilter = new IsAllyFilter();

    constructor() {
        super(0.1);
    }
    step(): void {
        this.update();
    }

    update(): void {
        for (let i = this.alivePool.length - 1; i >= 0; i--) {
            let thing = this.alivePool[i];
            if (thing == undefined) continue;

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
            if (thing == undefined) continue;

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

    public getClosestAliveToPosition(pos: Vector2, filter?: DataTreeFilter<CUnit>, maxRange: number = math.maxinteger) {
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
                if (!filter || filter.evaluate(candice)) {
                    candidate = candice;
                    distance = dist;
                }
            }
        }
        return candidate;
    }


    public getClosestAliveNotSelf(u: CUnit, filter?: DataTreeFilter<CUnit>, maxRange: number = math.maxinteger) {
        return this.getClosestAliveToPosition(u.getPosition(), this.notSelfFilter.apply(u), maxRange)
    }

    public getAliveUnitsInRange(pos: Vector2, range: number, filter?: DataTreeFilter<CUnit>, checkArr?: CUnit[]) {
        let units = checkArr || [];
        if (range <= this.gridDist) {
            return this.aliveGrid.fetchInCircleR(pos, range, filter, checkArr);
        }

        for (let u of this.alivePool) {
            if (!u.isDead && u.getPosition().distanceTo(pos) <= range) {
                if (filter == null || filter.evaluate(u)) {
                    units.push(u);
                }
            }
        }
        return units;
    }
    public getAliveUnitsInRangeNotSelf(dude: CUnit, range: number, checkArr?: CUnit[]) {
        return this.getAliveUnitsInRange(dude.getPosition(), range, this.notSelfFilter.apply(dude), checkArr);
    }

    public getRandomAlive(filter?: DataTreeFilter<CUnit>) {
        let arr = this.checkArr;
        for (let i = 0; i < this.alivePool.length; i++) {
            let u = this.alivePool[i];
            if (!u.isDead && (filter == null || filter.evaluate(u))) {
                arr.push(u);
            }
        }
        return ChooseOne(...arr);
    }


    public getAliveEnemyUnitsInRange(dude: CUnit, range: number, checkArr?: CUnit[]) {
        return this.getAliveUnitsInRange(dude.getPosition(), range, this.isEnemyFilter.apply(dude), checkArr)
    }
    public getClosestAliveEnemy(pos: Vector2, unit: CUnit, maxRange?: number) {
        return this.getClosestAliveToPosition(pos, this.isEnemyFilter.apply(unit), maxRange);
    }
    public getRandomAliveEnemy(unit: CUnit) {
        return this.getRandomAlive(this.isEnemyFilter.apply(unit));
    }

    public getAliveAlliedUnitsInRange(dude: CUnit, range: number, checkArr?: CUnit[]) {
        return this.getAliveUnitsInRange(dude.getPosition(), range, this.isAllyFilter.apply(dude), checkArr)
    }
    public getClosestAliveAlly(pos: Vector2, unit: CUnit, maxRange?: number) {
        return this.getClosestAliveToPosition(pos, this.isAllyFilter.apply(unit), maxRange);
    }
    public getRandomAliveAlly(unit: CUnit) {
        return this.getRandomAlive(this.isAllyFilter.apply(unit));
    }


    private _checkArr: CUnit[] = [];
    get checkArr(): CUnit[] {
        Quick.Clear(this._checkArr);
        return this._checkArr;
    }
}