import {PlayerHeroes} from "../PlayerManager/PlayerHeroes";
import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {TreeCoroutine} from "../TreeCoroutine";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {GateOperation} from "./GateOperation";
import {Arena, Scene1Arena1} from "./Arena";

export abstract class Scene extends Entity {

    protected constructor(timerDelay: number) {
        super(timerDelay);
        this.onInit();
    }
    abstract onInit(): void;
    abstract onPlayersDeath(): void;

    public hasFinished: boolean = false;
}

export class Scene1 extends Scene {
    public checkpoint1 = gg_rct_Scene1Checkpoint1;

    public arena1 = new Scene1Arena1();
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
        this.arena1.toggleEntrances(GateOperation.OPEN);
        this.arena1.toggleExits(GateOperation.OPEN);
        while (!this.playerHeroes.intersects(...this.arena1.trigger)) {
            coroutine.yield();
        }
        this.arena1.toggleEntrances(GateOperation.CLOSE);
        this.arena1.toggleExits(GateOperation.CLOSE);
        const exclude = this.playerHeroes.getHeroesInside(...this.arena1.moveCheck);
        this.playerHeroes.moveHeroesToRect(ChooseOne(...this.arena1.tardy), exclude);
        print("Moved");
        TreeCoroutine.YieldTimed(1, this.timerDelay);
        print("Timed");
        TreeCoroutine.YieldTimed(5, this.timerDelay);

        print("Timed 5");
        this.arena1.toggleExits(GateOperation.DESTROY);

        this.hasFinished = true;
    }

    onPlayersDeath(): void {
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
        this.onInit();
    }
}