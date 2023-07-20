import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeNormal} from "../Actions/Enemy/CComponentEnemyMeleeNormal";
import {CAIStateEnemyGeneric} from "./CAIStateEnemyGeneric";

export class CAIEnemyMelee extends CAIStateEnemyGeneric {

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner, primaryTarget);
    }

    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeNormal(this.owner,
            hero.getPosition()
        ));
    }
}

