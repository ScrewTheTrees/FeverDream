import {SceneRectType} from "../SceneRectType";
import {SceneDestructableType} from "../SceneDestructableType";
import {GateOperation} from "../GateOperation";
import {Rectangle} from "wc3-treelib/src/TreeLib/Utility/Data/Rectangle";
import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {CUnit} from "../../Units/CUnit/CUnit";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";

export abstract class Arena {
    /*** Trigger areas that starts the engagement. */
    public trigger: rect[] = [];
    /*** If inside one of these, dont teleport to tardy point. */
    public arenaCheck: rect[] = [];
    /*** The rects heroes can be moved to if they are outside the movecheck.. */
    public tardy: rect[] = [];
    /*** Where enemies should spawn. */
    public enemySpawns: rect[] = [];
    /*** The entrance destructables (if applicable) that should Close/Open. */
    public entrance: destructable[] = [];
    /*** The exit destructables (if applicable) that should Close/Open. */
    public exit: destructable[] = [];

    public enemies: CUnit[] = [];

    public constructor(arena: string) {
        this.parseRegions(SceneRectType.TRIGGER, arena, this.trigger);
        this.parseRegions(SceneRectType.MOVECHECK, arena, this.arenaCheck);
        this.parseRegions(SceneRectType.TARDY, arena, this.tardy);
        this.parseRegions(SceneRectType.ENEMY_SPAWN, arena, this.enemySpawns);
        this.parseDestructable(SceneDestructableType.ENTRANCE, arena, this.entrance);
        this.parseDestructable(SceneDestructableType.EXIT, arena, this.exit);
    }

    private parseRegions(type: SceneRectType, arena: string, arr: rect[]) {
        let globalScope: any = _G;
        let count = 1;
        let parse = globalScope[`gg_rct_Arena${arena}${type}${count}`];
        while (parse != null) {
            arr.push(parse);
            count++;
            parse = globalScope[`gg_rct_Arena${arena}${type}${count}`];
        }
    }
    private parseDestructable(type: SceneDestructableType, arena: string, arr: destructable[]) {
        let globalScope: any = _G;
        let count = 1;
        let parse = globalScope[`udg_Dest_Arena${arena}${type}${count}`];
        while (parse != null) {
            arr.push(parse);
            count++;
            parse = globalScope[`udg_Dest_Arena${arena}${type}${count}`];
        }
    }
    public GetArenaBounds() {
        if (this.arenaCheck.length == 0) return Rectangle.new(0, 0, 0, 0);
        let rec = Rectangle.fromRect(this.arenaCheck[0])
        for (let rect of this.arenaCheck) {
            rec.xMin = math.min(rec.xMin, GetRectMinX(rect));
            rec.xMax = math.min(rec.xMax, GetRectMaxX(rect));
            rec.yMin = math.min(rec.yMin, GetRectMinY(rect));
            rec.yMax = math.min(rec.yMax, GetRectMaxY(rect));
        }
        return rec;
    }
    public isPlayerTouchingTrigger() {
        return PlayerHeroes.getInstance().intersects(...this.trigger);
    }

    //Enemy
    public addEnemy(cu: CUnit) {
        Quick.PushIfMissing(this.enemies, cu);
    }
    public countRemainingEnemies() {
        let count = 0;
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let en = this.enemies[i];
            if (en.queueForRemoval || en.isDead) {
                Quick.Remove(this.enemies, en);
            } else {
                count++;
            }
        }
        return count;
    }
    public removeAllEnemies() {
        for (let en of this.enemies) {
            en.queueForRemoval = true;
        }
        Quick.Clear(this.enemies);
    }

    //Entrances
    public toggleEntrances(operation: GateOperation) {
        for (let entry of this.entrance) {
            ModifyGateBJ(operation, entry);
        }
    }
    public toggleExits(operation: GateOperation) {
        for (let entry of this.exit) {
            ModifyGateBJ(operation, entry);
        }
    }
    public toggleBoth(operation: GateOperation) {
        this.toggleEntrances(operation);
        this.toggleExits(operation);
    }
    public closeArena() {
        this.toggleBoth(GateOperation.CLOSE);
    }

    public getClosestSpawner(to: Vector2) {
        let check = this.enemySpawns[0];
        let dist = math.maxinteger;
        for (let arena of this.enemySpawns) {
            let vec = Vector2.fromRectCenter(arena);
            let d = vec.distanceToSquared(to);
            if (d <= dist) {
                dist = d;
                check = arena;
            }
            vec.recycle();
        }
        return check;
    }
    public getFurthestSpawner(to: Vector2) {
        let check = this.enemySpawns[0];
        let dist = 0;
        for (let arena of this.enemySpawns) {
            let vec = Vector2.fromRectCenter(arena);
            let d = vec.distanceToSquared(to);
            if (d >= dist) {
                dist = d;
                check = arena;
            }
            vec.recycle();
        }
        return check;
    }
    public getFurthestSpawnerOfPlayers() {
        let check = this.enemySpawns[0];
        let dist = 0;

        for (let p of PlayerHeroes.getInstance().getAliveHeroes()) {
            let rc = this.getFurthestSpawner(p.getPosition());
            let vec = Vector2.fromRectCenter(rc);
            let d = vec.distanceToSquared(p.getPosition());
            if (d >= dist) {
                dist = d;
                check = rc;
            }
            vec.recycle();
        }
        return check;
    }

    private _checkArr: any[] = [];
    get checkArr(): any[] {
        Quick.Clear(this._checkArr);
        return this._checkArr;
    }
}


export class Arena1Combat extends Arena {
    constructor() {
        super("1");
    }
}

export class Arena2Combat extends Arena {
    constructor() {
        super("2");
    }
}

export class ArenaDummy extends Arena {
    constructor() {
        super("0");
    }
}

export class ArenaCave extends Arena {
    constructor() {
        super("Cave");
    }
}