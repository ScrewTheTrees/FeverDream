export enum AIState {
    SPAWNING,
    IDLE,
    DEAD,
    LOOKING_FOR_TARGET,
    CHASING,
    LOST_TARGET,
}


export function AIStateToString(state: AIState) {
    return AIState[state];
}