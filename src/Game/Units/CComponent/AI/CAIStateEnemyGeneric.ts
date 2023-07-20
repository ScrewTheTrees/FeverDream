import {CUnit} from "../../CUnit/CUnit";
import {AIState} from "./AIState";
import {GameConfig} from "../../../../GameConfig";
import {CAIEnemyGeneric} from "./CAIEnemyGeneric";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {TreeMath} from "wc3-treelib/src/TreeLib/Utility/TreeMath";

/**
 * Implementation of a state machine for the enemy AI, handling step logic.
 * Generally this is the one to use while the generic one can be used by anything.
 */
export abstract class CAIStateEnemyGeneric extends CAIEnemyGeneric {

    public aiState = AIState.SPAWNING;

    protected constructor(owner: CUnit, primaryTarget?: CUnit) {
        super(owner, primaryTarget);
    }

    public abstract onAttack(hero: CUnit): void;

    onAlerted(by: CUnit) {
        if (!this.isAiState(AIState.CHASING)) {
            this.setAiState(AIState.LOOKING_FOR_TARGET);
            this.currentTarget = by;
            this.calculateAngleData(by.getPosition())
            this.move = true;
            this.queuePathfindingUpdate(); //Fire pathfinding.
        }
    }


    step(): void {
        if (this.owner.isDead) this.setAiState(AIState.DEAD);
        if (!GameConfig.getInstance().aiEnabled) return;
        if (this.owner.isDominated()) return; //Dominated units are not supposed to do things.


        if (this._isYielding >= 0) {
            this._isYielding -= this.timeScale;
            return;
        }

        switch (this.aiState) {
            case AIState.SPAWNING:
                this.handleSpawningState();
                break;
            case AIState.DEAD:
                this.handleDeadState();
                break;
            case AIState.IDLE:
                this.handleIdleState();
                break;
            case AIState.LOOKING_FOR_TARGET:
                this.handleLookingForTargetState();
                break;
            case AIState.CHASING:
                this.handleChasingState();
                break;
            case AIState.LOST_TARGET:
                this.handleLostTargetState();
                break;
        }

        if (this.move && GameConfig.getInstance().aiEnableMove) {
            this.owner.setAutoMoveData(this.angle, 1);
        }
        if (this.currentTarget && !this.currentTarget.isDead) {
            this.evaluateToAttack(this.currentTarget);
        }
    }

