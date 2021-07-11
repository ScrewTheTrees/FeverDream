import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeSwing} from "../Attacks/CComponentEnemyMeleeSwing";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CCoroutineComponent} from "../CCoroutineComponent";

export class CComponentAIEnemyMelee extends CCoroutineComponent {
    removeOnDeath = false;
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);
    public primaryTarget: CUnit | undefined;

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner);
        this.primaryTarget = primaryTarget;
    }

    execute(): void {
        this.yieldTimed(2);
        let hero = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        if (this.primaryTarget && !this.primaryTarget.isDead) {
            hero = this.primaryTarget;
        }
        this.offset.updateTo(0, 0).polarProject(50, TreeMath.RandAngle());
        let atkDelay = GetRandomReal(0.1, 0.3);
        let curving = GetRandomReal(-20, 20);

        while (hero != null && !hero.isDead && !this.owner.isDead) {
            this.target.updateToPoint(hero.position).addOffset(this.offset);
            this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

            let ang = this.angle.getAngleDegrees() + curving;

            this.angle.x = 0;
            this.angle.y = 0;
            this.angle.polarProject(1, ang);


            if (this.owner.position.distanceTo(this.target) > 10) {
                this.owner.setAutoMoveData(this.angle);
            }
            if (this.owner.position.distanceTo(hero.position) < 100
                && !this.owner.isDominated()
            ) {
                if (atkDelay <= 0 && !this.owner.isDisabledMovement()) {
                    if (!this.owner.isDominated()) {
                        this.owner.addComponent(new CComponentEnemyMeleeSwing(this.owner,
                            this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
                        ));
                        atkDelay = GetRandomReal(0.2, 0.5);
                    }
                }
                if (atkDelay > 0) {
                    atkDelay -= this.timerDelay;
                }
            }
            this.yield();
        } //while

    }
    cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
    }
}