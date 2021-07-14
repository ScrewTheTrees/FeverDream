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
    public scale: number | undefined;
    public attackRange: number = 100;
    public approachRange: number = 50;

    public constructor(owner: CUnit, primaryTarget?: CUnit, scale?: number) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.scale = scale;
    }

    public atkDelay = 1;
    public curving = this.getNewCurving();
    public angleUpdateConst = 1;

    public pathFindDistance: number = 1000;
    public pathFindFrequentDistance: number = 250;
    public pathfinder: BootlegPathfinding = BootlegPathfinding.getInstance();
    public currentPathDelay: number = GetRandomReal(0.4, 0.6);
    public untilSwitch: number = 0;
    public currentPath: Vector2[] = [];
    public currentPathId: number = 0;
    public followingPath: boolean = false;

    public calculateTarget(hero: CUnit) {
        let dist = this.owner.position.distanceTo(hero.position);
        if (dist > this.pathFindDistance || this.pathfinder.terrainRayCastIsHit(this.owner.position, hero.position)) {
            this.untilSwitch += this.timerDelay;
            if (this.untilSwitch >= (dist < this.pathFindFrequentDistance ? this.currentPathDelay / 2 : this.currentPathDelay)) {
                for (let v of this.currentPath) {
                    v.recycle();
                }
                let from = this.owner.position.copy().polarProject(16, this.owner.position.directionTo(hero.position));
                let to = hero.position.copy().addOffset(this.offset);
                this.currentPath = this.pathfinder.find(from, to).path;
                from.recycle();
                to.recycle();
                this.untilSwitch = 0;
                this.currentPathId = 0;
            }
            let point = this.currentPath[this.currentPathId];
            if (point == null) point = hero.position;
            if (this.owner.position.distanceTo(point) < 64) {
                this.currentPathId += 1;
            }
            this.followingPath = true;
        } else {
            this.followingPath = false;
        }
        if (this.followingPath) {
            let point = this.currentPath[this.currentPathId];
            if (point == null) point = hero.position;
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
        return GetRandomReal(0.2, 0.5);
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