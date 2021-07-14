import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";
import {CUnit} from "../../CUnit/CUnit";
import {CComponentPlayerFire} from "../Attacks/CComponentPlayerFire";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CStepComponent} from "../CCoroutineComponent";
import {GameConfig} from "../../../../GameConfig";
import {CUnitTypeEnemyTutorialMelee} from "../../CUnit/Types/CUnitTypeEnemyTutorialMelee";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {CUnitTypeEnemyMeleeMyrmidion} from "../../CUnit/Types/CUnitTypeEnemyMeleeMyrmidion";
import {CUnitTypeEnemyRangedSiren} from "../../CUnit/Types/CUnitTypeEnemyRangedSiren";
import {BootlegPathfinding} from "../../BootlegPathfinding";

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
        this.mcb = this.mouse.addMousePressCallback(MOUSE_BUTTON_TYPE_RIGHT, (callback) => this.onFire(callback));

        this.keyboard.addKeyboardPressCallback(OSKEY_T, () => {
            this.owner.isDead = true;
        });

        this.keyboard.addKeyboardPressCallback(OSKEY_1, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                new CUnitTypeEnemyTutorialMelee(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_2, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                new CUnitTypeEnemyMeleeMyrmidion(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_3, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                new CUnitTypeEnemyRangedSiren(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_M, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                GameConfig.getInstance().timeScale += 0.1;
                print(GameConfig.getInstance().timeScale);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_N, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                GameConfig.getInstance().timeScale -= 0.1;
                if (GameConfig.getInstance().timeScale < 0) GameConfig.getInstance().timeScale = 0;
                print(GameConfig.getInstance().timeScale);
            }
        });
    }
    cleanup() {
        this.mouse.removeMouseCallback(this.mcb);
    }
    private onFire(call: MouseCallback) {
        if (!this.owner.isDead && call.triggeringPlayer == this.owner.owner) {
            let mouse = this.mouse.getLastMouseCoordinate(call.triggeringPlayer);
            let facing = this.owner.position.createOffsetTo(mouse);
            if (!this.owner.isDominated()) {
                this.owner.addComponent(new CComponentPlayerFire(this.owner, facing));
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