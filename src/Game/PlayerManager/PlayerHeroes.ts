export class PlayerHeroes {
    private static _instance: PlayerHeroes;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerHeroes();
        }
        return this._instance;
    }
    private constructor() {

    }
    private heroes: Map<player, unit> = new Map<player, unit>();

    public addHero(p: player, u: unit): boolean {
        if (this.heroes.get(p) == null) {
            this.heroes.set(p, u);
            return true;
        }
        return false;
    }

    public removeHero(p: player): boolean {
        let hero = this.heroes.get(p);
        if (hero != null) {
            this.heroes.delete(p);
            return true;
        }
        return false;
    }

    public getHero(p: player) {
        return this.heroes.get(p);
    }
}