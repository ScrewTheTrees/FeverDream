import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Delay} from "wc3-treelib/src/TreeLib/Services/Delay/Delay";
import {Scene} from "./Scene";
import {ArenaService} from "../Arenas/ArenaService";
import {CUnitTypeEnemyMeleeFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeFodderSkeleton";
import {Music} from "../../Music";
import {CUnitTypeEnemyRangedFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedFodderSkeleton";

export class SceneCave extends Scene {
    public checkpoint1 = gg_rct_SceneCaveStart;

    public caveArena = ArenaService.getInstance().caveArena;

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();
    }

    onUpdateStep(): void {

    };

    public execute() {
        /** ARENA 3 */
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);

        this.waitUntilPlayerTriggerRect(gg_rct_ArenaCaveTriggerStart);
        this.playMusic(Music.SECTION_2);

        while (true) {
            this.generateSpawnPerPlayerFurthersSpawnAsync(this.caveArena, (owner, position, focusPlayer) => {
                return new CUnitTypeEnemyMeleeFodderSkeleton(owner, position, focusPlayer);
            }, 0.1, 6);
            this.yieldTimed(0.5);
            this.generateSpawnPerPlayerFurthersSpawnAsync(this.caveArena, (owner, position, focusPlayer) => {
                return new CUnitTypeEnemyRangedFodderSkeleton(owner, position, focusPlayer);
            }, 0.1, 4);

            print("while (true)");
            this.yieldTimed(60);
        }
    }

    //Return next scene.
    public onFinish(): Scene | undefined {
        ArenaService.getInstance().clearAllEnemies();

        return new SceneCave();
    }

    onPlayersDeath(): void {
        Delay.addDelay(() => {
            ArenaService.getInstance().clearAllEnemies();
            this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
            this.reset();
            print("reset");
        }, 5);

        this.remove();
        this.playMusic(Music.NONE);
    }
}