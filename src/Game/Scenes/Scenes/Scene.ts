import {TreeThread} from "wc3-treelib/src/TreeLib/Utility/TreeThread";
import {GameConfig} from "../../../GameConfig";
import {Arena} from "../Arenas/Arena";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../Units/CUnit/CUnit";
import {Delay} from "wc3-treelib/src/TreeLib/Services/Delay/Delay";
import {PlayerCamera} from "../../PlayerManager/PlayerCamera";

export abstract class Scene extends TreeThread {

    protected constructor() {
        super(0.02);
    }
    abstract onPlayersDeath(): void;
    /** Returns next scene */
    abstract onFinish(): Scene | undefined;

    public playMusic(music: string) {
        GameConfig.setMusic(music);
    }
    public numberOfPlayers() {
        return GameConfig.playingPlayers.length;
    }
    public movePlayersToRect(...place: rect[]) {
        PlayerHeroes.getInstance().moveHeroesToRect(ChooseOne(...place));
        print("moveHeroesToRect");
    }

    //Arenas
    public startStandardCombatArena(arena: Arena) {
        arena.closeArena();
        this.moveTardyPlayersToArena(arena);
        print("startStandardCombatArena, moveTardyPlayersToArena");
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
    public generateSpawn(arena: Arena, func: (enemyPlayer: player, place: Vector2) => CUnit | undefined, spawnRect?: rect) {
        let place = spawnRect != null ? Vector2.randomPointInRect(spawnRect) : Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
        let enemyPlayer = GameConfig.creepPlayer;
        let u = func(enemyPlayer, place);
        if (u) arena.addEnemy(u);
        place.recycle();
    }
    public generateSpawnForAllPlayerAsync(arena: Arena, func: (enemyPlayer: player, place: Vector2, focusPlayer?: CUnit) => CUnit | undefined,
                                          baseDelay: number, repeatPerPlayer: number, spawnRect?: rect) {
        this.generateSpawnForSelectPlayersAsync(arena,  func, GameConfig.playingPlayers, baseDelay, repeatPerPlayer, spawnRect);
    }
    public generateSpawnForSelectPlayersAsync(arena: Arena, func: (enemyPlayer: player, place: Vector2, focusPlayer?: CUnit) => CUnit | undefined,
                                              players: player[], baseDelay: number, repeatPerPlayer: number, spawnRect?: rect) {
        let totalPlays = players.length;
        let id: number = 0;

        Delay.addDelay(() => {
            if (id >= players.length) id = 0;
            let play = players[id];
            id++;

            let place = spawnRect != null ? Vector2.randomPointInRect(spawnRect) : Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
            let enemyPlayer = GameConfig.creepPlayer;
            let focusTarget = PlayerHeroes.getInstance().getHero(play);
            let u = func(enemyPlayer, place, focusTarget);
            if (u) arena.addEnemy(u);
            place.recycle();

        }, baseDelay / totalPlays, repeatPerPlayer * totalPlays);
    }
    public generateSpawnPerPlayerFurthersSpawnAsync(arena: Arena,
                                                    func: (enemyPlayer: player, place: Vector2, focusPlayer?: CUnit) => CUnit | undefined,
                                                    baseDelay: number, repeatPerPlayer: number) {
        let totalPlays = GameConfig.playingPlayers.length;
        let id: number = 0;
        let rc = arena.getFurthestSpawnerOfPlayers();

        Delay.addDelay(() => {
            if (id >= GameConfig.playingPlayers.length) id = 0;
            let play = GameConfig.playingPlayers[id];
            id++;
            let place = Vector2.randomPointInRect(rc);

            let enemyPlayer = GameConfig.creepPlayer;
            let focusTarget = PlayerHeroes.getInstance().getHero(play);
            let u = func(enemyPlayer, place, focusTarget);
            if (u) arena.addEnemy(u);
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

