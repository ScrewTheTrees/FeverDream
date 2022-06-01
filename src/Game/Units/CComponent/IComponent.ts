import {CUnit} from "../CUnit/CUnit";

export interface IComponent {
    isFinished: boolean;
    owner: CUnit;
    removeOnDeath: boolean;
    get timerDelay(): number;
    set timerDelay(delay: number);
    destroy(): void;
    cleanup(): void;
    step(): void;
    onAlerted(by: CUnit): void;
}