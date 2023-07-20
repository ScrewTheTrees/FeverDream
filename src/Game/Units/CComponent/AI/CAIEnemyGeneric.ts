import {CStepComponent} from "../CStepComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {BootlegPathfinding} from "../../BootlegPathfinding";
import {BootlegCollisionMap} from "../../BootlegCollisionMap";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Frameworks/Pathfinder/PathfindResult";
import {RectangleNode} from "wc3-treelib/src/TreeLib/Frameworks/Pathfinder/Node";
import {GameConfig} from "../../../../GameConfig";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {EnemyWaypoint} from "./EnemyWaypoint";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";

export abstract class CAIEnemyGeneric extends CStepComponent {
    removeOnDeath = false;
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);

    public primaryTarget: CUnit | undefined;
    public currentTarget: CUnit | undefined;
    public closestEnemyTargetCheckDelay: number = 0.5;
    public closestEnemyDistanceCheck: number = 600;

    public attackRange: number = 100;
    public attackDelay: number;

    public approachRange: number = 50;
    public curving: number;
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
    public lostTargetRange: number = 1400;
    public lostTargetRandomTargetRange: number = 750;
    public lostTargetAlwaysVisibleRange: number = 128;
    public lostTargetMinVisionCone: number = 110;
    public lostTargetMaxVisionCone: number = 80;

    public guardPos: EnemyWaypoint[] | undefined;
    public guardRepeatPositions: boolean = false;
    public guardTimeSinceLastUpdate: number = 0;
    public guardLastPositionForever: boolean = true;
    public guardStateRangeFactor: number = 10;

    protected _isYielding = 0;
    public override timerYield(time: number) {
        this._isYielding = math.min(time, 100);
    }

    protected constructor(owner: CUnit, primaryTarget?: CUnit, timerDelay: number = 0.1) {
        super(owner, timerDelay);
        this.primaryTarget = primaryTarget;
        this.target.updateToPoint(this.owner.getPosition());

        this.curving = this.getNewCurving();
        this.attackDelay = this.getNewAttackDelay();

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

    public abstract onAttack(hero: CUnit): void;
    public abstract onAlerted(by: CUnit): void;

    evaluateNearbyTargetsForTargetSwitch(target: CUnit) {
        this.closestEnemyTargetCheckDelay -= this.lastStepSize;
        if (this.closestEnemyTargetCheckDelay <= 0) {
            let closest = CUnit.unitPool.getClosestAliveEnemy(this.owner.getPosition(), this.owner, this.closestEnemyDistanceCheck);
            if (closest) {
                let dist = this.owner.getPosition().distanceTo(closest.getPosition());
                if (dist <= this.closestEnemyDistanceCheck) {
                    if (this.canSeeTarget(target, dist)) {
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
            Quick.Clear(nodes);
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
    evaluateToAttack(target: CUnit) {
        if (!GameConfig.getInstance().aiEnableAttack) return;

        let distanceToTarget = this.owner.getPosition().distanceTo(target.getPosition());

        if (distanceToTarget <= this.attackRange) {
            this.attackDelay -= this.lastStepSize * GameConfig.getInstance().timeScale;

            if (this.attackDelay <= 0 && !this.owner.isDisabledRotation()
                && !this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), target.getPosition())
            ) {
                this.onAttack(target);
                this.attackDelay = this.getNewAttackDelay();
                this.curving = this.getNewCurving();
            }
        }
    }
    updateLostTargetData() {
        this.lostTargetTime += this.lastStepSize * GameConfig.getInstance().timeScale;
        if (this.currentTarget && this.owner.getPosition().distanceTo(this.currentTarget.getPosition()) <= this.lostTargetRange) {
            if (!this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), this.currentTarget.getPosition(), undefined, this.lostTargetRange)) {
                this.lostTargetTime = 0;
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
        return GetRandomReal(0.3, 0.8);
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

    queuePathfindingUpdate() {
        this.pathFindUpdateDelayTime = 100_000;
    }

    canSeeTarget(target: CUnit, maxRange: number = this.lostTargetRange, alwaysSeenRange: number = this.lostTargetAlwaysVisibleRange) {
        let dist = target.getPosition().distanceTo(this.owner.getPosition());

        if (dist <= alwaysSeenRange) {
            return true;
        }

        let degreeDiff = TreeMath.GetDegreeDifferenceAbs(this.owner.getPosition().directionTo(target.getPosition()), this.owner.logicAngle);
        let distDiff = dist / maxRange;
        let visionCone = Interpolation.Lerp(this.lostTargetMinVisionCone, this.lostTargetMaxVisionCone, distDiff);

        if (dist <= maxRange
            && degreeDiff <= visionCone
        ) {
            if (!this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), target.getPosition(), undefined, maxRange)) {
                return true;
            }
        }
        return false;
    }

    setGuardPosition(guardPos: EnemyWaypoint[] | undefined,
                     repeat: boolean = false,
                     guardLastPositionForever: boolean = true
    ) {
        this.guardPos = guardPos;
        this.guardRepeatPositions = repeat;
        this.guardLastPositionForever = guardLastPositionForever;
    }


    public cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();

        if (this.pathFindCurrent) this.pathFindCurrent.destroy();
        this.pathFindCurrent = undefined;
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

    private _checkArr: any[] = [];
    checkArr<T>(): T[] {
        Quick.Clear(this._checkArr);
        return this._checkArr;
    }

}