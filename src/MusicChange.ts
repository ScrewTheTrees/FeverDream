import {Entity} from "wc3-treelib/src/TreeLib/Entity";

export class MusicChange extends Entity {
    public constructor(public toTrack: string, public speed: number = 0.5) {
        super(0.02);
    }
    public count = 60;
    public finishing = false;
    step(): void {
        if (!this.finishing) {
            this.count -= this.speed;
        } else {
            this.count += this.speed;
        }
        if (this.count <= 0) {
            this.count = 0;
            this.finishing = true;
            ClearMapMusic();
            SetMapMusic(this.toTrack, true, 0);
            PlayMusic(this.toTrack);
        }
        if (this.count >= 64) {
            this.count = 64;
            this.remove();
        }
        SetMusicVolume(Math.round(this.count));
    }

}