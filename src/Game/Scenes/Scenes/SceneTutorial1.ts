import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {GateOperation} from "../GateOperation";
import {
    CUnitTypeEnemyMeleeFodderSkeleton
} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeFodderSkeleton";
import {Scene} from "./Scene";
import {SceneTutorial2} from "./SceneTutorial2";
import {ArenaService} from "../Arenas/ArenaService";
import {Music} from "../../Music";
import {CUnitTypeEnemyRangedFodderSkeleton} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedFodderSkeleton";
import { Delay } from "wc3-treelib/src/TreeLib/Services/Delay/Delay";
import {GameConfig} from "../../../GameConfig";

export class SceneTutorial1 extends Scene {
    public checkpoint1 = gg_rct_Scene1Start;

    public combatArena1 = ArenaService.getInstance().combatArena1;

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();

        let pos = Vector2.fromRectCenter(this.checkpoint1);
        this.moveHelpText = CreateTextTag();
        SetTextTagText(this.moveHelpText, "WASD to move.", 0.024);
        SetTextTagPos(this.moveHelpText, pos.x, pos.y, 16);
        SetTextTagVisibility(this.moveHelpText, true);
        SetTextTagPermanent(this.moveHelpText, true);

        pos = Vector2.fromRectCenter(gg_rct_Scene1Camera1);
        this.attackHelpText = CreateTextTag();
        SetTextTagText(this.attackHelpText, "Right click to fire.", 0.024);
        SetTextTagPos(this.attackHelpText, pos.x, pos.y, 16);
        SetTextTagVisibility(this.attackHelpText, true);
        SetTextTagPermanent(this.attackHelpText, true);
    }

    public moveHelpText: texttag;
    public attackHelpText: texttag;

    public onUpdateStep() {
        this.combatArena1.updateWaterfallLogic();
    }
    public execute() {
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
        this.playMusic(Music.NONE);

        this.combatArena1.closeArena();
        this.combatArena1.toggleEntrances(GateOperation.OPEN);

        this.cameraShowActionThenResetHeroCamera(Vector2.fromRectCenter(this.checkpoint1).recycle(),
            undefined
            , 2500, 1, 3);

        /** ARENA 1 */

        this.waitUntilPlayerTriggerArena(this.combatArena1);
        this.startStandardCombatArena(this.combatArena1);
        this.playMusic(Music.SECTION_1);
        this.yieldTimed(1);

        this.generateSpawnForAllPlayerAsync(this.combatArena1, (place, focus) => {
            return new CUnitTypeEnemyMeleeFodderSkeleton( GameConfig.getInstance().skeletonPlayer, place, focus);
        }, 1, 4, this.combatArena1.enemySpawns[0]);


        this.cameraShowActionThenResetHeroCamera(Vector2.fromRectCenter(gg_rct_Scene1Camera1).recycle(),
            undefined
            , 2400, 1, 4);

        this.waitWhileArenaHasEnemies(this.combatArena1, this.numberOfPlayers());

        this.generateSpawnForAllPlayerAsync(this.combatArena1, ( place, focus) => {
            return new CUnitTypeEnemyRangedFodderSkeleton( GameConfig.getInstance().skeletonPlayer, place, focus);
        }, 1, 2, this.combatArena1.enemySpawns[0]);
        this.yieldTimed(0.5);
        this.generateSpawnForAllPlayerAsync(this.combatArena1, ( place, focus) => {
            return new CUnitTypeEnemyRangedFodderSkeleton( GameConfig.getInstance().skeletonPlayer, place, focus);
        }, 1, 2, this.combatArena1.enemySpawns[1]);

        this.waitWhileArenaHasEnemies(this.combatArena1);


        this.generateSpawnForAllPlayerAsync(this.combatArena1, (place, focus) => {
            return new CUnitTypeEnemyMeleeFodderSkeleton( GameConfig.getInstance().skeletonPlayer, place, focus);
        }, 1, 3);
        this.yieldTimed(1.5);
        this.generateSpawnForAllPlayerAsync(this.combatArena1, ( place, focus) => {
            return new CUnitTypeEnemyRangedFodderSkeleton( GameConfig.getInstance().skeletonPlayer, place, focus);
        }, 1, 3);

        this.waitWhileArenaHasEnemies(this.combatArena1);

        this.playMusic(Music.NONE);
        this.yieldTimed(2);
        this.cameraShowActionThenResetHeroCamera(Vector2.fromWidget(this.combatArena1.exit[0]),
            () => this.combatArena1.toggleExits(GateOperation.OPEN));

        ArenaService.getInstance().clearAllEnemies();
    }

    public onFinish(): Scene | undefined {
        DestroyTextTag(this.moveHelpText);
        DestroyTextTag(this.attackHelpText);

        ArenaService.getInstance().clearAllEnemies();
        //Return next scene.
        return new SceneTutorial2();
    }
    onPlayersDeath(): void {
        Delay.getInstance().addDelay(() => {
            ArenaService.getInstance().clearAllEnemies();
            this.reset();
        }, 5);

        this.remove();
        this.playMusic(Music.NONE);
    }
}