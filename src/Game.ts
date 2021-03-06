import {Logger} from "wc3-treelib/src/TreeLib/Logger";
import {GameConfig} from "./GameConfig";
import {PlayerMaster} from "./Game/PlayerManager/PlayerMaster";
import {SceneService} from "./Game/Scenes/SceneService";
import {CUnitTypePlayer} from "./Game/Units/CUnit/Types/CUnitTypePlayer";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {BootlegPathfinding} from "./Game/Units/BootlegPathfinding";


// =========================================
// It's not perfect, but it'll do the trick.
// =========================================

export class Game {
    private playerMaster = PlayerMaster.getInstance();
    private sceneService = SceneService.getInstance();
    private pathfinding = BootlegPathfinding.getInstance();

    constructor() {
        Logger.doLogVerbose = false;
        Logger.doLogDebug = false;

        for (let i = GameConfig.playerIdFrom; i <= GameConfig.playerIdTo; i++) {
            let p = Player(i);
            GameConfig.allPlayerSlots.push(p);

            if (GetPlayerController(p) == MAP_CONTROL_USER && GetPlayerSlotState(p) == PLAYER_SLOT_STATE_PLAYING) {
                GameConfig.playingPlayers.push(p);
                let h = new CUnitTypePlayer(p,
                    Vector2.new(GetStartLocationX(i), GetStartLocationY(i))
                );
                this.playerMaster.playerHeroes.addHero(p, h);
            }
        }
        for (let p of GameConfig.allPlayerSlots) {
            for (let t of GameConfig.allPlayerSlots) {
                SetPlayerAlliance(p, t, ALLIANCE_PASSIVE, true);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_XP, true);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_SPELLS, true);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_VISION, true);
            }
        }

        FogEnable(false);
        FogMaskEnable(false);
        //BlzHideOriginFrames(true);
        let frame = BlzGetFrameByName("ConsoleUIBackdrop", 0);
        BlzFrameSetVisible(frame, false);
    }
}