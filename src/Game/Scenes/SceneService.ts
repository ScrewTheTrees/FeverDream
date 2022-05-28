import {Scene} from "./Scenes/Scene";
import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {PlayerHeroes} from "../PlayerManager/PlayerHeroes";
import {SceneTutorial1} from "./Scenes/SceneTutorial1";

export class SceneService extends Entity {
    private static _instance: SceneService;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new SceneService();
        }
        return this._instance;
    }
    private _currentScene?: Scene = new SceneTutorial1();

    private constructor() {
        super(0.2);
    }

    private previousHeroesAlive = 0;

    step(): void {
        if (this._currentScene && this._currentScene.isFinished) {
            this._currentScene = this._currentScene.onFinish();
        }

        let heroesAlive = PlayerHeroes.getInstance().countAliveHeroes();
        if (this._currentScene
            && this._currentScene.isActive()
            && heroesAlive == 0 && this.previousHeroesAlive > 0) {
            print("onPlayersDeath")
            this._currentScene.onPlayersDeath();
        }
        this.previousHeroesAlive = heroesAlive;
    }

    public finishScene() {
        if (this._currentScene) {
            this._currentScene.isFinished = true;
        }
    }
}