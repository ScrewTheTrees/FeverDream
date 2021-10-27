import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";
import {CUnit} from "../../CUnit/CUnit";
import {CComponentPlayerFire} from "../Attacks/CComponentPlayerFire";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {GameConfig} from "../../../../GameConfig";
import {CUnitTypeEnemyMeleeFodderSkeleton} from "../../CUnit/Types/CUnitTypeEnemyMeleeFodderSkeleton";
import {Players} from "wc3-treelib/src/TreeLib/Structs/Players";
import {CUnitTypeEnemyMeleeMyrmidion} from "../../CUnit/Types/CUnitTypeEnemyMeleeMyrmidion";
import {CUnitTypeEnemyRangedSiren} from "../../CUnit/Types/CUnitTypeEnemyRangedSiren";
import {BootlegPathfinding} from "../../BootlegPathfinding";
import {PlayerStats} from "../../../PlayerManager/PlayerStats";
import {Models} from "../../../Models";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {CUnitTypeEnemyRangedFodderSkeleton} from "../../CUnit/Types/CUnitTypeEnemyRangedFodderSkeleton";
import {CStepComponent} from "../CStepComponent";
import {SceneService} from "../../../Scenes/SceneService";
import {TreeThread} from "wc3-treelib/src/TreeLib/Utility/TreeThread";
import {LightningEffects} from "wc3-treelib/src/TreeLib/Structs/LightningEffects";

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
            this.owner.killUnit();
        });

        this.keyboard.addKeyboardPressCallback(OSKEY_1, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                new CUnitTypeEnemyMeleeFodderSkeleton(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_2, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                new CUnitTypeEnemyRangedFodderSkeleton(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_3, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                new CUnitTypeEnemyMeleeMyrmidion(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_4, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                new CUnitTypeEnemyRangedSiren(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_P, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                PlayerStats.getInstance().fireRate *= 2;
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_O, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                PlayerStats.getInstance().fireRate /= 2;
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_J, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                let path = BootlegPathfinding.getInstance().find(this.owner.position, this.mouse.getLastMouseCoordinate(this.owner.owner)).path
                let things: effect[] = [];
                for (let p of path) {
                    things.push(AddSpecialEffect(Models.PROJECTILE_ENEMY_RANGED_MAGIC, p.point.x, p.point.y));
                }
                Delay.addDelay(() => {
                    for (let p of things) {
                        DestroyEffect(p);
                    }
                }, 10);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_H, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                BootlegPathfinding.getInstance().findAsync(
                    this.owner.position,
                    this.mouse.getLastMouseCoordinate(this.owner.owner)).then(
                    (result) => {

                        let things: effect[] = [];
                        for (let p of result.path) {
                            things.push(AddSpecialEffect(Models.PROJECTILE_ENEMY_RANGED_MAGIC, p.point.x, p.point.y));
                        }
                        Delay.addDelay(() => {
                            for (let p of things) {
                                DestroyEffect(p);
                            }
                        }, 10);

                        let asd = function (pos: Vector2, index: number, offsetTowardsNextNode: boolean) {
                            //let previousNode = result.getNode(index - 1) || result.getNode(index);
                            let node = result.getNode(index);

                            if (!offsetTowardsNextNode) {
                                return node.getClosestPointWithBoundary(pos, 16);
                            }
                            let nextNode = result.getNode(index + 1);
                            if (nextNode == null) return node.point.copy();

                            let nextNodePos = nextNode.getClosestPointWithBoundary(pos, 16);
                            let currNodePos = node.getClosestPointWithBoundary(nextNodePos, 16)
                            nextNodePos.recycle();
                            return currNodePos;
                        }

                        //path = result.optimisePath();
                        for (let i = 0; i < result.path.length; i++) {
                            let pp = result.getNode(i - 1) ? result.getNode(i - 1).point : this.owner.position;
                            let point = asd(pp, i, false);
                            things.push(AddSpecialEffect(Models.PROJECTILE_ENEMY_RANGED_ARROW, point.x, point.y));
                            let point2 = asd(point, i, true);
                            things.push(AddSpecialEffect(Models.PROJECTILE_ENEMY_RANGED_ARROW, point2.x, point2.y));
                            point.recycle();
                            point2.recycle();
                        }
                        Delay.addDelay(() => {
                            for (let p of things) {
                                DestroyEffect(p);
                            }
                        }, 10);
                    })
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_M, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                GameConfig.getInstance().timeScale += 0.1;
                print(GameConfig.getInstance().timeScale);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD0, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                SceneService.getInstance().finishScene();
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD9, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                BootlegPathfinding.getInstance().pathfinder.hardDebug = !BootlegPathfinding.getInstance().pathfinder.hardDebug;
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_N, (call) => {
            if (call.triggeringPlayer == this.owner.owner) {
                GameConfig.getInstance().timeScale -= 0.1;
                if (GameConfig.getInstance().timeScale < 0) GameConfig.getInstance().timeScale = 0;
                print(GameConfig.getInstance().timeScale);
            }
        });

        TreeThread.RunUntilDone(() => {
            let top = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
            let bottom = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
            let left = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
            let right = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
            let center = AddSpecialEffect(Models.PROJECTILE_ENEMY_RANGED_MAGIC, 0, 0);
            let toNeighbors: effect[] = [];

            while (true) {
                let mouse = this.mouse.getLastMouseCoordinate(Player(0));
                let node = BootlegPathfinding.getInstance().pathfinder.getGridElementByCoordinate(mouse.x, mouse.y);
                if (node != null) {
                    MoveLightning(top, false, node.boundary.xMin, node.boundary.yMax, node.boundary.xMax, node.boundary.yMax);
                    MoveLightning(bottom, false, node.boundary.xMin, node.boundary.yMin, node.boundary.xMax, node.boundary.yMin);
                    MoveLightning(left, false, node.boundary.xMin, node.boundary.yMin, node.boundary.xMin, node.boundary.yMax);
                    MoveLightning(right, false, node.boundary.xMax, node.boundary.yMin, node.boundary.xMax, node.boundary.yMax);
                    BlzSetSpecialEffectPosition(center, node.point.x, node.point.y, node.point.getZ());
                    for (let f of toNeighbors) {
                        BlzSetSpecialEffectPosition(f, 0, 0, 0);
                    }
                    for (let i = 0; i < node.neighbors.length; i++) {
                        let neighbor = node.neighbors[i];
                        let gfx = toNeighbors[i];
                        if (gfx == null) {
                            gfx = AddSpecialEffect(Models.PROJECTILE_PLAYER_FIRE, 0, 0);
                            toNeighbors[i] = gfx;
                        }
                        BlzSetSpecialEffectPosition(gfx, neighbor.point.x, neighbor.point.y, neighbor.point.getZ());
                    }
                }
                coroutine.yield();
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