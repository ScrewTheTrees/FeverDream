import {Game} from "./Game";
import {Hooks} from "wc3-treelib/src/TreeLib/Hooks";

export let gg_trg_Start: trigger;
export let gameInstance: Game;

function MapStart() {
    xpcall(() => {
        gameInstance = new Game();
    }, print);

    DestroyTrigger(gg_trg_Start);
}

function NewMain(this: void) {
    gg_trg_Start = CreateTrigger();
    TriggerRegisterTimerEvent(gg_trg_Start, 0.00, false);
    TriggerAddAction(gg_trg_Start, () => MapStart());
}

// @ts-ignore
_G.main = Hooks.hookResult(_G.main, NewMain);