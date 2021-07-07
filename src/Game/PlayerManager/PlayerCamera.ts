import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {PlayerHeroes} from "./PlayerHeroes";
import {GameConfig} from "../../GameConfig";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";

export class PlayerCamera extends Entity {
    private static _instance: PlayerCamera;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerCamera();
        }
        return this._instance;
    }
    private constructor() {
        super(0.01);
    }

    public unlock: boolean = false;
    public followHeroes: boolean = true;
    public divider: number = 10;

    step(): void {
        if (this.unlock) return;
        
        if (this.followHeroes) {
            for (let play of GameConfig.getInstance().playingPlayers) {
                let hero = PlayerHeroes.getInstance().getHero(play);
                if (hero == null) continue;

                this.slideTo(hero.position, play);
            }
        }
    }

    private lastPoint: Vector2 = Vector2.new(0, 0);
    public slideTo(position: Vector2, p: player) {
        let wanted = Vector2.new(0, 0);
        if (GetLocalPlayer() == p) {
            wanted.x = Interpolation.DivisionSpring(this.lastPoint.x, position.x, this.divider);
            wanted.y = Interpolation.DivisionSpring(this.lastPoint.y, position.y, this.divider);
            SetCameraPosition(wanted.x, wanted.y);
            this.lastPoint.x = wanted.x;
            this.lastPoint.y = wanted.y;
        }
        wanted.recycle();
    }
}