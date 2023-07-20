import {CUnit} from "../../CUnit/CUnit";
import {CAIStateEnemyGeneric} from "./CAIStateEnemyGeneric";
import {CComponentEnemyRangedArrow} from "../Actions/Enemy/CComponentEnemyRangedArrow";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";

export class CAIEnemyRangedNormal extends CAIStateEnemyGeneric {
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
        return GetRandomReal(1.5, 2.5);
    }

    calculateAngleData(target: Vector2) {
        if (this.towards) this.angle.updateToPoint(this.owner.getPosition()).offsetTo(this.target);
        else this.angle.updateToPoint(this.target).offsetTo(this.owner.getPosition());

        let ang = this.angle.getAngleDegrees() + this.curving;
        this.doAngleReadjusting(target, ang);
        this.angle.updateTo(0, 0).polarProject(1, ang);
    }

    public doAngleReadjusting(target: Vector2, ang: number) {
        if (!this.towards && this.owner.getPosition().distanceTo(target) > this.maxRange) {
            this.towards = true;
            this.move = true;
            this.curving = this.getNewCurving();
        } else if (this.towards && this.owner.getPosition().distanceTo(target) < this.minRange) {
            this.towards = false;
            this.move = true;
            this.curving = this.getNewCurving();
        } else {
            this.move = false;
        }
        if (this.moveUpdateConst <= 0) {
            this.move = (this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), target, undefined, this.attackRange)
                || this.owner.getPosition().distanceTo(target) < this.minRange
                || this.owner.getPosition().distanceTo(target) > this.maxRange);
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