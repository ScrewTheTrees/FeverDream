import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyRangedAttackSmall} from "../Attacks/CComponentEnemyRangedAttack";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";

export class CAIEnemyRangedKitingSmall extends CAIEnemyGeneric {
    public minRange: number = 500;
    public maxRange: number = 900;

    public towards = true;

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.attackRange = 1000;
        this.approachRange = 50;
    }

    execute(): void {
        this.yieldTimed(2);
        while (!this.owner.queueForRemoval) {
            let hero = CUnit.unitPool.getRandomAliveEnemy(this.owner);
            if (this.primaryTarget && !this.primaryTarget.isDead) {
                hero = this.primaryTarget;
            }
            this.updateOffset();
            this.atkDelay = 1;
            this.curving = this.getNewCurving();
            this.towards = true;

            while (hero != null && !hero.isDead && !this.owner.isDead) {
                this.calculateTarget(hero);

                this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

                let ang = this.angle.getAngleDegrees() + this.curving;
                this.doAngleReadjusting(hero, ang);


                if (!this.towards) ang += 180;
                this.angle.updateTo(0, 0).polarProject(1, ang);

                if (this.owner.position.distanceTo(this.target) > 10) {
                    this.owner.setAutoMoveData(this.angle);
                }
                if (this.owner.position.distanceTo(hero.position) < this.attackRange
                    && !this.owner.isDominated()
                ) {
                    if (this.atkDelay <= 0 && !this.owner.isDisabledMovement()) {
                        if (!this.owner.isDominated()
                            && !this.pathfinder.terrainRayCastIsHit(this.owner.position, hero.position)) {
                            this.onAttack(hero);
                            this.atkDelay = this.getNewAttackDelay();
                            this.curving = this.getNewCurving();
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
        this.owner.addComponent(new CComponentEnemyRangedAttackSmall(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
        ));
    }
}