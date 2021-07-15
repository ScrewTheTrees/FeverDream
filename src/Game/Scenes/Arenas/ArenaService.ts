import {Arena1Combat, Arena2Combat, ArenaDummy} from "./Arena";

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

    //Generic
    public dummyArena = new ArenaDummy();
    //Section 1.
    public combatArena1 = new Arena1Combat();
    public combatArena2 = new Arena2Combat();

    //Section 2.

    public clearAllEnemies() {
        this.dummyArena.removeAllEnemies();
        this.combatArena1.removeAllEnemies();
        this.combatArena2.removeAllEnemies();
    }
}