import {Hooks} from "wc3-treelib/src/TreeLib/Hooks";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {MusicChange} from "./MusicChange";

export class GameConfig {
    private static instance: GameConfig;

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new GameConfig();
            Hooks.set(this.name, this.instance)
        }
        return this.instance;
    }

    private constructor() {
    }

    //Players
    public readonly playerIdFrom = 0;
    public readonly playerIdTo = 3;
    public readonly enemyIdFrom = 4;
    public readonly enemyIdTo = 5;

    public readonly allPlayerSlots: player[] = [];
    public readonly playingPlayers: player[] = [];
    public readonly creepPlayer: player = Players.NEUTRAL_HOSTILE;


    //asd
    public timeScale: number = 1;


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

