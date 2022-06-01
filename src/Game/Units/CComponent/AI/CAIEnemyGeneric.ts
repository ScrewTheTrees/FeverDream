import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {BootlegPathfinding} from "../../BootlegPathfinding";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Frameworks/Pathfinder/PathfindResult";
import {RectangleNode} from "wc3-treelib/src/TreeLib/Frameworks/Pathfinder/Node";
import {BootlegCollisionMap} from "../../BootlegCollisionMap";
import {CStepComponent} from "../CStepComponent";
import {AIState} from "./AIState";
import {GameConfig} from "../../../../GameConfig";

export abstract class CAIEnemyGeneric extends CStepComponent {
    removeOnDeath = false;
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);
    public aiState = AIState.SPAWNING;

    public primaryTarget: CUnit | undefined;
    public currentTarget: CUnit | undefined;
    public closestEnemyTargetCheckDelay: number = 0.5;
    public closestEnemyDistanceCheck: number = 600;

    public attackRange: number = 100;
    public attackDelay = this.getNewAttackDelay();

    public approachRange: number = 50;
    public curving = this.getNewCurving();
    public angleUpdateConst = 1;
    public move: boolean = true;

    public pathfinder: BootlegPathfinding = BootlegPathfinding.getInstance();
    public collisionMap: BootlegCollisionMap = BootlegCollisionMap.getInstance();
    public pathFindDistance: number = 1100;
    public pathFindFrequentDistance: number = 500;
    public pathFindSlowDistance: number = 1800;
    public pathFindLudicrous: number = 5000;
    public pathFindUpdateDelay: number = GetRandomReal(0.9, 1);
    public pathFindUpdateDelayTime: number = GetRandomReal(0, 0.2);
    public pathFindCurrent?: PathfindResult<RectangleNode>;
    public pathFindCurrentId: number = 0;
    public pathFindFollowing: boolean = false;
    public pathFindCheckDist: number = math.maxinteger;
    public pathFindOffsetTowardsNextNode: boolean = true;

    public lostTargetTotalTime: number = 15;
    public lostTargetTime: number = 0;
    public lostTargetRange: number = 1800;

    protected constructor(owner: CUnit, primaryTarget?: CUnit, timerDelay: number = 0.1) {
        super(owner, timerDelay);
        this.primaryTarget = primaryTarget;
        this.target.updateToPoint(this.owner.getPosition());

        if (!this.primaryTarget) {
            this.primaryTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        }
        if (this.primaryTarget) {
            this.updatePathfinderData(this.primaryTarget.getPosition());
        }
        /*TreeThread.RunUntilDone(() => {
            let gfx = AddSpecialEffect(Models.PROJECTILE_ENEMY_RANGED_MAGIC, 0, 0);
            while (!this.owner.isDead) {
                BlzSetSpecialEffectX(gfx, this.target.x);
                BlzSetSpecialEffectY(gfx, this.target.y);
                BlzSetSpecialEffectZ(gfx, this.target.getZ());
                coroutine.yield();
            }
            DestroyEffect(gfx);
        });*/
    }

    private _isYielding = 0;
    public override timerYield(time: number) {
        this._isYielding = math.min(time, 1000);
    }


    public abstract onAttack(hero: CUnit): void;
    onAlerted(by: CUnit) {
        if (this.aiState != AIState.CHASING) {
            this.aiState = AIState.CHASING;
            this.currentTarget = by;
        }
    }


    step(): void {
        if (this.owner.isDead) this.aiState = AIState.DEAD;
        if (!GameConfig.aiEnabled) return;
        if (this._isYielding >= 0) {
            this._isYielding -= this.timeScale;
            return;
        }

        if (this.aiState == AIState.SPAWNING) {
            this.handleSpawningState();
        } else if (this.aiState == AIState.IDLE) {
            this.handleIdleState();
        } else if (this.aiState == AIState.DEAD) {
            this.handleDeadState();
        } else if (this.aiState == AIState.LOOKING_FOR_TARGET) {
            this.handleLookingForTargetState();
        } else if (this.aiState == AIState.CHASING) {
            this.handleChasingState();
        } else if (this.aiState == AIState.LOST_TARGET) {
            this.handleLostTargetState();
        }
    }

    handleSpawningState() {
        this.aiState = AIState.IDLE;
        this.timerYield(2);
        return;
    }
    handleIdleState() {
        this.aiState = AIState.LOOKING_FOR_TARGET;
    }
    handleDeadState() {
        if (!this.owner.isDead) {
            this.aiState = AIState.SPAWNING;
        }
    }
    handleLookingForTargetState() {
        this.currentTarget = this.primaryTarget;
        if (this.currentTarget == null || this.currentTarget.isDead) {
            this.currentTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        }
        if (this.currentTarget != null && !this.currentTarget.isDead) {
            this.attackDelay = this.getNewAttackDelay();
            this.updateOffset();
            this.aiState = AIState.CHASING;
            this.move = true;
            this.pathFindUpdateDelayTime = math.maxinteger; //Fire pathfinding.
            this.closestEnemyTargetCheckDelay = 0.5;
            return;
        }
        this.timerYield(0.5);
    }
    handleChasingState() {
        if (this.currentTarget == null || this.currentTarget.isDead || this.lostTargetTime >= this.lostTargetTotalTime) {
            this.aiState = AIState.LOST_TARGET;
            return;
        }
        if (this.owner.isDominated()) return; //Do nothing if dominated.

        this.currentTarget = this.calculateCurrentTarget(this.currentTarget);

        if (GameConfig.aiEnableTargetPointCalculations) {
            this.calculateTargetPoint(this.currentTarget.getPosition());
            this.calculateAngleData(this.currentTarget.getPosition());
        }

        if (this.move && GameConfig.aiEnableMove) {
            this.owner.setAutoMoveData(this.angle, 1);
        }

        this.lostTargetTime += this.lastStepSize * GameConfig.timeScale;
        if (this.currentTarget && this.owner.getPosition().distanceTo(this.currentTarget.getPosition()) <= this.lostTargetRange) {
            if (!this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), this.currentTarget.getPosition(), 64, this.lostTargetRange)) {
                this.lostTargetTime = 0;
            }
        }

        this.evaluateToAttack(this.currentTarget);
    }
    handleLostTargetState() {
        this.lostTargetTime = 0;
        this.aiState = AIState.IDLE;
        this.pathFindUpdateDelayTime = math.maxinteger;
    }

    calculateCurrentTarget(target: CUnit) {
        this.closestEnemyTargetCheckDelay -= this.lastStepSize;
        if (this.closestEnemyTargetCheckDelay <= 0) {
            if (this.primaryTarget != null && !this.primaryTarget.isDead) target = this.primaryTarget;

            let closest = CUnit.unitPool.getClosestAliveEnemy(this.owner.getPosition(), this.owner, this.closestEnemyDistanceCheck);
            if (closest) {
                let dist = this.owner.getPosition().distanceTo(closest.getPosition());
                if (dist <= this.closestEnemyDistanceCheck) {
                    if (!this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), target.getPosition(), undefined, dist - 24)) {
                        this.pathFindFollowing = false;
                        target = closest;
                    }
                }
                this.closestEnemyTargetCheckDelay = this.getNewEnemyTargetDelay(dist);
            } else {
                this.closestEnemyTargetCheckDelay = this.getNewEnemyTargetDelay();
            }
        }
        return target;
    }

    calculateAngleData(target: Vector2) {
        this.angle.updateToPoint(this.owner.getPosition()).offsetTo(this.target);

        let ang = this.angle.getAngleDegrees() + this.curving;
        this.doAngleReadjusting(target, ang);
        this.angle.updateTo(0, 0).polarProject(1, ang);
    }

    calculateTargetPoint(target: Vector2, ignoreDelay: boolean = false) {
        let dist = this.owner.getPosition().distanceTo(target);
        let delay = this.applyDistanceDelay(dist, this.pathFindUpdateDelay);

        this.pathFindUpdateDelayTime += this.lastStepSize;
        if (ignoreDelay || this.pathFindUpdateDelayTime >= delay) {
            if (dist > this.pathFindDistance || this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), target)) {
                this.updatePathfinderData(target);
            } else {
                this.pathFindFollowing = false;
            }
        }
        if (this.pathFindFollowing && this.pathFindCurrent) {
            let point = this.getPathfindingPoint(target, this.pathFindCurrentId, this.pathFindOffsetTowardsNextNode);
            let dist = this.owner.getPosition().distanceTo(point);
            let ownerDistToNextNode = this.distanceToNextNode(this.owner.getPosition());
            let nodeDistToNextNode = this.nodeDistanceToNextNode();// + this.owner.moveSpeed;

            if (!this.pathFindOffsetTowardsNextNode && dist <= (this.owner.getActualMoveSpeed() * 2)) { //Enters a rectangle
                this.pathFindOffsetTowardsNextNode = true;
            } else if (this.pathFindOffsetTowardsNextNode) { //Enters exit of rectangle
                let previousNode = this.pathFindCurrent.getNode(this.pathFindCurrentId - 1);
                if (previousNode) {
                    if (previousNode.isInsideNode(this.owner.getPosition())) {
                        this.pathFindCurrentId -= 1; //We are far too far back, which means we got pushed there, reset stuff so we can reevaluate
                    }
                }
                if (ownerDistToNextNode <= nodeDistToNextNode) { //If unit is closer to the next node than current target is.
                    this.pathFindOffsetTowardsNextNode = false;
                    this.pathFindCurrentId += 1;
                }
            }
            point.updateToPoint(this.getPathfindingPoint(target, this.pathFindCurrentId, this.pathFindOffsetTowardsNextNode).recycle());
            this.target.updateToPoint(point);
            point.recycle();
        } else {
            this.target.updateToPoint(target);
            this.target.addOffset(this.offset);
        }
    }
    private applyDistanceDelay(dist: number, delay: number) {
        if (dist < this.pathFindFrequentDistance) delay /= 2;
        if (dist > this.pathFindSlowDistance) delay *= 2;
        if (dist > this.pathFindLudicrous || dist > this.pathFindCheckDist) delay *= 4;
        return delay;
    }
    getPathfindingPoint(target: Vector2, index: number, offsetTowardsNextNode: boolean) {
        if (!this.pathFindCurrent) return target.copy();
        let node = this.pathFindCurrent.getNode(index);
        if (node == null) {
            this.pathFindFollowing = false;
            return target.copy();
        }
        if (!offsetTowardsNextNode) {
            return node.getClosestPointWithBoundary(this.owner.getPosition(), this.owner.terrainCollisionSize * 1.5);
        }
        let nextNode = this.pathFindCurrent.getNode(index + 1);
        if (nextNode == null) return target.copy();

        let nextNodePos = nextNode.getClosestPointWithBoundary(this.owner.getPosition(), this.owner.terrainCollisionSize * 1.5);
        let currNodePos = node.getClosestPointWithBoundary(nextNodePos, this.owner.terrainCollisionSize * 1.5);
        nextNodePos.recycle();
        return currNodePos;
    }

    updatePathfinderData(target: Vector2) {
        let from = this.owner.getPosition().copy();
        let to = target.copy();

        if (this.pathFindCurrent != null) {
            let nodes = this.pathFindCurrent.path; // Fetch before destroy.
            this.pathFindCurrent.destroy();
            this.pathFindCurrent = this.pathfinder.find(from, to, nodes); //Recycle array
        } else {
            this.pathFindCurrent = this.pathfinder.find(from, to);
        }
        this.pathFindCurrentId = 0;
        this.pathFindOffsetTowardsNextNode = true;
        this.curving = this.getNewCurving();
        this.pathFindFollowing = true;
        this.pathFindUpdateDelayTime = 0;
        this.pathFindCheckDist = from.distanceTo(to) - 256;

        from.recycle();
        to.recycle();
    }
    evaluateToAttack(hero: CUnit) {
        if (!GameConfig.aiEnableAttack) return;

        let distanceToTarget = this.owner.getPosition().distanceTo(hero.getPosition());

        if (distanceToTarget <= this.attackRange) {
            this.attackDelay -= this.lastStepSize * GameConfig.timeScale;

            if (this.attackDelay <= 0 && !this.owner.isDisabledRotation()
                && !this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), hero.getPosition())
            ) {
                this.onAttack(hero);
                this.attackDelay = this.getNewAttackDelay();
                this.curving = this.getNewCurving();
            }
        }
    }

    updateOffset() {
        this.offset.updateTo(0, 0).polarProject(50, TreeMath.RandAngle());
    }
    doAngleReadjusting(target: Vector2, ang: number) {
        if (this.angleUpdateConst <= 0) {
            this.curving = this.getNewCurving();
            this.updateOffset();
            this.angleUpdateConst = 10;
        }
        this.angleUpdateConst -= this.lastStepSize;
    }
    getNewAttackDelay() {
        return GetRandomReal(0.2, 0.8);
    }
    getNewCurving() {
        if (this.pathFindFollowing) return this.getPathfindCurving();
        return GetRandomReal(-20, 20);
    }

    getPathfindCurving() {
        return GetRandomReal(-15, 15);
    }

    getNewEnemyTargetDelay(dist: number = this.pathFindDistance) {
        return this.applyDistanceDelay(dist, GetRandomReal(1, 1.25));
    }

    public cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
    }

    protected distanceToNextNode(initial: Vector2) {
        let ret = 0;
        if (this.pathFindCurrent) {
            let node = this.pathFindCurrent.getNode(this.pathFindCurrentId + 1);
            if (node != null) {
                let pp = node.getClosestPointWithBoundary(initial, this.owner.terrainCollisionSize * 1.25);
                ret = initial.distanceTo(pp);
                pp.recycle();
            }
        }
        return ret;
    }

    protected nodeDistanceToNextNode() {
        let ret = 0;
        if (this.pathFindCurrent) {
            let lastNode = this.pathFindCurrent.getNode(this.pathFindCurrentId);
            let node = this.pathFindCurrent.getNode(this.pathFindCurrentId + 1);
            if (lastNode != null && node != null) {
                let pp = node.getClosestPointWithBoundary(lastNode.point, this.owner.terrainCollisionSize * 1.5);
                let pp2 = lastNode.getClosestPointWithBoundary(node.point, this.owner.terrainCollisionSize * 1.5);
                ret = pp.distanceTo(pp2);
                pp.recycle();
                pp2.recycle();
            }
        }
        return ret;
    }

}