import {CUnit} from "../../../CUnit/CUnit";
import {GameConfig} from "../../../../../GameConfig";
import {CAIEnemyGeneric} from "../CAIEnemyGeneric";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {EnemyWaypoint} from "./EnemyWaypoint";
import {AIState} from "../AIState";


export abstract class CAIEnemyWaypoint extends CAIEnemyGeneric {

    public guardPos: EnemyWaypoint[];
    public guardRepeatPositions: boolean;
    public guardTimeSinceLastUpdate: number = 0;
    public guardLastPositionForever: boolean = true;

    constructor(owner: CUnit, guardPos: EnemyWaypoint[] = [new EnemyWaypoint(owner.getPosition())], repeat: boolean = false) {
        super(owner);
        this.guardPos = guardPos;
        this.guardRepeatPositions = repeat;
    }

    handleIdleState() {
        //It's gonna find a valid nearby target eventually.
        this.currentTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        if (this.currentTarget.getPosition().distanceTo(this.owner.getPosition()) <= this.lostTargetRange) {
            if (!this.collisionMap.terrainRayCastIsHit(this.owner.getPosition(), this.currentTarget.getPosition(), 64, this.lostTargetRange)) {
                this.aiState = AIState.LOOKING_FOR_TARGET;
                this.owner.alertNearbyAllies(this.currentTarget);
            }
        }
        let currentPos = this.guardPos[0];
        if (currentPos) {
            this.guardTimeSinceLastUpdate += this.lastStepSize * GameConfig.timeScale;

            if (this.owner.getPosition().distanceTo(currentPos.position) <= (this.owner.getActualMoveSpeed() * 50)) {
                this.move = false;
                this.owner.setAutoMoveData(this.angle, 0);

                if (this.guardPos.length >= 1) {
                    if (currentPos.moveInstantlyOnReach ||
                        this.guardTimeSinceLastUpdate >= currentPos.durationBeforeUpdate) {

                        if (!this.guardLastPositionForever || this.guardPos.length >= 2) {
                            let pos = Quick.SliceOrdered(this.guardPos, 0);
                            if (this.guardRepeatPositions) Quick.Push(this.guardPos, pos);

                            this.pathFindUpdateDelayTime = math.maxinteger;
                        }

                        this.guardTimeSinceLastUpdate = 0;
                    }
                }
            } else {
                this.move = true;
            }

            if (GameConfig.aiEnableTargetPointCalculations) {
                this.calculateTargetPoint(currentPos.position);
                this.calculateAngleData(currentPos.position);
            }

            if (this.move && GameConfig.aiEnableMove) {
                this.owner.setAutoMoveData(this.angle, 1);
            }
        }
    }
}