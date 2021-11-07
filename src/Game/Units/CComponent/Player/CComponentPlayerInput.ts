import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";
import {CUnit} from "../../CUnit/CUnit";
import {CComponentPlayerFire} from "../Actions/Player/CComponentPlayerFire";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CStepComponent} from "../CStepComponent";
import {CComponentPlayerDodge} from "../Actions/Player/CComponentPlayerDodge";
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

    public constructor(owner: CUnit) {
        super(owner);

        this.mcb = this.mouse.addMousePressCallback(MOUSE_BUTTON_TYPE_RIGHT, (callback) => {
            this.onFire(callback)
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_LSHIFT, (callback) => {
            this.onDodge(callback);
        });
    }
    cleanup() {
        this.mouse.removeMouseCallback(this.mcb);
    }
    private onFire(call: MouseCallback) {
        if (!this.owner.isDead && call.triggeringPlayer == this.owner.owner) {
            let mouse = this.mouse.getLastMouseCoordinate(call.triggeringPlayer);
            let facing = this.owner.getPosition().createOffsetTo(mouse);
            if (!this.owner.isDominated()) {
                this.owner.addComponent(new CComponentPlayerFire(this.owner, facing));
            }
        }
    }
    private onDodge(call: KeyCallback) {
        if (!this.owner.isDead && call.triggeringPlayer == this.owner.owner && !this.owner.isDominated() && !this.owner.isGrounded()) {
            let facing = Vector2.new(0, 0).polarProject(1, this.owner.logicAngle);
            this.owner.addComponent(new CComponentPlayerDodge(this.owner, facing));
            facing.recycle();
        }
    }
    private move = Vector2.new(0, 0);
    step(): void {
        if (!this.pauseInput && !this.owner.isDead) {
            this.move.updateTo(0, 0);

            if (this.keyboard.isKeyButtonHeld(this.keyLeft, this.owner.owner)) this.move.x -= 1;
            if (this.keyboard.isKeyButtonHeld(this.keyRight, this.owner.owner)) this.move.x += 1;
            if (this.keyboard.isKeyButtonHeld(this.keyDown, this.owner.owner)) this.move.y -= 1;
            if (this.keyboard.isKeyButtonHeld(this.keyUp, this.owner.owner)) this.move.y += 1;

            this.owner.setAutoMoveData(this.move);
        }
    }
}