import {CUnit} from "../../../CUnit/CUnit";
import {CComponentEnemyMeleeSlowLarge} from "../../Actions/Enemy/CComponentEnemyMeleeSlowLarge";
import {CAIEnemyWaypoint} from "./CAIEnemyWaypoint";
import {EnemyWaypoint} from "./EnemyWaypoint";

export class CAIEnemyMeleeSlowLargeWaypoint extends CAIEnemyWaypoint {

    public constructor(owner: CUnit, guardPos: EnemyWaypoint[]) {
        super(owner, guardPos);
        this.attackRange = 150;
    }
    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeSlowLarge(this.owner,
            hero.getPosition()
        ));
    }
}