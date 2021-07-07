import {Scene} from "./Scene";
import {Entity} from "wc3-treelib/src/TreeLib/Entity";

export class SceneService extends Entity {
    private static _instance: SceneService;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new SceneService();
        }
        return this._instance;
    }
    private _currentScene!: Scene;
    get currentScene(): Scene {
        return this._currentScene;
    }
    set currentScene(value: Scene) {
        if (this._currentScene) this._currentScene.remove();
        this._currentScene = value;
        this._currentScene.onInit();
    }


    private constructor() {
        super(0.1);
    }


    step(): void {
        if (this._currentScene && this._currentScene.hasFinished) {
            print("win");
        }
    }
}