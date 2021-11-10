import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeSlowLarge} from "../Actions/Enemy/CComponentEnemyMeleeSlowLarge";
import {CAIEnemyMelee} from "./CAIEnemyMelee";

export class CAIEnemyMeleeSlowLarge extends CAIEnemyMelee {

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner, primaryTarget);
        this.attackRange = 150;
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeSlowLarge(this.owner,
            hero.getPosition()
        ));
    }
}