import {PlayerHeroes} from "../PlayerManager/PlayerHeroes";
import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {TreeCoroutine} from "../TreeCoroutine";
import YieldTimed = TreeCoroutine.YieldTimed;

export abstract class Scene extends Entity {

    protected constructor(timerDelay: number) {
        super(timerDelay);
        this.onInit();
    }
    abstract onInit(): void;
    abstract onPlayersDeath(): void;

    public hasFinished: boolean = false;
}

export class Arena {
    public trigger = gg_rct_Scene1Arena1Trigger;
    public moveCheck = gg_rct_Scene1Arena1Check1;
    public tardy = gg_rct_Scene1Arena1Tardy;
    public spawns = [
        gg_rct_Scene1Arena1Spawn1,
        gg_rct_Scene1Arena1Spawn2,
        gg_rct_Scene1Arena1Spawn3,
        gg_rct_Scene1Arena1Spawn4,
        gg_rct_Scene1Arena1Spawn5,
        gg_rct_Scene1Arena1Spawn6,
        gg_rct_Scene1Arena1Spawn7,
        gg_rct_Scene1Arena1Spawn8,
    ];
    public entry = udg_Dest_Scene1Entry1;
    public exit = udg_Dest_Scene1Exit1;
}

export class Scene1 extends Scene {
    public checkpoint1 = gg_rct_Scene1Checkpoint1;

    public arena1 = new Arena();
    public runRoutine!: LuaThread;

    private playerHeroes = PlayerHeroes.getInstance();

    public constructor() {
        super(0.05);
    }
    onInit(): void {
        this.runRoutine = coroutine.create(() => this.routine());
    }

    step(): void {
        coroutine.resume(this.runRoutine);
    }

    public routine() {
        print("Start scene");
        TreeCoroutine.YieldTimed(1, this.timerDelay);
        ModifyGateBJ(bj_GATEOPERATION_OPEN, this.arena1.entry);
        ModifyGateBJ(bj_GATEOPERATION_OPEN, this.arena1.exit);
        while (!this.playerHeroes.intersects(this.arena1.trigger)) {
            coroutine.yield();
        }
        ModifyGateBJ(bj_GATEOPERATION_CLOSE, this.arena1.entry);
        ModifyGateBJ(bj_GATEOPERATION_CLOSE, this.arena1.exit);
        const exclude = this.playerHeroes.getHeroesInside(this.arena1.moveCheck);
        this.playerHeroes.moveHeroesToRect(this.arena1.tardy, exclude);
        print("Moved");
        TreeCoroutine.YieldTimed(1, this.timerDelay);
        print("Timed");
        TreeCoroutine.YieldTimed(5, this.timerDelay);
        print("Timed 5");

        this.hasFinished = true;
    }

    onPlayersDeath(): void {
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
        this.onInit();
    }
}