import {CUnit} from "../../CUnit/CUnit";
import {CComponentEnemyMeleeNormal} from "../Actions/Enemy/CComponentEnemyMeleeNormal";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";

export class CAIEnemyMelee extends CAIEnemyGeneric {

    public constructor(owner: CUnit, primaryTarget?: CUnit, timerDelay: number = 0.1) {
        super(owner, primaryTarget, timerDelay);
    }

    public onAttack(hero: CUnit) {
        this.owner.addComponent(new CComponentEnemyMeleeNormal(this.owner,
            this.target.updateToPoint(this.owner.position).offsetTo(hero.position)
        ));
    }
}

