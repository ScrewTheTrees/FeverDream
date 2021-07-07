import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {InputManagerKeyboardHandler} from "wc3-treelib/src/TreeLib/InputManager/InputManagerKeyboardHandler";
import {InputManagerMouseHandler} from "wc3-treelib/src/TreeLib/InputManager/InputManagerMouseHandler";
import {GameConfig} from "../../GameConfig";

export class PlayerInput extends Entity {
    private static _instance: PlayerInput;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerInput();
        }
        return this._instance;
    }

    private keyboard: InputManagerKeyboardHandler;
    private mouse: InputManagerMouseHandler;
    private gameConfig: GameConfig;

    public pauseInput = false;

    private constructor() {
        super(0.02);
        this.keyboard = InputManager.getInstance().keyboardHandler;
        this.mouse = InputManager.getInstance().mouseHandler;
        this.gameConfig = GameConfig.getInstance();
    }
    public step() {
        if (this.pauseInput) return;
        for (let p of this.gameConfig.playingPlayers) {

        }
    }
}