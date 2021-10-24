import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {Scene} from "./Scene";
import {ArenaService} from "../Arenas/ArenaService";
import {CUnitTypeEnemyMeleeFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeFodderSkeleton";
import {Music} from "../../Music";
import {CUnitTypeEnemyRangedFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedFodderSkeleton";

export class Scene3 extends Scene {
    public checkpoint1 = gg_rct_Scene3Start;

    public dummyArena = ArenaService.getInstance().combatArena2;

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();
    }

    private hasEntered: boolean = false;

    onUpdateStep(): void {

    };
    public execute() {
        /** ARENA 3 */
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);

        this.waitUntilPlayerTriggerRect(gg_rct_Section2TriggerStart);
        this.playMusic(Music.SECTION_2);

        while (!this.hasEntered) {
            this.generateSpawnPerPlayerAsync(this.dummyArena, (owner, position, focusPlayer) => {
                return new CUnitTypeEnemyMeleeFodderSkeleton(owner, position, focusPlayer);
            }, 0.1, 3, gg_rct_Scene3EnemySpawner);
            this.yieldTimed(0.5);
            this.generateSpawnPerPlayerAsync(this.dummyArena, (owner, position, focusPlayer) => {
                return new CUnitTypeEnemyRangedFodderSkeleton(owner, position, focusPlayer);
            }, 0.1, 2, gg_rct_Scene3EnemySpawner);
            this.yieldTimed(30);
        }
    }

    //Return next scene.
    public onFinish(): Scene | undefined {
        ArenaService.getInstance().clearAllEnemies();

        return undefined;
    }
    onPlayersDeath(): void {
        this.remove();

        this.hasEntered = false;
        this.playMusic(Music.NONE);

        Delay.addDelay(() => {
            ArenaService.getInstance().clearAllEnemies();
            this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
            this.reset();
        }, 5);
    }
}