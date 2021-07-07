import {Entity} from "wc3-treelib/src/TreeLib/Entity";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {PointWalkableChecker} from "wc3-treelib/src/TreeLib/Pathing/PointWalkableChecker";
import {Interpolation} from "wc3-treelib/src/TreeLib/Utility/Interpolation";

export class CUnit extends Entity {
    public owner: player;
    public effect: effect;

    public position: Vector2;
    public facingAngle: number = 0;
    public wantedAngle: number = 0;
    public isMoving: boolean = false;
    public wasMoving: boolean = false;
    private moveTime: number = 0;
    private maxMoveTime: number = 10;


    public health: number = 0;
    public maxHealth: number = 3;
    public isDead: boolean = false;


    private checker = PointWalkableChecker.getInstance();


    public constructor(owner: player, model: string, x: number, y: number) {
        super(0.01);
        this.owner = owner;
        this.effect = AddSpecialEffect(model, x, y);
        this.position = Vector2.new(x, y);
    }

    public revive() {
        this.health = this.maxHealth;
        this.isDead = false;
    }

    public teleport(to: Vector2) {
        this.position.x = to.x;
        this.position.y = to.y;
    }
    public move(offset: Vector2) {
        if (offset.x == 0 && offset.y == 0) return;

        this.moveTime = this.maxMoveTime;
        this.isMoving = true;

        this.face(offset.getAngle() * bj_RADTODEG);
        if (this.checker.checkTerrainXY(this.position.x + offset.x, this.position.y)) {
            this.position.x += offset.x;
        }
        if (this.checker.checkTerrainXY(this.position.x, this.position.y + offset.y)) {
            this.position.y += offset.y;
        }
    }
    public face(angle: number) {
        this.wantedAngle = angle % 360;
    }

    step() {
        this.facingAngle = Interpolation.RotDivisionSpring(this.facingAngle, this.wantedAngle, 15);

        if (this.moveTime <= 0) this.isMoving = false;
        else this.moveTime -= 1;

        this.draw();
        if (this.isMoving != this.wasMoving) this.moveStateChanged();
        this.wasMoving = this.isMoving;
    }
    private moveStateChanged() {
        if (this.isMoving) {
            BlzPlaySpecialEffect(this.effect, ANIM_TYPE_WALK);
        } else {
            BlzPlaySpecialEffect(this.effect, ANIM_TYPE_STAND);
        }
    }
    private draw() {
        BlzSetSpecialEffectX(this.effect, this.position.x);
        BlzSetSpecialEffectY(this.effect, this.position.y);
        BlzSetSpecialEffectZ(this.effect, this.position.getZ());
        BlzSetSpecialEffectColorByPlayer(this.effect, this.owner);
        BlzSetSpecialEffectYaw(this.effect,
            ((-this.facingAngle + 90) * bj_DEGTORAD)
        );
    }
}