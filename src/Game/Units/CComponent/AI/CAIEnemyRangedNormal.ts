import {CUnit} from "../../CUnit/CUnit";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";
import {CComponentEnemyRangedArrow} from "../Attacks/CComponentEnemyRangedArrow";

export class CAIEnemyRangedNormal extends CAIEnemyGeneric {
    public minRange: number = 350;
    public maxRange: number = 700;

    public towards = true;
    public move: boolean = true;
    public moveUpdateConst: number = 2;

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.attackRange = 800;
    }

    execute(): void {

        this.yieldTimed(2);
        while (!this.owner.queueForRemoval) {
            let hero = CUnit.unitPool.getRandomAliveEnemy(this.owner);
            if (this.primaryTarget && !this.primaryTarget.isDead) {
                hero = this.primaryTarget;
            }
            this.updateOffset();
            this.attackDelay = 1;
            this.curving = this.getNewCurving();
            this.towards = true;

            while (hero != null && !hero.isDead && !this.owner.isDead) {
                this.calculateTargetPoint(hero);

                this.angle.updateToPoint(this.owner.position).offsetTo(this.target);

                let ang = this.angle.getAngleDegrees() + this.curving;
                this.doAngleReadjusting(hero, ang);

                if (!this.towards) ang += 180;
                this.angle.updateTo(0, 0).polarProject(1, ang);

                if (this.move && this.owner.position.distanceTo(this.target) > 10) {
                    this.owner.setAutoMoveData(this.angle);
                }
                this.evaluateToAttack(hero);
                this.aiYield();
            } //while
            this.aiYield();
        } //while
    }
    public getNewAttackDelay() {
        return GetRandomReal(1, 4);
    }
    public doAngleReadjusting(hero: CUnit, ang: number) {
        if (!this.towards && this.owner.position.distanceTo(hero.position) > this.maxRange) {
            this.towards = true;
            this.move = true;
            this.curving = this.getNewCurving();
        } else if (this.towards && this.owner.position.distanceTo(hero.position) < this.minRange) {
            this.towards = false;
            this.move = true;
            this.curving = this.getNewCurving();
        }
        if (this.moveUpdateConst <= 0) {
            this.move = (this.collisionMap.terrainRayCastIsHit(this.owner.position, hero.position, undefined, this.attackRange + 32)
                || this.owner.position.distanceTo(hero.position) < this.minRange
                || this.owner.position.distanceTo(hero.position) > this.maxRange);
            this.moveUpdateConst = 2;
        }
        this.moveUpdateConst -= this.lastYieldDuration;

        super.doAngleReadjusting(hero, ang);
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyRangedArrow(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
        ));
    }
}