export class PlayerStats {
    private static _instance: PlayerStats;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerStats();
        }
        return this._instance;
    }
    private constructor() {

    }

    public damage: number = 25;
    public fireRate: number = 1;
    public actionRate: number = 1;
    public rollSpeed: number = 1;
    public cooldownReduction: number = 1;
}