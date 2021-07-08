import {PlayerHeroes} from "../PlayerManager/PlayerHeroes";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {GateOperation} from "./GateOperation";
import {Scene1Arena1, Scene1Arena2} from "./Arena";
import {PlayerCamera} from "../PlayerManager/PlayerCamera";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreeThread} from "../TreeRunnable";

export abstract class Scene extends TreeThread {

    protected constructor() {
        super();
    }
    abstract onPlayersDeath(): void;

    public hasFinished: boolean = false;
}

export class Scene1 extends Scene {
    public checkpoint1 = gg_rct_Scene1RespawnPoint1;

    public arena1 = new Scene1Arena1();
    public arena2 = new Scene1Arena2();

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();
    }

    public execute() {
        this.playerCamera.setHeroCamera();
        this.arena1.toggleEntrances(GateOperation.OPEN);
        this.arena1.toggleExits(GateOperation.OPEN);

        this.yieldTimed(1);
        this.playerCamera.setCustomCamera(Vector2.fromRectCenter(gg_rct_Scene1RespawnPoint1).recycle(), 2500);
        this.yieldTimed(10);
        this.playerCamera.setHeroCamera();

        while (!this.arena1.isPlayerTouchingTrigger()) {
            this.yield();
        }
        this.arena1.toggleEntrances(GateOperation.CLOSE);
        this.arena1.toggleExits(GateOperation.CLOSE);
        const exclude = this.playerHeroes.getHeroesInside(...this.arena1.arenaCheck);
        this.playerHeroes.moveHeroesToRect(ChooseOne(...this.arena1.tardy), exclude);
        this.yieldTimed(1);
        this.playerCamera.setCustomCamera(Vector2.fromRectCenter(gg_rct_Scene1Arena1Check1).recycle(), 2400);

        this.yieldTimed(5);
        this.playerCamera.setHeroCamera();

        this.arena1.toggleExits(GateOperation.OPEN);
        while (!this.arena2.isPlayerTouchingTrigger()) {
            this.yield();
        }
        this.arena1.toggleEntrances(GateOperation.CLOSE);
        this.arena1.toggleExits(GateOperation.CLOSE);
        this.yieldTimed(5);

        this.arena2.toggleExits(GateOperation.DESTROY);

        this.hasFinished = true;
    }

    onPlayersDeath(): void {
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
        this.reset();
    }
}