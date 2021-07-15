import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeNormal} from "../Attacks/CComponentEnemyMeleeNormal";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";

export class CAIEnemyMelee extends CAIEnemyGeneric {

    public constructor(owner: CUnit, primaryTarget?: CUnit, scale?: number) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.projectileScale = scale;
    }

    execute(): void {
        if (!this.hasStarted()) return;
        if (!this.owner.queueForRemoval && this.hero != null && !this.hero.isDead && !this.owner.isDead) {
            this.calculateTarget(this.hero);

            this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

            let ang = this.angle.getAngleDegrees() + this.curving;
            this.doAngleReadjusting(this.hero, ang);

            this.angle.updateTo(0, 0).polarProject(1, ang);

            if (this.owner.position.distanceTo(this.target) > 10) {
                this.owner.setAutoMoveData(this.angle);
            }
            if (this.owner.position.distanceTo(this.hero.position) < this.attackRange
                && !this.owner.isDominated()
            ) {
                if (this.attackDelay <= 0 && !this.owner.isDisabledMovement()) {
                    if (!this.owner.isDominated()) {
                        this.onAttack(this.hero);
                        this.attackDelay = this.getNewAttackDelay();
                    }
                }
                if (this.attackDelay > 0) {
                    this.attackDelay -= this.timeScale;
                }
            }
        } else {
            this.hero = CUnit.unitPool.getRandomAliveEnemy(this.owner);
            if (this.primaryTarget && !this.primaryTarget.isDead) {
                this.hero = this.primaryTarget;
            }
            this.updateOffset();
            this.attackDelay = 1;
            this.curving = this.getNewCurving();
        }
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeNormal(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position),
            this.projectileScale
        ));
    }
}

