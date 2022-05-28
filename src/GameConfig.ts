import {Hooks} from "wc3-treelib/src/TreeLib/Hooks";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {MusicChange} from "./MusicChange";

Hooks.addAfterMainHook(() => GameConfig.Init())
export class GameConfig {
    static Init() {
        this.creepPlayer = Players.NEUTRAL_HOSTILE
    }

    //Players
    public static readonly playerIdFrom = 0;
    public static readonly playerIdTo = 3;
    public static readonly enemyIdFrom = 4;
    public static readonly enemyIdTo = 5;

    public static readonly allPlayerSlots: player[] = [];
    public static readonly playingPlayers: player[] = [];
    public static creepPlayer: player;


    //asd
    public static timeScale: number = 1;


    //AI
    public static aiEnabled: boolean = true;
    public static aiEnableMove: boolean = true;
    public static aiEnableAttack: boolean = true;
    public static aiEnableTargetPointCalculations: boolean = true;

    //
    public static countPlayingPlayers() {
        return this.playingPlayers.length;
    }

    //
    public static music: string = "";
    public static setMusic(track: string) {
        if (track != this.music) {
            this.music = track;
            new MusicChange(track);
        }
    }
}

