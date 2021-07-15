import {CCoroutineComponent} from "../CCoroutineComponent";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../CUnit/CUnit";
import {BootlegPathfinding} from "../../BootlegPathfinding";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";

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
    public pathFindDistance: number = 1000;
    public pathFindFrequentDistance: number = 400;
    public pathFindUpdateDelay: number = GetRandomReal(2.3, 2.7);
    public pathFindUpdateDelayTime: number = 0;
    public pathFindCurrent: Vector2[] = [];
    public pathFindCurrentId: number = 0;
    public pathFindFollowing: boolean = false;

    public constructor(owner: CUnit, primaryTarget?: CUnit, scale?: number) {
        super(owner, 0.05);
        this.primaryTarget = primaryTarget;
        this.projectileScale = scale;
    }

    public calculateTarget(hero: CUnit) {
        let dist = this.owner.position.distanceTo(hero.position);
        this.pathFindUpdateDelayTime += this.timerDelay;
        if (this.pathFindUpdateDelayTime >= (dist < this.pathFindFrequentDistance ? this.pathFindUpdateDelay / 2 : this.pathFindUpdateDelay)) {
            if (dist > this.pathFindDistance || this.pathfinder.terrainRayCastIsHit(this.owner.position, hero.position)) {
                let from = this.owner.position.copy();
                let to = hero.position.copy().addOffset(this.offset);
                if (this.pathFindFollowing) to.polarProject(32, this.angle.getAngleDegrees());
                else to.polarProject(32, this.owner.position.directionTo(hero.position));
                this.pathfinder.find(from, to, (result) => {
                    for (let v of this.pathFindCurrent) {
                        v.recycle();
                    }
                    this.pathFindCurrent = result.path;
                    this.pathFindCurrentId = 0;
                    this.curving = GetRandomReal(-10, 10);
                    this.pathFindFollowing = true;
                });
                this.pathFindUpdateDelayTime = 0;
                from.recycle();
                to.recycle();

            } else {
                this.pathFindFollowing = false;
            }
        }
        if (this.pathFindFollowing) {
            let point = this.pathFindCurrent[this.pathFindCurrentId];
            if (point == null) point = hero.position;
            if (this.owner.position.distanceTo(point) < 40) {
                this.pathFindCurrentId += 1;
                point = this.pathFindCurrent[this.pathFindCurrentId];
                if (point == null) point = hero.position;
            }
            this.target.updateToPoint(point);
        } else {
            this.target.updateToPoint(hero.position).addOffset(this.offset);
        }
    }

    public updateOffset() {
        this.offset.updateTo(0, 0).polarProject(50, TreeMath.RandAngle());
    }
    public doAngleReadjusting(hero: CUnit, ang: number) {
        if (this.angleUpdateConst <= 0) {
            this.curving = this.getNewCurving();
            this.updateOffset();
            this.angleUpdateConst = 10;
        }
        this.angleUpdateConst -= this.timeScale;
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