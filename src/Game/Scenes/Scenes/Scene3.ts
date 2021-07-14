import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {Scene} from "./Scene";
import {GateOperation} from "../GateOperation";
import {CUnitTypeEnemyMeleeMyrmidion} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeMyrmidion";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnitTypeEnemyRangedSiren} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedSiren";
import {ArenaService} from "../Arenas/ArenaService";

export class Scene3 extends Scene {
    public checkpoint1 = gg_rct_Scene3Start;

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();
    }

    private hasEntered: boolean = false;

    onUpdateStep(): void {

    };
    public execute() {
        print("Scene2 starting.");

        /** ARENA 2 */
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);

        this.yieldTimed(100);
    }

    //Return next scene.
    public onFinish(): Scene | undefined {
        print("A winner is you!");

        ArenaService.getInstance().clearAllEnemies();

        return undefined;
    }
    onPlayersDeath(): void {
        this.remove();

        this.hasEntered = false;

        Delay.addDelay(() => {
            ArenaService.getInstance().clearAllEnemies();
            this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
            this.reset();
        }, 5);
    }
}