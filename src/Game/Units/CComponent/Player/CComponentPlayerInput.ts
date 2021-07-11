import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {GameConfig} from "../../../../GameConfig";
import {PlayerHeroes} from "../../../PlayerManager/PlayerHeroes";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";
import {CUnit} from "../../CUnit/CUnit";
import {CComponentPlayerFire} from "../Attacks/CComponentPlayerFire";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CCoroutineComponent} from "../CCoroutineComponent";

export class CComponentPlayerInput extends CCoroutineComponent {
    private keyboard = InputManager.getInstance().keyboardHandler;
    private mouse = InputManager.getInstance().mouseHandler;
    private gameConfig = GameConfig.getInstance();
    private playerHeroes = PlayerHeroes.getInstance();

    public pauseInput = false;

    public keyLeft: oskeytype = OSKEY_A;
    public keyRight: oskeytype = OSKEY_D;
    public keyUp: oskeytype = OSKEY_W;
    public keyDown: oskeytype = OSKEY_S;
    private mcb: MouseCallback;

    public constructor(owner: CUnit) {
        super(owner);
        this.mcb = this.mouse.addMousePressCallback(MOUSE_BUTTON_TYPE_RIGHT, (callback) => this.onFire(callback));
    }
    cleanup() {
        this.mouse.removeMouseCallback(this.mcb);
    }
    private onFire(callback: MouseCallback) {
        let hero = this.playerHeroes.getHero(callback.triggeringPlayer);
        if (hero) {
            let mouse = this.mouse.getLastMouseCoordinate(callback.triggeringPlayer);
            let facing = hero.position.createOffsetTo(mouse);
            if (!hero.isDominated()) {
                hero.addComponent(new CComponentPlayerFire(hero, facing));
            }
        }
    }
    private move = Vector2.new(0, 0);
    execute(): void {
        while (!this.owner.queueForRemoval) {
            if (!this.pauseInput && !this.owner.isDead) {
                this.move.updateTo(0, 0);

                if (this.keyboard.isKeyButtonHeld(this.keyLeft, this.owner.owner)) this.move.x -= 1;
                if (this.keyboard.isKeyButtonHeld(this.keyRight, this.owner.owner)) this.move.x += 1;
                if (this.keyboard.isKeyButtonHeld(this.keyDown, this.owner.owner)) this.move.y -= 1;
                if (this.keyboard.isKeyButtonHeld(this.keyUp, this.owner.owner)) this.move.y += 1;
                if (this.keyboard.isKeyButtonHeld(OSKEY_LSHIFT, this.owner.owner)) {
                    this.owner.moveSpeedBonus = 10;
                } else this.owner.moveSpeedBonus = 0;

                this.owner.setAutoMoveData(this.move);
            }
            this.yield();
        }
    }
}