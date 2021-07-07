import {Logger} from "wc3-treelib/src/TreeLib/Logger";
import {GameConfig} from "./GameConfig";
import {Models} from "./Game/Models";
import {PlayerMaster} from "./Game/PlayerManager/PlayerMaster";
import {CUnit} from "./Game/CUnit";
import {SceneService} from "./Game/Scenes/SceneService";
import {Scene1} from "./Game/Scenes/Scene";


// =========================================
// It's not perfect, but it'll do the trick.
// =========================================

export class Game {
    private gameConfig = GameConfig.getInstance();
    private playerMaster = PlayerMaster.getInstance();
    private sceneService = SceneService.getInstance();

    constructor() {
        Logger.doLogVerbose = false;
        Logger.doLogDebug = false;

        for (let i = this.gameConfig.playerIdFrom; i < this.gameConfig.playerIdTo; i++) {
            let p = Player(i);
            this.gameConfig.allPlayerSlots.push(p);

            FogEnable(false);
            FogMaskEnable(false);

            if (GetPlayerController(p) == MAP_CONTROL_USER && GetPlayerSlotState(p) == PLAYER_SLOT_STATE_PLAYING) {
                this.gameConfig.playingPlayers.push(p);
                let h = new CUnit(p,
                    Models.RIFLEMAN,
                    GetStartLocationX(i),
                    GetStartLocationY(i)
                )
                this.playerMaster.playerHeroes.addHero(p, h);
            }
        }


        this.sceneService.currentScene = new Scene1();
    }
}