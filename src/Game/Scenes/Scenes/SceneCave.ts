import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Delay} from "wc3-treelib/src/TreeLib/Services/Delay/Delay";
import {Scene} from "./Scene";
import {ArenaService} from "../Arenas/ArenaService";
import {CUnitTypeEnemyMeleeFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeFodderSkeleton";
import {Music} from "../../Music";
import {CUnitTypeEnemyRangedFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedFodderSkeleton";
import {CUnitTypeEnemyMeleeMyrmidionWaypoint} from "../../Units/CUnit/Types/Waypoint/CUnitTypeEnemyMeleeMyrmidionWaypoint";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {EnemyWaypoint} from "../../Units/CComponent/AI/Waypoint/EnemyWaypoint";

export class SceneCave extends Scene {
    public checkpoint1 = gg_rct_SceneCaveStart;

    public caveArena = ArenaService.getInstance().caveArena;

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();
    }

    public unlockedLock2: boolean = false;

    public onUpdateStep() {
        this.caveArena.updateWaterfallLogic();

        if (!this.unlockedLock2 && this.playerHeroes.intersects(gg_rct_ArenaCaveTrigger2)) {

            this.unlockedLock2 = true;

            this.generateSpawnForSelectPlayersAsync(this.caveArena,
                (owner: player, position: Vector2, focusHero) => {
                    if (focusHero) {
                        return new CUnitTypeEnemyMeleeMyrmidionWaypoint(owner, position, [
                                new EnemyWaypoint(focusHero.getPosition().copy()),
                                new EnemyWaypoint(Vector2.randomPointInRect(gg_rct_ArenaCaveFirstGateGuard))
                            ]
                        )
                    }
                }, this.playerHeroes.getOwnersInside(gg_rct_ArenaCaveSpecialSpawn2PowerCheck),
                0, 2,
                gg_rct_ArenaCaveSpecialSpawn2);
        }
    }

    public execute() {
        /** ARENA 3 */
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);

        this.waitUntilPlayerTriggerRect(gg_rct_ArenaCaveTriggerStart);
        this.playMusic(Music.SECTION_2);

        while (true) {
            this.generateSpawnPerPlayerFurthersSpawnAsync(this.caveArena, (owner, position, focusPlayer) => {
                return new CUnitTypeEnemyMeleeFodderSkeleton(owner, position, focusPlayer);
            }, 0.1, 2);
            this.yieldTimed(0.5);
            this.generateSpawnPerPlayerFurthersSpawnAsync(this.caveArena, (owner, position, focusPlayer) => {
                return new CUnitTypeEnemyRangedFodderSkeleton(owner, position, focusPlayer);
            }, 0.1, 2);

            print("while (true) wave 120");
            this.yieldTimed(120);
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