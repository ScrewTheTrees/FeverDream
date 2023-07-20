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

        for (let i =  GameConfig.getInstance().playerIdFrom; i <=  GameConfig.getInstance().playerIdTo; i++) {
            let p = Player(i);
             GameConfig.getInstance().allPlayerSlots.push(p);

            if (GetPlayerController(p) == MAP_CONTROL_USER && GetPlayerSlotState(p) == PLAYER_SLOT_STATE_PLAYING) {
                 GameConfig.getInstance().playingPlayers.push(p);
                let h = new CUnitTypePlayer(p,
                    Vector2.new(GetStartLocationX(i), GetStartLocationY(i))
                );
                this.playerMaster.playerHeroes.addHero(p, h);
            }
        }
        for (let p of  GameConfig.getInstance().allPlayerSlots) {
            for (let t of  GameConfig.getInstance().allPlayerSlots) {
                SetPlayerAlliance(p, t, ALLIANCE_PASSIVE, true);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_XP, true);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_SPELLS, true);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_VISION, true);
            }
        }
        for (let i =  GameConfig.getInstance().enemyIdFrom; i <=  GameConfig.getInstance().enemyIdTo; i++) {
            for (let j = 0; j <=  GameConfig.getInstance().enemyIdTo; j++) {
                let val = false;
                if (i == j) val = true;

                let p = Player(i);
                let t = Player(j);

                SetPlayerAlliance(p, t, ALLIANCE_PASSIVE, val);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_XP, val);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_SPELLS, val);
                SetPlayerAlliance(p, t, ALLIANCE_SHARED_VISION, val);
                SetPlayerAlliance(p, t, ALLIANCE_HELP_REQUEST, val);
                SetPlayerAlliance(p, t, ALLIANCE_HELP_RESPONSE, val);
            }
        }


        FogEnable(false);
        FogMaskEnable(false);
        //BlzHideOriginFrames(true);
        let frame = BlzGetFrameByName("ConsoleUIBackdrop", 0);
        BlzFrameSetVisible(frame, false);
    }
}