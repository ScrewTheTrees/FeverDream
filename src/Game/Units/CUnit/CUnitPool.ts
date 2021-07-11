import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {CUnit} from "./CUnit";

export class CUnitPool extends Entity {
    private alivePool: CUnit[] = [];
    private deadPool: CUnit[] = [];

    constructor() {
        super(1);
    }
    step(): void {
        this.update();
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
    public update() {
        for (let i = this.alivePool.length - 1; i >= 0; i--) {
            let thing = this.alivePool[i];
            if (thing.queueForRemoval) {
                Quick.Remove(this.alivePool, thing);
            } else if (thing.isDead) {
                Quick.Remove(this.alivePool, thing);
                Quick.PushIfMissing(this.deadPool, thing);
            }
        }
        for (let i = this.deadPool.length - 1; i >= 0; i--) {
            let thing = this.deadPool[i];
            if (thing.queueForRemoval) {
                Quick.Remove(this.deadPool, thing);
            }
        }
    }
    public getClosestAlive(pos: Vector2, filter?: (u: CUnit) => boolean) {
        let distance = math.maxinteger;
        let candidate = undefined;
        for (let i = 0; i < this.alivePool.length; i++) {
            let candice = this.alivePool[i];
            let dist = candice.position.distanceTo(pos);
            if (dist < distance) {
                if (!filter || filter(candice)) {
                    candidate = candice;
                    distance = dist;
                }
            }
        }
        return candidate;
    }
    public getAliveUnitsInRange(pos: Vector2, range: number, filter?: (filterUnit: CUnit) => boolean) {
        let units = [];
        for (let u of this.alivePool) {
            if (u.position.distanceTo(pos) <= range) {
                if (filter == null || filter(u)) {
                    units.push(u);
                }
            }
        }
        return units;
    }
    public getHostileAliveUnitsInRange(dude: CUnit, range: number) {
        return this.getAliveUnitsInRange(dude.position, range, (u) => IsPlayerEnemy(u.owner, dude.owner))
    }


    public getClosestAliveEnemy(pos: Vector2, unit: CUnit) {
        return this.getClosestAlive(pos, (u) => IsPlayerEnemy(unit.owner, u.owner));
    }
    public getRandomAlive(filter?: (filterUnit: CUnit) => boolean) {
        let arr = this.checkArr;
        for (let i = 0; i < this.alivePool.length; i++) {
            let u = this.alivePool[i];
            if (filter == null || filter(u)) {
                arr.push(u);
            }
        }
        return ChooseOne(...arr);
    }
    public getRandomAliveEnemy(unit: CUnit) {
        return this.getRandomAlive((u) => IsPlayerEnemy(unit.owner, u.owner));
    }


    private _checkArr: CUnit[] = [];
    get checkArr(): CUnit[] {
        Quick.Clear(this._checkArr);
        return this._checkArr;
    }
}