import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeSlowLarge} from "../Attacks/CComponentEnemyMeleeSlowLarge";
import {CAIEnemyMelee} from "./CAIEnemyMelee";

export class CAIEnemyMeleeSlowLarge extends CAIEnemyMelee {
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeSlowLarge(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
        ));
        this.attackRange = 150;
    }
}