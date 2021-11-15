import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";
import {CUnit} from "../../CUnit/CUnit";
import {CComponentPlayerFire} from "../Actions/Player/CComponentPlayerFire";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CStepComponent} from "../CStepComponent";
import {CComponentPlayerDodge} from "../Actions/Player/CComponentPlayerDodge";
import {KeyCallback} from "wc3-treelib/src/TreeLib/InputManager/KeyCallback";
import {CComponentPlayerPlaceBarricade} from "../Actions/Player/CComponentPlayerPlaceBarricade";
import {TextUtils} from "../../../Text/TextUtils";
import {RGB} from "wc3-treelib/src/TreeLib/Utility/Data/RGB";
import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {PlayerStats} from "../../../PlayerManager/PlayerStats";

export enum ToolId {
    NORMAL_ATTACK,
    BUILD_BARRICADE,
}

export abstract class Tool extends Entity {
    public constructor() {
        super(0.02);
    }
    public isSelected = false;
    public abstract toolId: ToolId;
    //public abstract iconPath: string;
    public abstract progress(): -1 | number;
    public abstract step(): void;
    public abstract validate(owner: CUnit, targetLocation: Vector2): boolean;
    public abstract execute(owner: CUnit, targetLocation: Vector2): boolean;
}

export class ToolNormalShoot extends Tool {
    toolId: ToolId = ToolId.NORMAL_ATTACK;
    component?: CComponentPlayerFire;

    progress() {
        return -1;
    }
    validate(owner: CUnit, targetLocation: Vector2): boolean {
        if (owner.isDead) return false;
        if (owner.isDominated()) return false;
        return true;
    }
    execute(owner: CUnit, targetLocation: Vector2): boolean {
        this.component = owner.addComponent(new CComponentPlayerFire(owner, targetLocation));
        return true;
    }
    step(): void {
        if (this.component && this.component.isFinished) this.component = undefined;
    }
}

export class ToolPlaceBarricade extends Tool {
    toolId: ToolId = ToolId.BUILD_BARRICADE;
    public component?: CComponentPlayerPlaceBarricade;

    private cooldown = 0;
    private maxCoolDown = 10;

    progress() {
        if (this.cooldown <= 0) return -1;
        return ((this.maxCoolDown - this.cooldown) / this.maxCoolDown);
    }
    validate(owner: CUnit, targetLocation: Vector2): boolean {
        if (owner.isDead) return false;
        if (owner.isDominated()) return false;
        if (this.cooldown > 0) return false;
        return true;
    }
    execute(owner: CUnit, targetLocation: Vector2): boolean {
        this.component = owner.addComponent(new CComponentPlayerPlaceBarricade(owner, targetLocation));
        this.cooldown = this.maxCoolDown;
        return true;
    }
    step(): void {
        if (this.component && this.component.isFinished) this.component = undefined;
        if (this.cooldown > 0) this.cooldown -= this.timerDelay * PlayerStats.getInstance().cooldownReduction;
    }
}

export class CComponentPlayerInput extends CStepComponent {
    removeOnDeath = false;
    private keyboard = InputManager.getInstance().keyboardHandler;
    private mouse = InputManager.getInstance().mouseHandler;

    public pauseInput = false;

    public keyLeft: oskeytype = OSKEY_A;
    public keyRight: oskeytype = OSKEY_D;
    public keyUp: oskeytype = OSKEY_W;
    public keyDown: oskeytype = OSKEY_S;

    public toolTip: texttag = CreateTextTag();

    public toolList: Tool[] = [
        new ToolNormalShoot(),
        new ToolPlaceBarricade(),
    ];
    public currentTool?: Tool;


    public selectTool(tool: Tool) {
        if (this.currentTool) this.currentTool.isSelected = false;
        this.currentTool = tool;
        tool.isSelected = true;
    }

    public constructor(owner: CUnit) {
        super(owner);

        this.selectTool(this.toolList[0])

        this.mouse.addMousePressCallback(MOUSE_BUTTON_TYPE_RIGHT, (callback) => {
            this.onRightClick(callback)
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_LSHIFT, (callback) => {
            this.onDodge(callback);
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_1, (callback) => {
            if (callback.triggeringPlayer != this.owner.owner) return;
            this.currentTool = this.toolList[0];
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_2, (callback) => {
            if (callback.triggeringPlayer != this.owner.owner) return;
            this.currentTool = this.toolList[1];
        });
    }
    cleanup() {

    }

    private colorTeal = RGB.teal;
    private colorWhite = RGB.white;
    private move = Vector2.new(0, 0);
    step(): void {
        SetTextTagPermanent(this.toolTip, true);
        SetTextTagPos(this.toolTip, this.owner.getPosition().x, this.owner.getPosition().y, this.owner.getZValue() + 16);

        let text = "";
        if (this.currentTool) {
            text += this.currentTool.constructor.name;
            text += "\n";
            if (this.currentTool.progress() != -1) {
                text += TextUtils.generateProgressString(this.currentTool.progress(), 1, undefined, this.colorTeal, this.colorWhite);
            }
        }
        SetTextTagText(this.toolTip, text, 0.02);

        if (!this.pauseInput && !this.owner.isDead) {
            this.move.updateTo(0, 0);

            if (this.keyboard.isKeyButtonHeld(this.keyLeft, this.owner.owner)) this.move.x -= 1;
            if (this.keyboard.isKeyButtonHeld(this.keyRight, this.owner.owner)) this.move.x += 1;
            if (this.keyboard.isKeyButtonHeld(this.keyDown, this.owner.owner)) this.move.y -= 1;
            if (this.keyboard.isKeyButtonHeld(this.keyUp, this.owner.owner)) this.move.y += 1;

            this.owner.setAutoMoveData(this.move);
        }
    }

    private onRightClick(call: MouseCallback) {
        if (call.triggeringPlayer != this.owner.owner) return false;

        if (this.currentTool && this.currentTool.validate(this.owner, call.position)) {
            this.currentTool.execute(this.owner, call.position);
        }
    }
    private onDodge(call: KeyCallback) {
        if (this.owner.isDead) return;
        if (call.triggeringPlayer != this.owner.owner) return;
        if (this.owner.isDominated()) return;
        if (this.owner.isGrounded()) return;

        let facing = this.owner.getPosition().copy().polarProject(1, this.owner.logicAngle);
        this.owner.addComponent(new CComponentPlayerDodge(this.owner, facing));
        facing.recycle();
    }
}