import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeSwing} from "../Attacks/CComponentEnemyMeleeSwing";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CCoroutineComponent} from "../CCoroutineComponent";

export class CComponentAIEnemyMelee extends CCoroutineComponent {
    public target = Vector2.new(0, 0);
    public offset = Vector2.new(0, 0);
    public angle = Vector2.new(0, 0);

    public constructor(owner: CUnit) {
        super(owner);
    }

    execute(): void {
        this.yieldTimed(2);
        let hero = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        this.offset.updateTo(0, 0).polarProject(50, TreeMath.RandAngle());
        let atkDelay = 0.2;
        let curving = GetRandomReal(-40, 40);

        while (!this.owner.queueForRemoval && hero != null && !hero.isDead) {
            this.target.updateToPoint(hero.position).addOffset(this.offset);
            this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

            let ang = this.angle.getAngleDegrees() + curving;

            this.angle.x = 0;
            this.angle.y = 0;
            this.angle.polarProject(1, ang);


            if (this.owner.position.distanceTo(this.target) > 10) {
                this.owner.setAutoMoveData(this.angle);
            }

            if (atkDelay <= 0
                && this.owner.disableMovement <= 0
                && this.owner.position.distanceTo(hero.position) < 100
            ) {
                if (!this.owner.isDominated()) {
                    this.owner.addComponent(new CComponentEnemyMeleeSwing(this.owner,
                        this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
                    ));
                    atkDelay = GetRandomReal(0.4, 1.2);
                }
            }
            if (!this.owner.isDominated() && atkDelay > 0) {
                atkDelay -= this.timerDelay;
            }
            this.yield();
        }

    }
    cleanup(): void {
        this.offset.recycle();
        this.target.recycle();
        this.angle.recycle();
    }
}