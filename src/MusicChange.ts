import {Entity} from "wc3-treelib/src/TreeLib/Entity";

export class MusicChange extends Entity {
    public constructor(public toTrack: string) {
        super(0.04);
    }
    public count = 60;
    public finishing = false;
    step(): void {
        if (!this.finishing) {
            this.count--;
        } else {
            this.count++;
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
        SetMusicVolume(this.count);
    }

}