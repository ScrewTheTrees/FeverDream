import {Scene1Arena1, Scene1Arena2} from "../Arenas/Arena";
import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {GateOperation} from "../GateOperation";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {CUnitTypeEnemyTutorialMelee} from "../../Units/CUnit/Types/CUnitTypeEnemyTutorialMelee";
import {Scene} from "./Scene";
import {CUnitTypeEnemyRangedSiren} from "../../Units/CUnit/Types/CUnitTypeEnemyRangedSiren";
import {CUnitTypeEnemyMeleeMyrmidion} from "../../Units/CUnit/Types/CUnitTypeEnemyMeleeMyrmidion";
import {Scene2} from "./Scene2";

export enum CHECKPOINT {
    FIRST,
    SECOND,
    THIRD,
    FOURTH,
    FIFTH
}

export class Scene1 extends Scene {
    public checkpoint1 = gg_rct_Scene1Start;
    public checkpoint2 = gg_rct_Scene1Arena1Tardy1;

    public currentCheckpoint: CHECKPOINT = CHECKPOINT.FIRST;

    public arena1 = new Scene1Arena1();
    public arena2 = new Scene1Arena2();

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

        pos = Vector2.fromRectCenter(gg_rct_Scene1Arena1Camera1);
        this.attackHelpText = CreateTextTag();
        SetTextTagText(this.attackHelpText, "Right click to fire.", 0.024);
        SetTextTagPos(this.attackHelpText, pos.x, pos.y, 16);
        SetTextTagVisibility(this.attackHelpText, true);
        SetTextTagPermanent(this.attackHelpText, true);
    }

    public moveHelpText: texttag;
    public attackHelpText: texttag;

    public execute() {
        if (this.currentCheckpoint == CHECKPOINT.FIRST) {
            this.executeArena1();
            this.currentCheckpoint = CHECKPOINT.SECOND;
        }
        if (this.currentCheckpoint == CHECKPOINT.SECOND) {
            this.executeArena2();
        }
    }

    private executeArena1() {
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);

        this.arena1.closeArena();
        this.arena1.toggleEntrances(GateOperation.OPEN);

        this.cameraShowActionThenResetHeroCamera(Vector2.fromRectCenter(this.checkpoint1).recycle(),
            undefined
            , 2500, 1, 3);

        /** ARENA 1 */
        this.waitUntilPlayerTriggerArena(this.arena1);
        this.startStandardCombatArena(this.arena1);

        this.generateSpawnPerPlayerAsync(this.arena1, (ep, place, focus) => {
            return new CUnitTypeEnemyTutorialMelee(ep, place, focus);
        }, 1, 4, this.arena1.enemySpawns[0]);


        this.cameraShowActionThenResetHeroCamera(Vector2.fromRectCenter(gg_rct_Scene1Arena1Camera1).recycle(),
            undefined
            , 2400, 1, 4);

        this.waitWhileArenaHasEnemies(this.arena1, this.numberOfPlayers());

        this.generateSpawnPerPlayerAsync(this.arena1, (ep, place, focus) => {
            return new CUnitTypeEnemyTutorialMelee(ep, place, focus);
        }, 1, 6);

        this.waitWhileArenaHasEnemies(this.arena1);

        this.yieldTimed(2);
        this.cameraShowActionThenResetHeroCamera(Vector2.fromWidget(this.arena1.exit[0]),
            () => this.arena1.toggleExits(GateOperation.OPEN));
    }
    private executeArena2() {
        /** ARENA 2 */
        this.playerCamera.setHeroCamera();
        this.playerHeroes.reviveHeroesIfDead(this.checkpoint2);

        this.arena1.toggleEntrances(GateOperation.CLOSE);
        this.arena1.toggleExits(GateOperation.OPEN);
        this.arena2.toggleEntrances(GateOperation.OPEN);

        this.waitUntilPlayerTriggerArena(this.arena2);
        this.startStandardCombatArena(this.arena2);

        this.generateSpawnPerPlayerAsync(this.arena2, (ep, place, focus) => {
            return new CUnitTypeEnemyMeleeMyrmidion(ep, place, focus);
        }, 1, 2);

        this.cameraShowActionThenResetHeroCamera(Vector2.fromRectCenter(gg_rct_Scene1Arena2Camera1).recycle(),
            undefined
            , 1900, 1, 3);

        this.waitWhileArenaHasEnemies(this.arena2);

        this.generateSpawnPerPlayerAsync(this.arena2, (ep, place, focus) => {
            return new CUnitTypeEnemyRangedSiren(ep, place, focus);
        }, 1, 2);

        this.waitWhileArenaHasEnemies(this.arena2);

        this.generateSpawnPerPlayerAsync(this.arena2, (ep, place, focus) => {
            return new CUnitTypeEnemyMeleeMyrmidion(ep, place, focus);
        }, 2, 2);
        this.yieldTimed(1);
        this.generateSpawnPerPlayerAsync(this.arena2, (ep, place, focus) => {
            return new CUnitTypeEnemyRangedSiren(ep, place, focus);
        }, 2, 2);


        this.waitWhileArenaHasEnemies(this.arena2);
        this.yieldTimed(1);

        //Open up the entire level.
        this.arena1.toggleBoth(GateOperation.DESTROY);
        this.arena2.toggleBoth(GateOperation.DESTROY);

        this.waitUntilPlayerTriggerRect(gg_rct_Scene1Ending);
        this.movePlayersToRect(gg_rct_Scene2Start);
        //Finish
    }

    public onFinish(): Scene | undefined {
        DestroyTextTag(this.moveHelpText);
        DestroyTextTag(this.attackHelpText);

        print("A winner is you!");
        //Return next scene.
        return new Scene2();
    }
    onPlayersDeath(): void {
        this.remove();

        Delay.addDelay(() => {
            this.arena1.removeAllEnemies();
            this.arena2.removeAllEnemies();
            this.reset();
        }, 5);
    }
}