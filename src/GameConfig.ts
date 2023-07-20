import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {MusicChange} from "./MusicChange";

export class GameConfig {
    private static _instance: GameConfig;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new GameConfig();
        }
        return this._instance;
    }
    private constructor() {
        this.creepPlayer = Players.NEUTRAL_HOSTILE;
        this.skeletonPlayer = Players.BROWN;
        this.nagaPlayer = Players.NAVY;
    }

    //Players
    public readonly playerIdFrom = 0;
    public readonly playerIdTo = 3;
    public readonly enemyIdFrom = 4;
    public readonly enemyIdTo = 23;

    public readonly allPlayerSlots: player[] = [];
    public readonly playingPlayers: player[] = [];

    public creepPlayer: player;
    public skeletonPlayer: player;
    public nagaPlayer: player;


    //asd
    public timeScale: number = 1;


    //AI
    public aiEnabled: boolean = true;
    public aiEnableMove: boolean = true;
    public aiEnableAttack: boolean = true;
    public aiEnableTargetPointCalculations: boolean = true;

    //
    public countPlayingPlayers() {
        return this.playingPlayers.length;
    }

    //
    public music: string = "";
    public setMusic(track: string) {
        if (track != this.music) {
            this.music = track;
            new MusicChange(track);
        }
    }
}

