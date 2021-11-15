import {TreeThread} from "wc3-treelib/src/TreeLib/Utility/TreeThread";
import {GameConfig} from "../../../GameConfig";
import {Arena} from "../Arenas/Arena";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../Units/CUnit/CUnit";
import {Delay} from "wc3-treelib/src/TreeLib/Utility/Delay";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";

export abstract class Scene extends TreeThread {

    protected constructor() {
        super(0.02);
    }
    abstract onPlayersDeath(): void;
    /** Returns next scene */
    abstract onFinish(): Scene | undefined;

    public playMusic(music: string) {
        GameConfig.getInstance().setMusic(music);
    }
    public numberOfPlayers() {
        return GameConfig.getInstance().playingPlayers.length;
    }
    public movePlayersToRect(...place: rect[]) {
        PlayerHeroes.getInstance().moveHeroesToRect(ChooseOne(...place));
    }

    //Arenas
    public startStandardCombatArena(arena: Arena) {
        arena.closeArena();
        this.moveTardyPlayersToArena(arena);
    }
    public waitUntilPlayerTriggerArena(arena: Arena) {
        while (!arena.isPlayerTouchingTrigger()) {
            this.yieldTimed(0.1);
        }
    }
    public waitUntilPlayerTriggerRect(...trigger: rect[]) {
        while (!PlayerHeroes.getInstance().intersects(...trigger)) {
            this.yieldTimed(0.1);
        }
    }
    public moveTardyPlayersToArena(arena: Arena) {
        let exclude = PlayerHeroes.getInstance().getHeroesInside(...arena.arenaCheck);
        PlayerHeroes.getInstance().moveHeroesToRect(ChooseOne(...arena.tardy), exclude);
    }
    public waitWhileArenaHasEnemies(arena: Arena, minimum = 0) {
        this.yieldTimed(3);
        while (arena.countRemainingEnemies() > minimum) {
            this.yieldTimed(0.1);
        }
    }
    //Spawning
    public generateSpawn(arena: Arena, func: (enemyPlayer: player, place: Vector2) => CUnit, spawnRect?: rect) {
        let place = spawnRect != null ? Vector2.randomPointInRect(spawnRect) : Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
        let enemyPlayer = GameConfig.getInstance().creepPlayer;
        let u = func(enemyPlayer, place);
        arena.addEnemy(u);
        place.recycle();
    }
    public generateSpawnPerPlayerAsync(arena: Arena, func: (enemyPlayer: player, place: Vector2, focusPlayer?: CUnit) => CUnit,
                                       baseDelay: number, repeatPerPlayer: number, spawnRect?: rect) {
        let totalPlays = GameConfig.getInstance().playingPlayers.length;
        let id: number = 0;

        Delay.addDelay(() => {
            if (id >= GameConfig.getInstance().playingPlayers.length) id = 0;
            let play = GameConfig.getInstance().playingPlayers[id];
            id++;

            let place = spawnRect != null ? Vector2.randomPointInRect(spawnRect) : Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
            if (spawnRect) Vector2.randomPointInRect(spawnRect);
            let enemyPlayer = GameConfig.getInstance().creepPlayer;
            let focusTarget = PlayerHeroes.getInstance().getHero(play);
            let u = func(enemyPlayer, place, focusTarget);
            arena.addEnemy(u);
            place.recycle();

        }, baseDelay / totalPlays, repeatPerPlayer * totalPlays);
    }

    //Camera
    public cameraShowActionThenResetHeroCamera(position: Vector2,
                                               action?: () => void,
                                               zoom?: number, startYield = 1, endYield = 1) {
        PlayerCamera.getInstance().setCustomCamera(position, zoom);
        this.yieldTimed(startYield);
        if (action) action();
        this.yieldTimed(endYield);
        PlayerCamera.getInstance().setHeroCamera();
    }
}

