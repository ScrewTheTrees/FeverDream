import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {CUnit} from "./CUnit";
import {Logger} from "wc3-treelib/src/TreeLib/Logger";

export class CUnitPool extends Entity {
    public alivePool: CUnit[] = [];
    public deadPool: CUnit[] = [];

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
                Logger.generic("Remove:", thing.constructor.name);
                Quick.Remove(this.alivePool, thing);
                thing.onDelete();
            } else if (thing.isDead) {
                Logger.generic("Dead, move:", thing.constructor.name);
                Quick.Remove(this.alivePool, thing);
                Quick.PushIfMissing(this.deadPool, thing);
            }
        }
        for (let i = this.deadPool.length - 1; i >= 0; i--) {
            let thing = this.deadPool[i];
            if (thing.queueForRemoval) {
                Logger.generic("Queue for removal:", thing.constructor.name);
                Quick.Remove(this.deadPool, thing);
                thing.onDelete();
            } else if(!thing.isDead) {
                Logger.generic("Resurrected, move:", thing.constructor.name);
                Quick.Remove(this.deadPool, thing);
                Quick.PushIfMissing(this.alivePool, thing);
            }
        }
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
    public getClosestAliveToPosition(pos: Vector2, filter?: (u: CUnit) => boolean) {
        let distance = math.maxinteger;
        let candidate = undefined;
        for (let i = 0; i < this.alivePool.length; i++) {
            let candice = this.alivePool[i];
            if (candice.isDead) continue;
            let dist = candice.position.distanceToSquared(pos);
            if (dist < distance) {
                if (!filter || filter(candice)) {
                    candidate = candice;
                    distance = dist;
                }
            }
        }
        return candidate;
    }
    public getClosestAliveNotSelf(u: CUnit, filter?: (u: CUnit) => boolean) {
        let distance = math.maxinteger;
        let candidate = undefined;
        for (let i = 0; i < this.alivePool.length; i++) {
            let candice = this.alivePool[i];
            if (candice == u || u.isDead) continue;
            let dist = candice.position.distanceToSquared(u.position);
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
        for (let u of this.alivePool) {
            if (!u.isDead && u.position.distanceTo(pos) <= range) {
                if (filter == null || filter(u)) {
                    units.push(u);
                }
            }
        }
        return units;
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


    public getHostileAliveUnitsInRange(dude: CUnit, range: number) {
        return this.getAliveUnitsInRange(dude.position, range, (u) => IsPlayerEnemy(u.owner, dude.owner))
    }
    public getClosestAliveEnemy(pos: Vector2, unit: CUnit) {
        return this.getClosestAliveToPosition(pos, (u) => IsPlayerEnemy(unit.owner, u.owner));
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