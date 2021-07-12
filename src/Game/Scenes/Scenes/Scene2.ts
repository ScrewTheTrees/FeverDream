import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {Scene} from "./Scene";

export class Scene2 extends Scene {
    public checkpoint1 = gg_rct_Scene2Start;

    private playerHeroes = PlayerHeroes.getInstance();
    private playerCamera = PlayerCamera.getInstance();

    public constructor() {
        super();

        /*let pos = Vector2.fromRectCenter(this.checkpoint1);
        this.moveHelpText = CreateTextTag();
        SetTextTagText(this.moveHelpText, "WASD to move.", 0.024);
        SetTextTagPos(this.moveHelpText, pos.x, pos.y, 16);
        SetTextTagVisibility(this.moveHelpText, true);
        SetTextTagPermanent(this.moveHelpText, true);

        pos = Vector2.fromRectCenter(gg_rct_Scene1Arena1Camera1);
        this.attackHelpText = CreateTextTag();
        SetTextTagText(this.attackHelpText, "Right click to fire.", 0.024);
        SetTextTagPos(this.attackHelpText, pos.x, pos.y, 16);
        SetTextTagVisibility(this.attackHelpText, true);
        SetTextTagPermanent(this.attackHelpText, true);*/
    }
    public execute() {
        print("Scene2 starting.");
        this.playerCamera.setHeroCamera();
        this.yieldTimed(100);
    }

    //Return next scene.
    public onFinish(): Scene | undefined {
        print("A winner is you!");

        return undefined;
    }
    onPlayersDeath(): void {
        this.remove();

        Delay.addDelay(() => {
            this.playerHeroes.reviveHeroesIfDead(this.checkpoint1);
            this.reset();
        }, 5);
    }
}