import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyRangedMagic} from "../Attacks/CComponentEnemyRangedMagic";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {CAIEnemyRangedNormal} from "./CAIEnemyRangedNormal";

export class CAIEnemyRangedKiting extends CAIEnemyRangedNormal {
    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.minRange = 500;
        this.maxRange = 900;
        this.attackRange = 1000;
        this.approachRange = 50;
    }

    execute(): void {
        if (!this.hasStarted()) return;
        if (!this.owner.queueForRemoval && this.hero != null && !this.hero.isDead && !this.owner.isDead) {
            this.calculateTarget(this.hero);

            this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

            let ang = this.angle.getAngleDegrees() + this.curving;
            this.doAngleReadjusting(this.hero, ang);

            if (!this.towards) ang += 180;
            this.angle.updateTo(0, 0).polarProject(1, ang);

            if (this.owner.position.distanceTo(this.target) > 10) {
                this.owner.setAutoMoveData(this.angle);
            }
            if (this.owner.position.distanceTo(this.hero.position) < this.attackRange
                && !this.owner.isDominated()
            ) {
                if (this.attackDelay <= 0 && !this.owner.isDisabledMovement()) {
                    if (!this.owner.isDominated()
                        && !this.pathfinder.terrainRayCastIsHit(this.owner.position, this.hero.position)) {
                        this.onAttack(this.hero);
                        this.attackDelay = this.getNewAttackDelay();
                        this.curving = this.getNewCurving();
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
            this.towards = true;
        }
    }

    public doAngleReadjusting(hero: CUnit, ang: number) {
        if (!this.towards && this.owner.position.distanceTo(hero.position) > this.maxRange) {
            this.towards = true;
            this.curving = this.getNewCurving();
        } else if (this.towards && this.owner.position.distanceTo(hero.position) < this.minRange) {
            this.towards = false;
            this.curving = this.getNewCurving();
        }
        if (this.angleUpdateConst <= 0) {
            this.curving = this.getNewCurving();
            this.updateOffset();
            this.angleUpdateConst = 10;
        }
        this.angleUpdateConst -= this.timeScale;
    }

    public getNewAttackDelay() {
        return GetRandomReal(2, 4);
    }
    public getNewCurving() {
        return ChooseOne(
            GetRandomReal(-60, -30),
            GetRandomReal(30, 60),
        );
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyRangedMagic(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
        ));
    }
}