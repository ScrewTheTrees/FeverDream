import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {BootlegPathfinding} from "../../BootlegPathfinding";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {TreePromise} from "wc3-treelib/src/TreeLib/Utility/TreePromise";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Pathfinder/PathfindResult";
import {RectangleNode} from "wc3-treelib/src/TreeLib/Pathfinder/Node";
import {TreeThread} from "wc3-treelib/src/TreeLib/Utility/TreeThread";
import {Models} from "../../../Models";

export abstract class CAIEnemyGeneric extends CCoroutineComponent {
    removeOnDeath = false;
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);
    public primaryTarget: CUnit | undefined;
    public projectileScale: number | undefined;

    public attackRange: number = 100;
    public attackDelay = 1;

    public approachRange: number = 50;
    public curving = this.getNewCurving();
    public angleUpdateConst = 1;


    public pathfinder: BootlegPathfinding = BootlegPathfinding.getInstance();
    public pathFindDistance: number = 900;
    public pathFindFrequentDistance: number = 500;
    public pathFindSlowDistance: number = 1400;
    public pathFindLudicrous: number = 4000;
    public pathFindUpdateDelay: number = GetRandomReal(2, 2.5);
    public pathFindUpdateDelayTime: number = GetRandomReal(0, 1);
    public pathFindQuitDelay: number = GetRandomReal(9, 10);
    public pathFindCurrent?: PathfindResult<RectangleNode>;
    public pathFindCurrentId: number = 0;
    public pathFindFollowing: boolean = false;
    public pathFindCheckDist: number = math.maxinteger;
    public pathFindOffsetTowardsNextNode: boolean = true;
    public pathFindPromise: TreePromise<PathfindResult<RectangleNode>, TreeThread> = new TreePromise<PathfindResult<RectangleNode>, TreeThread>().fail("Init");

    protected constructor(owner: CUnit, primaryTarget?: CUnit, scale?: number) {
        super(owner, 0.02);
        this.primaryTarget = primaryTarget;
        this.projectileScale = scale;
        this.target.updateToPoint(this.owner.position);

        if (!this.primaryTarget) {
            this.primaryTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        }
        if (this.primaryTarget) {
            this.updatePathfinderData(this.primaryTarget);
        }

        TreeThread.RunUntilDone(() => {
            let gfx = AddSpecialEffect(Models.PROJECTILE_ENEMY_RANGED_MAGIC, 0, 0);
            while (!this.owner.isDead) {
                BlzSetSpecialEffectX(gfx, this.target.x);
                BlzSetSpecialEffectY(gfx, this.target.y);
                BlzSetSpecialEffectZ(gfx, this.target.getZ());
                coroutine.yield();
            }
            DestroyEffect(gfx);
        })
    }

    public calculateTargetPoint(hero: CUnit, ignoreDelay: boolean = false) {
        let dist = this.owner.position.distanceTo(hero.position);
        let delay = this.pathFindUpdateDelay;
        if (dist < this.pathFindFrequentDistance) delay /= 2;
        else if (dist > this.pathFindSlowDistance) delay *= 4;
        else if (dist > this.pathFindLudicrous || dist > this.pathFindCheckDist) delay *= 4;

        this.pathFindUpdateDelayTime += this.lastYieldDuration;
        if (ignoreDelay || this.pathFindPromise.isFinished) {
            if (ignoreDelay || this.pathFindUpdateDelayTime >= delay) {
                if (dist > this.pathFindDistance || this.pathfinder.terrainRayCastIsHit(this.owner.position, hero.position)) {
                    this.updatePathfinderData(hero);
                } else {
                    this.pathFindFollowing = false;
                    this.pathFindUpdateDelayTime = 0;
                    this.curving = this.getNewCurving();
                }
            }
        } else if (!this.pathFindPromise.isFinished) {
            if (this.pathFindUpdateDelayTime >= this.pathFindQuitDelay) {
                this.pathFindFollowing = false;
                this.pathFindUpdateDelayTime = 0;
                this.curving = this.getNewCurving();
                if (this.pathFindPromise.handler) this.pathFindPromise.handler.stop();
                this.pathFindPromise.fail("Searching Path for too long.");
            }
        }
        if (this.pathFindFollowing) {
            let point = this.getPathfindingPoint(hero, this.pathFindCurrentId, this.pathFindOffsetTowardsNextNode);
            let dist = this.owner.position.distanceTo(point);
            let ownerDistToNextNode = this.distanceToNextNode(this.owner.position);
            let nodeDistToNextNode = this.distanceToNextNode(point);// + this.owner.moveSpeed;

            if (!this.pathFindOffsetTowardsNextNode && dist <= 5) { //Enters a rectangle
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
            this.target.updateToPoint(hero.position).addOffset(this.offset);
        }
    }
    private getPathfindingPoint(hero: CUnit, index: number, offsetTowardsNextNode: boolean) {
        if (!this.pathFindCurrent) return hero.position.copy();
        let node = this.pathFindCurrent.getNode(index);
        if (node == null) return hero.position.copy();
        if (!offsetTowardsNextNode) {
            return node.getClosestPointWithBoundary(this.owner.position, this.owner.thiccness);
        }
        let nextNode = this.pathFindCurrent.getNode(index + 1);
        if (nextNode == null) return hero.position.copy();

        let nextNodePos = nextNode.getClosestPointWithBoundary(this.owner.position, this.owner.thiccness);
        let currNodePos = node.getClosestPointWithBoundary(nextNodePos, this.owner.thiccness);
        nextNodePos.recycle();
        return currNodePos;
    }

    private updatePathfinderData(hero: CUnit) {
        if (!this.pathFindPromise.isFinished) return;

        let from = this.owner.position.copy();
        let to = hero.position.copy();

        this.pathFindPromise = this.pathfinder.findAsync(from, to).then((result) => {
            this.pathFindCurrent = result;
            this.pathFindCurrentId = 0;
            this.pathFindOffsetTowardsNextNode = false;
            this.curving = this.getPathfindCurving();
            this.pathFindFollowing = true;
            this.pathFindUpdateDelayTime = 0;
            this.pathFindCheckDist = from.distanceTo(to) - 256;

            from.recycle();
            to.recycle();
        });
    }
    public evaluateToAttack(hero: CUnit) {
        if (this.owner.position.distanceTo(hero.position) < this.attackRange
            && !this.owner.isDominated()
        ) {
            if (this.attackDelay <= 0 && !this.owner.isDisabledMovement()) {
                if (!this.owner.isDominated()
                    && !this.pathfinder.terrainRayCastIsHit(this.owner.position, hero.position)) {
                    this.onAttack(hero);
                    this.attackDelay = this.getNewAttackDelay();
                    this.curving = this.getNewCurving();
                }
            }
            if (this.attackDelay > 0) {
                this.attackDelay -= this.lastYieldDuration;
            }
        }
    }
    public abstract onAttack(hero: CUnit): void;

    public updateOffset() {
        this.offset.updateTo(0, 0).polarProject(50, TreeMath.RandAngle());
    }
    public doAngleReadjusting(hero: CUnit, ang: number) {
        if (this.angleUpdateConst <= 0) {
            this.curving = this.getNewCurving();
            this.updateOffset();
            this.angleUpdateConst = 10;
        }
        this.angleUpdateConst -= this.lastYieldDuration;
    }
    public aiYield() {
        this.yieldTimed(GetRandomReal(0.08, 0.12));
    }
    public getNewAttackDelay() {
        return GetRandomReal(0.2, 0.8);
    }
    public getNewCurving() {
        return GetRandomReal(-20, 20);
    }

    public getPathfindCurving() {
        return GetRandomReal(-20, 20);
    }

    public cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
        if (this.pathFindPromise.handler) this.pathFindPromise.handler.stop();
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