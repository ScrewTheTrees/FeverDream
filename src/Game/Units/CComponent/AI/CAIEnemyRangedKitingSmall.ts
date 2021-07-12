import {CUnit} from "../../CUnit/CUnit";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CCoroutineComponent} from "../CCoroutineComponent";
import {CComponentEnemyRangedAttackSmall} from "../Attacks/CComponentEnemyRangedAttack";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";

export class CAIEnemyRangedKitingSmall extends CCoroutineComponent {
    removeOnDeath = false;
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);
    public primaryTarget: CUnit | undefined;

    public minRange: number = 500;
    public maxRange: number = 900;
    public attackRange: number = 1000;

    public atkDelay = 1;
    public curving = this.getNewCurving();
    public angleUpdate = 1;
    public towards = true;

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner);
        this.primaryTarget = primaryTarget;
    }

    execute(): void {
        this.yieldTimed(2);
        while (!this.owner.queueForRemoval) {
            let hero = CUnit.unitPool.getRandomAliveEnemy(this.owner);
            if (this.primaryTarget && !this.primaryTarget.isDead) {
                hero = this.primaryTarget;
            }
            this.offset.updateTo(0, 0).polarProject(50, TreeMath.RandAngle());
            this.atkDelay = 1;
            this.curving = this.getNewCurving();
            this.angleUpdate = 1;
            this.towards = true;

            while (hero != null && !hero.isDead && !this.owner.isDead) {
                this.target.updateToPoint(hero.position).addOffset(this.offset);
                this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

                let ang = this.angle.getAngleDegrees() + this.curving;
                if (!this.towards) ang += 180;

                this.angle.updateTo(0, 0).polarProject(1, ang);
                this.doAngleReadjusting(hero, ang);

                if (this.owner.position.distanceTo(this.target) > 10) {
                    this.owner.setAutoMoveData(this.angle);
                }
                if (this.owner.position.distanceTo(hero.position) < this.attackRange
                    && !this.owner.isDominated()
                ) {
                    if (this.atkDelay <= 0 && !this.owner.isDisabledMovement()) {
                        if (!this.owner.isDominated()) {
                            this.onAttack(hero);
                            this.atkDelay = this.getNewAttackDelay();
                            this.curving = this.getNewCurving();
                        }
                    }
                    if (this.atkDelay > 0) {
                        this.atkDelay -= this.timerDelay;
                    }
                }
                this.yield();
            } //while
            this.yield();
        } //while

    }
    private doAngleReadjusting(hero: CUnit, ang: number) {
        if (this.angleUpdate <= 0) {
            if (!this.towards && this.owner.position.distanceTo(hero.position) > this.maxRange) {
                this.towards = true;
                this.curving = this.getNewCurving();
            } else if (this.towards && this.owner.position.distanceTo(hero.position) < this.minRange) {
                this.towards = false;
                this.curving = this.getNewCurving();
            }
            let walk = this.owner.position.copy().polarProject(this.owner.moveSpeed, ang);
            if (!PointWalkableChecker.getInstance().checkTerrainXY(walk.x, walk.y)) {
                this.curving = this.getNewCurving();
                this.towards = !this.towards;
            }
            walk.recycle();
            this.angleUpdate = 2;
        }
        this.angleUpdate -= this.timerDelay;
    }

    public getNewAttackDelay() {
        return GetRandomReal(2, 4);
    }
    public getNewCurving() {
        return ChooseOne(
            GetRandomReal(-30, -60),
            GetRandomReal(30, 60),
        );
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyRangedAttackSmall(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
        ));
    }
    cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
    }
}