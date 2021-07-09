import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {GameConfig} from "../../GameConfig";
import {PlayerHeroes} from "./PlayerHeroes";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CCommandPlayerFire} from "../Units/CUnit";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";

export class PlayerInput extends Entity {
    private static _instance: PlayerInput;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerInput();
        }
        return this._instance;
    }

    private keyboard = InputManager.getInstance().keyboardHandler;
    private mouse = InputManager.getInstance().mouseHandler;
    private gameConfig = GameConfig.getInstance();
    private playerHeroes = PlayerHeroes.getInstance();

    public pauseInput = false;

    public keyLeft: oskeytype = OSKEY_A;
    public keyRight: oskeytype = OSKEY_D;
    public keyUp: oskeytype = OSKEY_W;
    public keyDown: oskeytype = OSKEY_S;

    private constructor() {
        super(0.01);
        this.mouse.addMousePressCallback(MOUSE_BUTTON_TYPE_RIGHT, (callback) => this.onFire(callback));
    }
    private onFire(callback: MouseCallback) {
        let hero = this.playerHeroes.getHero(callback.triggeringPlayer);
        if (hero) {
            let mouse = this.mouse.getLastMouseCoordinate(callback.triggeringPlayer);
            let facing = mouse.copy().subtractOffset(hero.position);
            if (hero.dominantCommand == undefined) {
                hero.dominantCommand = new CCommandPlayerFire(hero, facing);
            }

        }
    }
    public step() {
        if (this.pauseInput) return;
        for (let p of this.gameConfig.playingPlayers) {
            let hero = this.playerHeroes.getHero(p);
            if (hero == null) continue;

            let move = Vector2.new(0, 0);

            if (this.keyboard.isKeyButtonHeld(this.keyLeft, p)) move.x -= 1;
            if (this.keyboard.isKeyButtonHeld(this.keyRight, p)) move.x += 1;
            if (this.keyboard.isKeyButtonHeld(this.keyDown, p)) move.y -= 1;
            if (this.keyboard.isKeyButtonHeld(this.keyUp, p)) move.y += 1;

            if (move.x == 0 && move.y == 0) continue;

            hero.move(move);
            move.recycle();
        }
    }
}