import {PlayerHeroes} from "./PlayerHeroes";
import {PlayerCamera} from "./PlayerCamera";

export class PlayerMaster {
    private static _instance: PlayerMaster;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerMaster();
        }
        return this._instance;
    }

    private constructor() {
    }


    public playerHeroes = PlayerHeroes.getInstance();
    public playerCamera = PlayerCamera.getInstance();
}