    handleSpawningState() {
        this.setAiState(AIState.IDLE);
        this.move = false;
        this.timerYield(2);
    }
    handleDeadState() {
        if (!this.owner.isDead) {
            this.setAiState(AIState.SPAWNING);
        }
    }
    handleIdleState() {
        if (!this.hasGuardPosition()) { // Normal chase without reason state.
            this.currentTarget = this.primaryTarget;
            this.setAiState(AIState.LOOKING_FOR_TARGET);
            return;
        }
        //It's gonna find a valid nearby target eventually.
        this.currentTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
        if (this.currentTarget && this.canSeeTarget(this.currentTarget)) {
            this.owner.alertNearbyAllies(this.currentTarget); //Go into LOOKING_FOR_TARGET state for the nearby group.
        } else {
            this.currentTarget = undefined;
        }
        if (this.guardPos) {
            let currentPos = this.guardPos[0];
            if (currentPos) {
                this.guardTimeSinceLastUpdate += this.lastStepSize * GameConfig.getInstance().timeScale;

                if (this.owner.getPosition().distanceTo(currentPos.position) <= (this.owner.getActualMoveSpeed() * this.guardStateRangeFactor)) {
                    this.move = false;
                    this.owner.setAutoMoveData(this.angle, 0);
                    if (GetRandomInt(1, 50) == 1) {
                        this.owner.logicAngle = TreeMath.RandAngle();
                    }
                    if (currentPos.moveInstantlyOnReach ||
                        this.guardTimeSinceLastUpdate >= currentPos.durationBeforeUpdate) {

                        if (!this.guardLastPositionForever || this.guardPos.length >= 2) {
                            let pos = Quick.SliceOrdered(this.guardPos, 0);
                            if (this.guardRepeatPositions) Quick.Push(this.guardPos, pos);

                            this.pathFindUpdateDelayTime = math.maxinteger;
                        }

                        this.guardTimeSinceLastUpdate = 0;
                    }
                } else {
                    this.move = true;
                }

                if (GameConfig.getInstance().aiEnableTargetPointCalculations) {
                    this.calculateTargetPoint(currentPos.position);
                    this.calculateAngleData(currentPos.position);
                }
            }
        }
    }
    handleLookingForTargetState() {
        if (this.lostTargetTime >= this.lostTargetTotalTime) {
            this.setAiState(AIState.LOST_TARGET);
        }
        this.updateLostTargetData();

        if (this.currentTarget == null || this.currentTarget.isDead) { //If dead or non-existant, pick a new random victim.
            this.currentTarget = CUnit.unitPool.getRandomAliveEnemy(this.owner);
            if (!this.currentTarget || !this.canSeeTarget(this.currentTarget)) {
                this.currentTarget = undefined;
                this.setAiState(AIState.LOST_TARGET);
                return;
            }
        }

        //this.currentTarget = this.evaluateNearbyTargetsForTargetSwitch(this.currentTarget);

        if (this.canSeeTarget(this.currentTarget)) { //If you can see target, enter CHASE state.
            this.owner.alertNearbyAllies(this.currentTarget);
        } else { //Otherwise, look and see if there is moderately any enemies it can see
            let hunch = CUnit.unitPool.getRandomAliveEnemy(this.owner);
            if (hunch && this.canSeeTarget(hunch, this.lostTargetRandomTargetRange)) {
                this.currentTarget = hunch;
                this.owner.alertNearbyAllies(hunch);
            }
        }

        //Otherwise just move in the general direction of a target until it loses it.
        if (this.currentTarget != null && !this.currentTarget.isDead) {
            this.calculateTargetPoint(this.currentTarget.getPosition());
            this.calculateAngleData(this.currentTarget.getPosition());
            this.move = true;
            return;
        } else {
            this.setAiState(AIState.LOST_TARGET);
            this.move = false;
        }
        this.timerYield(0.5);
    }
    handleChasingState() {
        if (this.currentTarget == null || this.currentTarget.isDead) {
            this.currentTarget = undefined;
            this.setAiState(AIState.IDLE);
            return;
        }

        this.move = true;
        this.currentTarget = this.evaluateNearbyTargetsForTargetSwitch(this.currentTarget);

        if (!this.canSeeTarget(this.currentTarget)) { // We lost the target, go back to searching mode.
            this.setAiState(AIState.LOOKING_FOR_TARGET);
            return;
        } else if (this.primaryTarget && this.canSeeTarget(this.primaryTarget, this.lostTargetRandomTargetRange)) {
            this.currentTarget = this.primaryTarget; // The primary target is close enough to just switch to it.
        }

        if (GetRandomInt(1, 10) == 1) {
            this.owner.alertNearbyAllies(this.currentTarget);
        }

        if (GameConfig.getInstance().aiEnableTargetPointCalculations) {
            this.calculateTargetPoint(this.currentTarget.getPosition());
            this.calculateAngleData(this.currentTarget.getPosition());
        }
    }
    handleLostTargetState() {
        this.setAiState(AIState.IDLE);
        this.move = false;
        this.currentTarget = undefined;
        this.queuePathfindingUpdate();
    }

    setAiState(aiState: AIState) {
        this.aiState = aiState;

        switch (aiState) {
            case AIState.LOOKING_FOR_TARGET:
                this.lostTargetTime = 0;
                break;
        }
        return this;
    }

    isAiState(aiState: AIState): boolean {
        return this.aiState == aiState;
    }

    hasGuardPosition() {
        return this.guardPos != undefined && this.guardPos.length > 0; //Has a guard position and it has entries.
    }

}