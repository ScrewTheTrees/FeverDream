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
            let atkDelay = 1;
            let curving = this.getNewCurving();
            let towards = true;

            while (hero != null && !hero.isDead && !this.owner.isDead) {
                if (!towards && this.owner.position.distanceTo(hero.position) > this.maxRange) {
                    towards = true;
                    curving = this.getNewCurving();
                } else if (towards && this.owner.position.distanceTo(hero.position) < this.minRange) {
                    towards = false;
                    curving = this.getNewCurving();
                }

                this.target.updateToPoint(hero.position).addOffset(this.offset);
                this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

                let ang = this.angle.getAngleDegrees() + curving;
                if (!towards) ang += 180;

                this.angle.updateTo(0,0).polarProject(1, ang);

                let walk =this.owner.position.copy().polarProject(this.owner.moveSpeed, ang);
                if (!PointWalkableChecker.getInstance().checkTerrainXY(walk.x, walk.y)) {
                    curving = this.getNewCurving()
                    towards = !towards;
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
                            curving = this.getNewCurving();
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