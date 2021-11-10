import {CUnit} from "../../CUnit/CUnit";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";
import {CComponentEnemyRangedArrow} from "../Actions/Enemy/CComponentEnemyRangedArrow";

export class CAIEnemyRangedNormal extends CAIEnemyGeneric {
    public minRange: number = 350;
    public maxRange: number = 700;

    public towards = true;
    public moveUpdateConst: number = 2;

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.attackRange = 800;
    }

    public getNewAttackDelay() {
        return GetRandomReal(1, 3);
    }

    calculateAngleData(target: CUnit) {
        if (this.towards) this.angle.updateToPoint(this.owner.getPosition()).offsetTo(this.target);
        else this.angle.updateToPoint(this.target).offsetTo(this.owner.getPosition());

        let ang = this.angle.getAngleDegrees() + this.curving;
        this.doAngleReadjusting(target, ang);
        this.angle.updateTo(0, 0).polarProject(1, ang);
    }

    public doAngleReadjusting(hero: CUnit, ang: number) {
        if (!this.towards && this.owner.getPosition().distanceTo(hero.getPosition()) > this.maxRange) {
            this.towards = true;
            this.move = true;
            this.curving = this.getNewCurving();
        } else if (this.towards && this.owner.getPosition().distanceTo(hero.getPosition()) < this.minRange) {
            this.towards = false;
            this.move = true;
            this.curving = this.getNewCurving();
        }
        if (this.moveUpdateConst <= 0) {
            this.move = (this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), hero.getPosition(), undefined, this.attackRange + 32)
                || this.owner.getPosition().distanceTo(hero.getPosition()) < this.minRange
                || this.owner.getPosition().distanceTo(hero.getPosition()) > this.maxRange);
            this.moveUpdateConst = 2;
        }
        this.moveUpdateConst -= this.lastStepSize;
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyRangedArrow(this.owner,
            hero.getPosition()
        ));
    }
}