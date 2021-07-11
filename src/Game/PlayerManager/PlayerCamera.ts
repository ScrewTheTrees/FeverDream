import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {PlayerHeroes} from "./PlayerHeroes";
import {GameConfig} from "../../GameConfig";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";
import {InputManager} from "wc3-treelib/src/TreeLib/InputManager/InputManager";

export const enum CameraMode {
    NONE,
    HERO,
    CUSTOM,

}

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

    public cameraMode: CameraMode = CameraMode.HERO;
    public divider: number = 10;

    public customPosition = Vector2.new(0, 0);
    public zoom = 1650;
    public angleOfAttack = 290;
    public rotation = 90;

    private standardZoom = 1650;
    private standardAngleOfAttack = 304;
    private standardRotation = 90;

    private lastMousePos: Vector2[] = [
        Vector2.new(0, 0),
        Vector2.new(0, 0),
        Vector2.new(0, 0),
        Vector2.new(0, 0),
    ];
    private mouseOffset: Vector2[] = [
        Vector2.new(0, 0),
        Vector2.new(0, 0),
        Vector2.new(0, 0),
        Vector2.new(0, 0),
    ];

    step(): void {
        if (this.cameraMode == CameraMode.HERO) {
            for (let play of GameConfig.getInstance().playingPlayers) {
                let hero = PlayerHeroes.getInstance().getHero(play);
                let id = GetPlayerId(play);
                if (hero == null) continue;
                if (!this.lastMousePos[id].equals(InputManager.getLastMouseCoordinate(play))) {
                    this.lastMousePos[id].updateToPoint(InputManager.getLastMouseCoordinate(play));
                    this.mouseOffset[id].updateToPoint(hero.position)
                        .offsetTo(this.lastMousePos[id])
                        .divideOffsetNum(8);
                }
                let pos = hero.position.copy();

                pos.y += 64;
                pos.addOffset(this.mouseOffset[id]);

                this.moveTo(pos, play);
                pos.recycle();
            }
        } else if (this.cameraMode == CameraMode.CUSTOM) {
            this.moveTo(this.customPosition, GetLocalPlayer());
        }
    }

    public setHeroCamera(zoom: number = this.standardZoom) {
        this.resetStandardCamera();

        this.cameraMode = CameraMode.HERO;
        this.divider = 20;
        this.zoom = zoom;
    }
    public setCustomCamera(pos: Vector2, zoom: number = this.standardZoom) {
        this.resetStandardCamera();

        this.customPosition.x = pos.x;
        this.customPosition.y = pos.y;
        this.divider = 10;
        this.cameraMode = CameraMode.CUSTOM;
        this.zoom = zoom;
    }

    public resetStandardCamera() {
        this.zoom = this.standardZoom;
        this.angleOfAttack = this.standardAngleOfAttack;
        this.rotation = this.standardRotation;
    }

    private lastPoint: Vector2 = Vector2.new(0, 0);
    private lastZoom: number = 0;
    private lastAngleOfAttack: number = 0;
    private lastRotation: number = 0;
    public moveTo(position: Vector2, p: player) {
        let wanted = Vector2.new(0, 0);
        if (GetLocalPlayer() == p) {
            wanted.x = Interpolation.DivisionSpring(this.lastPoint.x, position.x, this.divider);
            wanted.y = Interpolation.DivisionSpring(this.lastPoint.y, position.y, this.divider);
            SetCameraPosition(wanted.x, wanted.y);
            this.lastPoint.x = wanted.x;
            this.lastPoint.y = wanted.y;

            SetCameraField(CAMERA_FIELD_ZOFFSET, 0, 0.0);
            SetCameraField(CAMERA_FIELD_FARZ, 20000, 0.0);

            this.lastZoom = Interpolation.DivisionSpring(this.lastZoom, this.zoom, this.divider);
            SetCameraField(CAMERA_FIELD_TARGET_DISTANCE, this.lastZoom, 0.0);
            this.lastAngleOfAttack = Interpolation.RotDivisionSpring(this.lastAngleOfAttack, this.angleOfAttack, this.divider);
            SetCameraField(CAMERA_FIELD_ANGLE_OF_ATTACK, this.lastAngleOfAttack, 0.0);
            this.lastRotation = Interpolation.RotDivisionSpring(this.lastRotation, this.rotation, this.divider);
            SetCameraField(CAMERA_FIELD_ROTATION, this.lastRotation, 0.0);
        }
        wanted.recycle();
    }
}