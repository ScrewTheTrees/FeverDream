import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {Quick} from "wc3-treelib/src/TreeLib/Quick";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../Units/CUnit/CUnit";

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
    private heroes: Map<player, CUnit> = new Map<player, CUnit>();

    public addHero(p: player, u: CUnit): boolean {
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

    public getAliveHeroes() {
        let heroes: CUnit[] = [];
        for (let u of this.heroes.values()) {
            if (!u.isDead) {
                heroes.push(u);
            }
        }
        return heroes;
    }
    public countAliveHeroes() {
        let heroes =0;
        for (let u of this.heroes.values()) {
            if (!u.isDead) {
                heroes++;
            }
        }
        return heroes;
    }

    public moveHeroesToRect(to: rect, excluding: CUnit[] = []) {
        for (let u of this.heroes.values()) {
            if (Quick.Contains(excluding, u)) continue;
            u.teleport(Vector2.randomPointInRect(to).recycle());
        }
    }
    public reviveHeroesIfDead(...to: rect[]) {
        for (let u of this.heroes.values()) {
            if (u.isDead) {
                u.teleport(Vector2.randomPointInRect(ChooseOne(...to)).recycle());
                u.revive();
            }
        }
    }
    public intersects(...to: rect[]): boolean {
        for (let u of this.heroes.values()) {
            if (u.isDead) continue;
            for (let r of to) {
                if (RectContainsCoords(r, u.getPosition().x, u.getPosition().y)) {
                    return true;
                }
            }
        }
        return false;
    }
    public getHeroesInside(...to: rect[]) {
        let found: CUnit[] = [];
        for (let u of this.heroes.values()) {
            for (let r of to) {
                if (RectContainsCoords(r, u.getPosition().x, u.getPosition().y)) {
                    found.push(u);
                }
            }
        }
        return found;
    }
    public getOwnersInside(...to: rect[]) {
        let found: player[] = [];
        for (let u of this.heroes.values()) {
            for (let r of to) {
                if (RectContainsCoords(r, u.getPosition().x, u.getPosition().y)) {
                    found.push(u.owner);
                }
            }
        }
        return found;
    }
}