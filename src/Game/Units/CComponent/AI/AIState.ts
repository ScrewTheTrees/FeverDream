export enum AIState {
    SPAWNING,
    IDLE,
    DEAD,
    LOOKING_FOR_TARGET,
    CHASING,
}


export function AIStateToString(state: AIState) {
    return AIState[state];
}