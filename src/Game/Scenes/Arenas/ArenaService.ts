import {Arena1Combat, Arena2Combat} from "./Arena";

export class ArenaService {
    private static _instance: ArenaService;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new ArenaService();
        }
        return this._instance;
    }
    private constructor() {

    }

    public combatArena1 = new Arena1Combat();
    public combatArena2 = new Arena2Combat();

    public clearAllEnemies() {
        this.combatArena1.removeAllEnemies();
        this.combatArena2.removeAllEnemies();
    }
}