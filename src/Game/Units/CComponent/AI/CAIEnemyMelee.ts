import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeNormal} from "../Attacks/CComponentEnemyMeleeNormal";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";

export class CAIEnemyMelee extends CAIEnemyGeneric {

    public constructor(owner: CUnit, primaryTarget?: CUnit, scale?: number) {
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
            this.atkDelay = this.getNewAttackDelay();
            this.updateOffset();

            while (hero != null && !hero.isDead && !this.owner.isDead) {
                this.calculateTarget(hero);

                this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

                let ang = this.angle.getAngleDegrees() + curving;

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
                        }
                    }
                    if (this.atkDelay > 0) {
                        this.atkDelay -= this.timeScale;
                    }
                }
                this.yield();
            } //while
            this.yield();
        } //while
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeNormal(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position),
            this.scale
        ));
    }
}

