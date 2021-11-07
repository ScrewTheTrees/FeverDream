import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeSlowLarge} from "../Actions/Enemy/CComponentEnemyMeleeSlowLarge";
import {CAIEnemyMelee} from "./CAIEnemyMelee";

export class CAIEnemyMeleeSlowLarge extends CAIEnemyMelee {

    public constructor(owner: CUnit, primaryTarget?: CUnit, scale?: number) {
        super(owner, primaryTarget, scale);
        this.attackRange = 150;
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeSlowLarge(this.owner,
            this.target.updateToPoint(this.owner.getPosition()).offsetTo(hero.getPosition())
        ));
    }
}