import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeNormal} from "../Actions/Enemy/CComponentEnemyMeleeNormal";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";

export class CAIEnemyMelee extends CAIEnemyGeneric {

    public constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner, primaryTarget);
    }

    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeNormal(this.owner,
            hero.getPosition()
        ));
    }
}

