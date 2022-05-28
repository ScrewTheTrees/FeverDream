import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Delay} from "wc3-treelib/src/TreeLib/Services/Delay/Delay";
import {Scene} from "./Scene";
import {GateOperation} from "../GateOperation";
import {CUnitTypeEnemyMeleeMyrmidion} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeMyrmidion";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnitTypeEnemyRangedSiren} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedSiren";
import {ArenaService} from "../Arenas/ArenaService";
import {SceneCave} from "./SceneCave";
import {Music} from "../../Music";

export class SceneTutorial2 extends Scene {
    public checkpoint1 = gg_rct_Scene2Start;

    public combatArena1 = ArenaService.getInstance().combatArena1;
    public combatArena2 = ArenaService.getInstance().combatArena2;

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();
    }

    public execute() {
        /** ARENA 2 */
        this.playMusic(Music.NONE);
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);

        this.combatArena2.toggleExits(GateOperation.CLOSE);
        this.combatArena2.toggleEntrances(GateOperation.OPEN);

        this.waitUntilPlayerTriggerArena(this.combatArena2);
        this.startStandardCombatArena(this.combatArena2);
        this.playMusic(Music.SECTION_1);
        this.yieldTimed(1);

        this.generateSpawnPerPlayerAsync(this.combatArena2, (ep, place, focus) => {
            return new CUnitTypeEnemyMeleeMyrmidion(ep, place, focus);
        }, 1, 2);

        this.cameraShowActionThenResetHeroCamera(Vector2.fromRectCenter(gg_rct_Arena2Camera1).recycle(),
            undefined
            , 1900, 1, 3);

        this.waitWhileArenaHasEnemies(this.combatArena2);

        this.generateSpawnPerPlayerAsync(this.combatArena2, (ep, place, focus) => {
            return new CUnitTypeEnemyRangedSiren(ep, place, focus);
        }, 1, 2);

        this.waitWhileArenaHasEnemies(this.combatArena2);

        this.generateSpawnPerPlayerAsync(this.combatArena2, (ep, place, focus) => {
            return new CUnitTypeEnemyMeleeMyrmidion(ep, place, focus);
        }, 2, 2);
        this.yieldTimed(1);
        this.generateSpawnPerPlayerAsync(this.combatArena2, (ep, place, focus) => {
            return new CUnitTypeEnemyRangedSiren(ep, place, focus);
        }, 2, 2);


        this.waitWhileArenaHasEnemies(this.combatArena2);
        this.playMusic(Music.NONE);
        this.yieldTimed(1);

        //Open up the entire tutorial.
        this.combatArena1.toggleExits(GateOperation.DESTROY);
        this.combatArena2.toggleBoth(GateOperation.DESTROY);

        this.waitUntilPlayerTriggerRect(gg_rct_Scene2Ending);
        this.movePlayersToRect(gg_rct_SceneCaveStart);
        //Finish
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
        }, 5);

        this.remove();
        this.playMusic(Music.NONE);
    }
}