import {Logger} from "wc3-treelib/src/TreeLib/Logger";
import {GameConfig} from "./GameConfig";
import {PlayerMaster} from "./Game/PlayerManager/PlayerMaster";
import {SceneService} from "./Game/Scenes/SceneService";
import {Scene1} from "./Game/Scenes/Scene";
import {CUnitTypePlayer} from "./Game/Units/CUnit/Types/CUnitTypePlayer";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";


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

            if (GetPlayerController(p) == MAP_CONTROL_USER && GetPlayerSlotState(p) == PLAYER_SLOT_STATE_PLAYING) {
                this.gameConfig.playingPlayers.push(p);
                let h = new CUnitTypePlayer(p,
                    Vector2.fromLocationClean(GetStartLocationLoc(i))
                );
                this.playerMaster.playerHeroes.addHero(p, h);
            }
        }
        for (let i = this.gameConfig.enemyIdFrom; i < this.gameConfig.enemyIdTo; i++) {
            let p = Player(i);
            this.gameConfig.creepPlayers.push(p);
        }


        FogEnable(false);
        FogMaskEnable(false);


        this.sceneService.currentScene = new Scene1();
    }
}