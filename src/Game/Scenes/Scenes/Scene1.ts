import {Scene1Arena1, Scene1Arena2} from "../Arenas/Arena";
import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {GateOperation} from "../GateOperation";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {CUnitTypeEnemyTutorialMelee} from "../../Units/CUnit/Types/CUnitTypeEnemyTutorialMelee";
import {GameConfig} from "../../../GameConfig";
import {Scene} from "./Scene";

export class Scene1 extends Scene {
    public checkpoint1 = gg_rct_Scene1RespawnPoint1;

    public arena1 = new Scene1Arena1();
    public arena2 = new Scene1Arena2();

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();

        let pos = Vector2.fromRectCenter(gg_rct_Scene1RespawnPoint1);
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

    private moveHelpText: texttag;
    private attackHelpText: texttag;

    public execute() {
        this.playerCamera.setHeroCamera();

        this.arena1.closeArena();
        this.arena1.toggleEntrances(GateOperation.OPEN);

        this.yieldTimed(1);
        this.playerCamera.setCustomCamera(Vector2.fromRectCenter(gg_rct_Scene1RespawnPoint1).recycle(), 2500);
        this.yieldTimed(3);
        this.playerCamera.setHeroCamera();

        this.waitUntilPlayerTriggerArena(this.arena1);
        this.startStandardCombatArena(this.arena1);

        Delay.addDelay(() => {
            this.generateSpawn(this.arena1, (ep, place, focus) => {
                return new CUnitTypeEnemyTutorialMelee(ep, place, focus)
            });
        }, 1 / this.numberOfPlayers(), 8 * this.numberOfPlayers());

        this.yieldTimed(1);
        this.playerCamera.setCustomCamera(Vector2.fromRectCenter(gg_rct_Scene1Arena1Camera1).recycle(), 2400);

        this.yieldTimed(4);

        this.playerCamera.setHeroCamera();

        this.waitWhileArenaHasEnemies(this.arena1);

        this.yieldTimed(2);
        this.playerCamera.setCustomCamera(Vector2.fromWidget(this.arena1.exit[0]));
        this.yieldTimed(1);
        this.arena1.toggleExits(GateOperation.OPEN);
        this.yieldTimed(1);
        this.playerCamera.setHeroCamera();

        this.waitUntilPlayerTriggerArena(this.arena2);
        this.startStandardCombatArena(this.arena2);

        while (1 == 1) {
            if (this.arena2.countRemainingEnemies() < 50) {
                this.generateSpawn(this.arena2, (ep, place, focus) => {
                    return new CUnitTypeEnemyTutorialMelee(ep, place, focus)
                });
            }
            this.yieldTimed(0.5);
        }

        this.yieldTimed(5);
        this.arena2.toggleExits(GateOperation.DESTROY);
    }

    //Return next scene.
    public onFinish(): Scene | undefined {
        DestroyTextTag(this.moveHelpText);
        DestroyTextTag(this.attackHelpText);

        return undefined
    }
    onPlayersDeath(): void {
        this.remove();

        Delay.addDelay(() => {
            this.arena1.removeAllEnemies();
            this.arena2.removeAllEnemies();
            this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
            this.reset();
        }, 5);
    }
}