import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {BootlegPathfinding} from "../../BootlegPathfinding";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {TreePromise} from "wc3-treelib/src/TreeLib/Utility/TreePromise";
import {PathfindResult} from "wc3-treelib/src/TreeLib/Pathfinder/PathfindResult";
import {Rectangle} from "wc3-treelib/src/TreeLib/Utility/Data/Rectangle";
import { Node } from "wc3-treelib/src/TreeLib/Pathfinder/Node";

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
    public pathFindSlowDistance: number = 1200;
    public pathFindUpdateDelay: number = GetRandomReal(2, 2.5);
    public pathFindUpdateDelayTime: number = 0;
    public pathFindCurrent: Node[] = [];
    public pathFindCurrentId: number = 0;
    public pathFindFollowing: boolean = false;
    public pathFindPromise: TreePromise<PathfindResult> = new TreePromise<PathfindResult>().fail("Init");

    protected constructor(owner: CUnit, primaryTarget?: CUnit, scale?: number) {
        super(owner, 0.02);
        this.primaryTarget = primaryTarget;
        this.projectileScale = scale;
        this.target.updateToPoint(this.owner.position);

        if (!this.primaryTarget) {
            this.primaryTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        }
    }

    public calculateTargetPoint(hero: CUnit, ignoreDelay: boolean = false) {
        let dist = this.owner.position.distanceTo(hero.position);
        let delay = this.pathFindUpdateDelay;
        if (dist < this.pathFindFrequentDistance) delay /= 3;
        else if (dist > this.pathFindSlowDistance) delay *= 3;

        if (ignoreDelay || this.pathFindPromise.isFinished) {
            this.pathFindUpdateDelayTime += this.lastYieldDuration;
            if (ignoreDelay || this.pathFindUpdateDelayTime >= delay) {
                if (dist > this.pathFindDistance || this.pathfinder.terrainRayCastIsHit(this.owner.position, hero.position)) {
                    this.updatePathfinderData(hero);
                } else {
                    this.pathFindFollowing = false;
                    this.pathFindUpdateDelayTime = 0;
                }
            }
        }
        if (this.pathFindFollowing) {
            let point = this.pathFindCurrent[this.pathFindCurrentId] ? this.pathFindCurrent[this.pathFindCurrentId].point : hero.position;
            let pointRect = Rectangle.new(point.x - 32, point.y - 32, point.x + 32, point.y + 32);
            const re = pointRect.closestPointInsideWithBoundary(this.owner.position, this.owner.collisionSize);
            point = re;
            if (this.owner.position.distanceTo(point) <= 2) {
                this.pathFindCurrentId += 1;
                point = this.pathFindCurrent[this.pathFindCurrentId] ? this.pathFindCurrent[this.pathFindCurrentId].point : hero.position;
                if (point == null) point = hero.position;
            }
            this.target.updateToPoint(point);
            re.recycle();
            pointRect.recycle();
        } else {
            this.target.updateToPoint(hero.position).addOffset(this.offset);
        }
    }
    private updatePathfinderData(hero: CUnit) {
        if (!this.pathFindPromise.isFinished) return;

        let from = this.owner.position.copy();
        let to = hero.position.copy();

        this.pathFindPromise = this.pathfinder.findAsync(from, to).then((result) => {
            this.pathFindCurrent = result.path;
            this.pathFindCurrentId = 1;
            this.curving = this.getNewCurving();
            this.pathFindFollowing = true;
            this.pathFindUpdateDelayTime = 0;

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

    public cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
    }
}