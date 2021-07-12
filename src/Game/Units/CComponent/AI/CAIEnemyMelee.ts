import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeNormal} from "../Attacks/CComponentEnemyMeleeNormal";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CCoroutineComponent} from "../CCoroutineComponent";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";

export class CAIEnemyMelee extends CCoroutineComponent {
    removeOnDeath = false;
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);
    public primaryTarget: CUnit | undefined;
    public scale: number | undefined;
    public attackRange: number = 100;
    public approachRange: number = 50;

    public constructor(owner: CUnit, primaryTarget?: CUnit,scale?: number) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.scale = scale;
    }

    execute(): void {
        this.yieldTimed(2);
        while (!this.owner.queueForRemoval) {
            let hero = CUnit.unitPool.getRandomAliveEnemy(this.owner);
            let curving = this.getNewCurving();
            if (this.primaryTarget && !this.primaryTarget.isDead) {
                hero = this.primaryTarget;
            }
            this.offset.updateTo(0, 0).polarProject(this.approachRange, TreeMath.RandAngle());
            let atkDelay = this.getNewAttackDelay();

            while (hero != null && !hero.isDead && !this.owner.isDead) {
                this.target.updateToPoint(hero.position).addOffset(this.offset);
                this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

                let ang = this.angle.getAngleDegrees() + curving;

                this.angle.updateTo(0,0).polarProject(1, ang);

                let walk =this.owner.position.copy().polarProject(this.owner.moveSpeed, ang);
                if (!PointWalkableChecker.getInstance().checkTerrainXY(walk.x, walk.y)) {
                    curving = this.getNewCurving();
                }
                walk.recycle();

                if (this.owner.position.distanceTo(this.target) > 10) {
                    this.owner.setAutoMoveData(this.angle);
                }
                if (this.owner.position.distanceTo(hero.position) < this.attackRange
                    && !this.owner.isDominated()
                ) {
                    if (atkDelay <= 0 && !this.owner.isDisabledMovement()) {
                        if (!this.owner.isDominated()) {
                            this.onAttack(hero);
                            atkDelay = this.getNewAttackDelay();
                        }
                    }
                    if (atkDelay > 0) {
                        atkDelay -= this.timerDelay;
                    }
                }
                this.yield();
            } //while
            this.yield();
        } //while

    }
    public getNewAttackDelay() {
        return GetRandomReal(0.2, 0.5);
    }
    public getNewCurving() {
        return GetRandomReal(-30, 30);
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeNormal(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position),
            this.scale
        ));
    }
    cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
    }
}

