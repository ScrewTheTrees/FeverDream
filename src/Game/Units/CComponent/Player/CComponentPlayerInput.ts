import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";
import {CUnit} from "../../CUnit/CUnit";
import {CComponentPlayerFire} from "../Attacks/CComponentPlayerFire";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CStepComponent} from "../CCoroutineComponent";
import {KeyCallback} from "wc3-treelib/src/TreeLib/InputManager/KeyCallback";

export class CComponentPlayerInput extends CStepComponent {
    removeOnDeath = false;
    private keyboard = InputManager.getInstance().keyboardHandler;
    private mouse = InputManager.getInstance().mouseHandler;

    public pauseInput = false;

    public keyLeft: oskeytype = OSKEY_A;
    public keyRight: oskeytype = OSKEY_D;
    public keyUp: oskeytype = OSKEY_W;
    public keyDown: oskeytype = OSKEY_S;
    private mcb: MouseCallback;
    private mtt: KeyCallback;

    public constructor(owner: CUnit) {
        super(owner);
        this.mcb = this.mouse.addMousePressCallback(MOUSE_BUTTON_TYPE_RIGHT, (callback) => this.onFire(callback));
        this.mtt = this.keyboard.addKeyboardPressCallback(OSKEY_T, () => {
            this.owner.isDead = true;
        });
    }
    cleanup() {
        this.mouse.removeMouseCallback(this.mcb);
        this.keyboard.removeKeyCallback(this.mtt);
    }
    private onFire(callback: MouseCallback) {
        let hero = this.owner;
        if (hero && !hero.isDead) {
            let mouse = this.mouse.getLastMouseCoordinate(callback.triggeringPlayer);
            let facing = hero.position.createOffsetTo(mouse);
            if (!hero.isDominated()) {
                hero.addComponent(new CComponentPlayerFire(hero, facing));
            }
        }
    }
    private move = Vector2.new(0, 0);
    execute(): void {
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
    }
}