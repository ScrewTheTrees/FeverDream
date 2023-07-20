import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Delay} from "wc3-treelib/src/TreeLib/Services/Delay/Delay";
import {Scene} from "./Scene";
import {ArenaService} from "../Arenas/ArenaService";
import {Music} from "../../Music";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {EnemyWaypoint} from "../../Units/CComponent/AI/EnemyWaypoint";
import {CUnitTypeEnemyMeleeMyrmidion} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeMyrmidion";
import {GameConfig} from "../../../GameConfig";
import {CUnitTypeEnemyMeleeFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeFodderSkeleton";
import {CUnitTypeEnemyRangedSiren} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedSiren";
import {CUnitTypeEnemyRangedFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedFodderSkeleton";

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
                (position: Vector2, focusHero) => {
                    if (focusHero) {
                        let unit = new CUnitTypeEnemyMeleeMyrmidion( GameConfig.getInstance().nagaPlayer, position, undefined);
                        unit.aiComponent?.setGuardPosition([
                            new EnemyWaypoint(focusHero.getPosition().copy()),
                            new EnemyWaypoint(Vector2.randomPointInRect(gg_rct_ArenaCaveFirstGateGuard))
                        ], false, true);
                        return unit;
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
            /* this.generateSpawnPerPlayerFurthersSpawnAsync(this.caveArena, (owner, position, focusPlayer) => {
                 return new CUnitTypeEnemyMeleeFodderSkeleton(owner, position, focusPlayer);
             }, 0.1, 2);
             this.yieldTimed(0.5);
             this.generateSpawnPerPlayerFurthersSpawnAsync(this.caveArena, (owner, position, focusPlayer) => {
                 return new CUnitTypeEnemyRangedFodderSkeleton(owner, position, focusPlayer);
             }, 0.1, 2);*/
            this.generateSpawnsMultiple(this.caveArena,
                (position: Vector2) => {
                    let unit = new CUnitTypeEnemyMeleeMyrmidion( GameConfig.getInstance().nagaPlayer, position);
                    unit.aiComponent?.setGuardPosition([
                        new EnemyWaypoint(Vector2.randomPointInRect(gg_rct_ArenaCaveFirstGateGuard))
                    ], false, true);
                    return unit;
                }, 1, 1, gg_rct_ArenaCaveSpawn1);
            this.generateSpawnsMultiple(this.caveArena,
                (position: Vector2) => {
                    let unit = new CUnitTypeEnemyRangedSiren( GameConfig.getInstance().nagaPlayer, position);
                    unit.aiComponent?.setGuardPosition([
                        new EnemyWaypoint(Vector2.randomPointInRect(gg_rct_ArenaCaveFirstGateGuard))
                    ], false, true);
                    return unit;
                }, 1, 2, gg_rct_ArenaCaveSpawn1);

            this.generateSpawnsMultiple(this.caveArena,
                (position: Vector2) => {
                    let unit = new CUnitTypeEnemyMeleeFodderSkeleton( GameConfig.getInstance().skeletonPlayer, position);
                    unit.aiComponent?.setGuardPosition([
                        new EnemyWaypoint(Vector2.randomPointInRect(gg_rct_ArenaCaveFirstGateGuard))
                    ], false, true);
                    return unit;
                }, 0.5, 4, gg_rct_ArenaCaveSpawn5);

            this.generateSpawnsMultiple(this.caveArena,
                (position: Vector2) => {
                    let unit = new CUnitTypeEnemyRangedFodderSkeleton( GameConfig.getInstance().skeletonPlayer, position);
                    unit.aiComponent?.setGuardPosition([
                        new EnemyWaypoint(Vector2.randomPointInRect(gg_rct_ArenaCaveFirstGateGuard))
                    ], false, true);
                    return unit;
                }, 0.5, 3, gg_rct_ArenaCaveSpawn5);

            this.yieldTimed(20);
        }
    }

    //Return next scene.
    public onFinish(): Scene | undefined {
        ArenaService.getInstance().clearAllEnemies();

        return new SceneCave();
    }

    onPlayersDeath(): void {
        Delay.getInstance().addDelay(() => {
            ArenaService.getInstance().clearAllEnemies();
            this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
            this.reset();
            print("reset");
        }, 5);

        this.remove();
        this.playMusic(Music.NONE);
    }
}