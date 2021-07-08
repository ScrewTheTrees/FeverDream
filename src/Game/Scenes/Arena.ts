import {SceneRectType} from "./SceneRectType";
import {SceneDestructableType} from "./SceneDestructableType";
import {GateOperation} from "./GateOperation";

export abstract class Arena {
    /*** Trigger areas that starts the engagement. */
    public trigger: rect[] = [];
    /*** If inside one of these, dont teleport to tardy point. */
    public moveCheck: rect[] = [];
    /*** The rects heroes can be moved to if they are outside the movecheck.. */
    public tardy: rect[] = [];
    /*** Where enemies should spawn. */
    public enemySpawns: rect[] = [];
    /*** The entrance destructables (if applicable) that should Close/Open. */
    public entrance: destructable[] = [];
    /*** The exit destructables (if applicable) that should Close/Open. */
    public exit: destructable[] = [];

    public constructor(scene: number, arena: number) {
        this.parseRegions(SceneRectType.TRIGGER, scene, arena, this.trigger);
        this.parseRegions(SceneRectType.MOVECHECK, scene, arena, this.moveCheck);
        this.parseRegions(SceneRectType.TARDY, scene, arena, this.tardy);
        this.parseRegions(SceneRectType.ENEMY_SPAWN, scene, arena, this.enemySpawns);
        this.parseDestructable(SceneDestructableType.ENTRANCE, scene, arena, this.entrance);
        this.parseDestructable(SceneDestructableType.EXIT, scene, arena, this.exit);
    }

    private parseRegions(type: SceneRectType, scene: number, arena: number, arr: rect[]) {
        let globalScope: any = _G;
        let count = 1;
        let parse = globalScope[`gg_rct_Scene${scene}Arena${arena}${type}${count}`];
        while (parse != null) {
            arr.push(parse);
            count++;
            parse = globalScope[`gg_rct_Scene${scene}Arena${arena}${type}${count}`];
        }
    }
    private parseDestructable(type: SceneDestructableType, scene: number, arena: number, arr: destructable[]) {
        let globalScope: any = _G;
        let count = 1;
        let parse = globalScope[`udg_Dest_Scene${scene}Arena${arena}${type}${count}`];
        while (parse != null) {
            arr.push(parse);
            count++;
            parse = globalScope[`udg_Dest_Scene${scene}Arena${arena}${type}${count}`];
        }
    }
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
}

export class Scene1Arena1 extends Arena {
    constructor() {
        super(1, 1);
    }
}