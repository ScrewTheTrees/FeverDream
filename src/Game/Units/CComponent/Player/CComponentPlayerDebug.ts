import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";
import {MouseCallback} from "wc3-treelib/src/TreeLib/InputManager/MouseCallback";
import {CUnit} from "../../CUnit/CUnit";
import {CComponentPlayerFire} from "../Actions/Player/CComponentPlayerFire";
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
import {CComponentPlayerDodge} from "../Actions/Player/CComponentPlayerDodge";
import {KeyCallback} from "wc3-treelib/src/TreeLib/InputManager/KeyCallback";
import {PlayerHeroes} from "../../../PlayerManager/PlayerHeroes";
import {CUnitTypeDummy} from "../../CUnit/Types/CUnitTypeDummy";

export class CComponentPlayerDebug extends CStepComponent {
    removeOnDeath = false;
    private keyboard = InputManager.getInstance().keyboardHandler;
    private mouse = InputManager.getInstance().mouseHandler;

    public constructor(owner: CUnit) {
        super(owner);

        //DEBUG
        this.keyboard.addKeyboardPressCallback(OSKEY_T, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                for (let h of CUnit.unitPool.alivePool) {
                    h.killUnit();
                }
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD1, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                new CUnitTypeEnemyMeleeFodderSkeleton(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer), this.owner);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD2, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                new CUnitTypeEnemyRangedFodderSkeleton(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer), this.owner);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD3, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                new CUnitTypeEnemyMeleeMyrmidion(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer), this.owner);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD4, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                new CUnitTypeEnemyRangedSiren(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer), this.owner);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD7, (call) => {
            Delay.addDelay(() => {
                new CUnitTypeEnemyMeleeFodderSkeleton(Players.NEUTRAL_HOSTILE, this.mouse.getLastMouseCoordinate(call.triggeringPlayer), this.owner);
            }, 0.02, 100);
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD8, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                new CUnitTypeDummy(call.triggeringPlayer, this.mouse.getLastMouseCoordinate(call.triggeringPlayer));
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_P, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                PlayerStats.getInstance().fireRate *= 2;
                PlayerStats.getInstance().cooldownReduction *= 2;
                PlayerStats.getInstance().actionRate *= 2;
                print(PlayerStats.getInstance().fireRate);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_O, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                PlayerStats.getInstance().fireRate /= 2;
                PlayerStats.getInstance().cooldownReduction /= 2;
                PlayerStats.getInstance().actionRate /= 2;
                print(PlayerStats.getInstance().fireRate);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD9, (call) => {
            print(CUnit.unitPool.getAliveUnitsInRange(
                this.mouse.getLastMouseCoordinate(call.triggeringPlayer),
                1024
            ).length);
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_J, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                let path = BootlegPathfinding.getInstance().find(this.owner.getPosition(), this.mouse.getLastMouseCoordinate(this.owner.owner)).path
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
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                BootlegPathfinding.getInstance().findAsync(
                    this.owner.getPosition(),
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
                            let pp = result.getNode(i - 1) ? result.getNode(i - 1).point : this.owner.getPosition();
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
        this.keyboard.addKeyboardPressCallback(OSKEY_NUMPAD0, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                SceneService.getInstance().finishScene();
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_M, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                GameConfig.getInstance().timeScale += 0.1;
                GameConfig.getInstance().timeScale = Math.round(GameConfig.getInstance().timeScale * 100) / 100;
                print(GameConfig.getInstance().timeScale);
            }
        });
        this.keyboard.addKeyboardPressCallback(OSKEY_N, (call) => {
            if (call.triggeringPlayer == this.owner.owner && call.triggeringPlayer == Player(0)) {
                GameConfig.getInstance().timeScale -= 0.1;
                if (GameConfig.getInstance().timeScale < 0) GameConfig.getInstance().timeScale = 0;
                GameConfig.getInstance().timeScale = Math.round(GameConfig.getInstance().timeScale * 100) / 100;
                print(GameConfig.getInstance().timeScale);
            }
        });

        let ref: undefined | TreeThread;
        this.keyboard.addKeyboardPressCallback(OSKEY_DELETE, (call) => {
            if (ref != undefined) {
                ref.stop();
            }

            ref = TreeThread.RunUntilDone(() => {
                let top = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
                let bottom = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
                let left = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
                let right = AddLightning(LightningEffects.DRAIN_LIFE, false, 0, 0, 0, 0);
                let center = AddSpecialEffect(Models.EFFECT_START_LOCATION, 0, 0);
                BlzSetSpecialEffectColorByPlayer(center, Player(0));
                BlzSetSpecialEffectScale(center, 0.25);
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
                                gfx = AddSpecialEffect(Models.EFFECT_START_LOCATION, 0, 0);
                                BlzSetSpecialEffectScale(gfx, 0.25);
                                BlzSetSpecialEffectColorByPlayer(gfx, Player(12));
                                toNeighbors[i] = gfx;
                            }
                            BlzSetSpecialEffectPosition(gfx, neighbor.point.x, neighbor.point.y, neighbor.point.getZ());
                        }
                    }
                    coroutine.yield();
                }
            });
        });
    }
    cleanup() {

    }
    step(): void {
    }
}