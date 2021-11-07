import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyRangedMagic} from "../Actions/Enemy/CComponentEnemyRangedMagic";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {CAIEnemyRangedNormal} from "./CAIEnemyRangedNormal";

export class CAIEnemyRangedKiting extends CAIEnemyRangedNormal {

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner);
        this.primaryTarget = primaryTarget;
        this.minRange = 400;
        this.maxRange = 800;
        this.attackRange = 1000;
        this.approachRange = 50;
    }

    public doAngleReadjusting(hero: CUnit, ang: number) {
        if (!this.towards && this.owner.getPosition().distanceTo(hero.getPosition()) > this.maxRange) {
            this.towards = true;
            this.curving = this.getNewCurving();
        } else if (this.towards && this.owner.getPosition().distanceTo(hero.getPosition()) < this.minRange) {
            this.towards = false;
            this.curving = this.getNewCurving();
        }
        if (this.angleUpdateConst <= 0) {
            this.curving = this.getNewCurving();
            this.updateOffset();
            this.angleUpdateConst = 10;
        }
        this.move = true;
        this.angleUpdateConst -= this.lastStepSize;
    }

    public getNewAttackDelay() {
        return GetRandomReal(2, 4);
    }
    public getNewCurving() {
        if (this.pathFindFollowing) return this.getPathfindCurving();
        return ChooseOne(
            GetRandomReal(-70, -40),
            GetRandomReal(40, 70),
        );
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyRangedMagic(this.owner,
            this.target.updateToPoint(this.owner.getPosition()).offsetTo(hero.getPosition())
        ));
    }
}