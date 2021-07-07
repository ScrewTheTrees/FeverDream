import {Logger} from "wc3-treelib/src/TreeLib/Logger";


// =========================================
// It's not perfect, but it'll do the trick.
// =========================================

export class Game {

    constructor() {
        Logger.doLogVerbose = false;
        Logger.doLogDebug = false;
    }
}