import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {BootlegPathfinding} from "../../BootlegPathfinding";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Pathfinder/PathfindResult";
import {RectangleNode} from "wc3-treelib/src/TreeLib/Pathfinder/Node";
import {BootlegCollisionMap} from "../../BootlegCollisionMap";
import {CStepComponent} from "../CStepComponent";
import {AIState, AIStateToString} from "./AIState";

export abstract class CAIEnemyGeneric extends CStepComponent {
    removeOnDeath = false;
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);
    public aiState = AIState.SPAWNING;

    public primaryTarget: CUnit | undefined;
    public currentTarget: CUnit | undefined;
    public closestEnemyTargetCheckDelay: number = this.getNewEnemyTargetDelay();
    public closestEnemyDistanceCheck: number = 600;

    public attackRange: number = 100;
    public attackDelay = this.getNewAttackDelay();

    public approachRange: number = 50;
    public curving = this.getNewCurving();
    public angleUpdateConst = 1;
    public move: boolean = true;

    public pathfinder: BootlegPathfinding = BootlegPathfinding.getInstance();
    public collisionMap: BootlegCollisionMap = BootlegCollisionMap.getInstance();
    public pathFindDistance: number = 900;
    public pathFindFrequentDistance: number = 500;
    public pathFindSlowDistance: number = 1400;
    public pathFindLudicrous: number = 4000;
    public pathFindUpdateDelay: number = GetRandomReal(2, 2.5);
    public pathFindUpdateDelayTime: number = GetRandomReal(0, 1);
    public pathFindCurrent?: PathfindResult<RectangleNode>;
    public pathFindCurrentId: number = 0;
    public pathFindFollowing: boolean = false;
    public pathFindCheckDist: number = math.maxinteger;
    public pathFindOffsetTowardsNextNode: boolean = true;

    protected constructor(owner: CUnit, primaryTarget?: CUnit, timerDelay?: number) {
        super(owner, timerDelay);
        this.primaryTarget = primaryTarget;
        this.target.updateToPoint(this.owner.getPosition());

        if (!this.primaryTarget) {
            this.primaryTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        }
        if (this.primaryTarget) {
            this.updatePathfinderData(this.primaryTarget);
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

    public abstract onAttack(hero: CUnit): void;


    step(): void {
        if (this.owner.isDead) this.aiState = AIState.DEAD;

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
        }
    }

    handleSpawningState() {
        this.aiState = AIState.IDLE;
        this.timerYield(2.5);
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
            return;
        }
        this.timerYield(1);
    }
    handleChasingState() {
        if (this.currentTarget == null || this.currentTarget.isDead) {
            this.aiState = AIState.IDLE;
            return;
        }
        if (this.owner.isDominated()) return; //Do nothing if dominated.

        this.currentTarget = this.calculateCurrentTarget(this.currentTarget);

        this.calculateTargetPoint(this.currentTarget);
        this.calculateAngleData(this.currentTarget);

        if (this.move) {
            this.owner.setAutoMoveData(this.angle, 1);
        }
        this.evaluateToAttack(this.currentTarget);
    }

    calculateCurrentTarget(target: CUnit) {
        this.closestEnemyTargetCheckDelay -= this.lastStepSize;
        if (this.closestEnemyTargetCheckDelay <= 0) {
            if (this.primaryTarget != null && !this.primaryTarget.isDead) target = this.primaryTarget;

            let closest = CUnit.unitPool.getClosestAliveEnemy(this.owner.getPosition(), this.owner, this.closestEnemyDistanceCheck);
            if (closest) {
                let dist = this.owner.getPosition().distanceTo(closest!.getPosition());
                if (dist <= this.closestEnemyDistanceCheck) {
                    if (!this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), target.getPosition(), 32, dist)) {
                        this.pathFindFollowing = false;
                        target = closest;
                    }
                }
            }
            this.closestEnemyTargetCheckDelay = this.getNewEnemyTargetDelay();
        }
        return target;
    }
    calculateAngleData(target: CUnit) {
        this.angle.updateToPoint(this.owner.getPosition()).offsetTo(this.target);

        let ang = this.angle.getAngleDegrees() + this.curving;
        this.doAngleReadjusting(target, ang);
        this.angle.updateTo(0, 0).polarProject(1, ang);
    }

    calculateTargetPoint(hero: CUnit, ignoreDelay: boolean = false) {
        let dist = this.owner.getPosition().distanceTo(hero.getPosition());
        let delay = this.pathFindUpdateDelay;
        if (dist < this.pathFindFrequentDistance) delay /= 2;
        if (dist > this.pathFindSlowDistance) delay *= 4;
        if (dist > this.pathFindLudicrous || dist > this.pathFindCheckDist) delay *= 4;

        this.pathFindUpdateDelayTime += this.lastStepSize;
        if (ignoreDelay || this.pathFindUpdateDelayTime >= delay) {
            if (dist > this.pathFindDistance || this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), hero.getPosition())) {
                this.updatePathfinderData(hero);
            } else {
                this.pathFindFollowing = false;
                this.curving = this.getNewCurving();
            }
        }
        if (this.pathFindFollowing && this.pathFindCurrent) {
            let previousNode = this.pathFindCurrent.getNode(this.pathFindCurrentId - 1);
            if (previousNode) {
                if (previousNode.isInsideNode(this.owner.getPosition())) {
                    this.pathFindCurrentId -= 1; //We are in the previous node, means we got pushed there, reset stuff.
                }
            }
            let point = this.getPathfindingPoint(hero, this.pathFindCurrentId, this.pathFindOffsetTowardsNextNode);
            let dist = this.owner.getPosition().distanceTo(point);
            let ownerDistToNextNode = this.distanceToNextNode(this.owner.getPosition());
            let nodeDistToNextNode = this.distanceToNextNode(point);// + this.owner.moveSpeed;

            if (!this.pathFindOffsetTowardsNextNode && dist <= 10) { //Enters a rectangle
                this.pathFindOffsetTowardsNextNode = true;
            } else if (this.pathFindOffsetTowardsNextNode) { //Enters exit of rectangle
                if (ownerDistToNextNode <= nodeDistToNextNode) { //If unit is closer to the next node than current target is.
                    this.pathFindOffsetTowardsNextNode = false;
                    this.pathFindCurrentId += 1;
                }
            }
            point.recycle();
            point = this.getPathfindingPoint(hero, this.pathFindCurrentId, this.pathFindOffsetTowardsNextNode);
            this.target.updateToPoint(point);
            point.recycle();
        } else {
            this.target.updateToPoint(hero.getPosition()).addOffset(this.offset);
        }
    }
    getPathfindingPoint(hero: CUnit, index: number, offsetTowardsNextNode: boolean) {
        if (!this.pathFindCurrent) return hero.getPosition().copy();
        let node = this.pathFindCurrent.getNode(index);
        if (node == null) {
            this.pathFindFollowing = false;
            return hero.getPosition().copy();
        }
        if (!offsetTowardsNextNode) {
            return node.getClosestPointWithBoundary(this.owner.getPosition(), this.owner.thiccness * 1.2);
        }
        let nextNode = this.pathFindCurrent.getNode(index + 1);
        if (nextNode == null) return hero.getPosition().copy();

        let nextNodePos = nextNode.getClosestPointWithBoundary(this.owner.getPosition(), this.owner.thiccness * 1.2);
        let currNodePos = node.getClosestPointWithBoundary(nextNodePos, this.owner.thiccness * 1.2);
        nextNodePos.recycle();
        return currNodePos;
    }

    updatePathfinderData(hero: CUnit) {
        let from = this.owner.getPosition().copy();
        let to = hero.getPosition().copy();

        this.pathFindCurrent = this.pathfinder.find(from, to);
        this.pathFindCurrentId = 0;
        this.pathFindOffsetTowardsNextNode = false;
        this.curving = this.getNewCurving();
        this.pathFindFollowing = true;
        this.pathFindUpdateDelayTime = 0;
        this.pathFindCheckDist = from.distanceTo(to) - 256;

        from.recycle();
        to.recycle();
    }
    evaluateToAttack(hero: CUnit) {
        let distanceToTarget = this.owner.getPosition().distanceTo(hero.getPosition());

        if (distanceToTarget <= this.attackRange) {
            this.attackDelay -= this.lastStepSize;

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
    doAngleReadjusting(hero: CUnit, ang: number) {
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

    getNewEnemyTargetDelay() {
        return GetRandomReal(0.75, 1.25);
    }

    public cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
    }
    private distanceToNextNode(initial: Vector2) {
        if (this.pathFindCurrent) {
            let node = this.pathFindCurrent.getNode(this.pathFindCurrentId + 1);
            if (node != null) {
                let pp = node.getClosestPointWithBoundary(initial, this.owner.thiccness);
                initial.distanceTo(pp);
            }
        }
        return initial.distanceTo(initial);
    }

}