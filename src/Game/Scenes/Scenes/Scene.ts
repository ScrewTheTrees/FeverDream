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
        super(0.05);
    }
    abstract onPlayersDeath(): void;
    /** Returns next scene */
    abstract onFinish(): Scene | undefined;

    public playMusic(music: string) {
         GameConfig.getInstance().setMusic(music);
    }
    public numberOfPlayers() {
        return  GameConfig.getInstance().playingPlayers.length;
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
            this.yieldTimed(0.2);
        }
    }
    public waitUntilPlayerTriggerRect(trigger: rect) {
        while (!PlayerHeroes.getInstance().intersects(trigger)) {
            this.yieldTimed(0.2);
        }
    }
    public waitUntilPlayerTriggerRectAny(trigger: rect[]) {
        while (!PlayerHeroes.getInstance().intersectsAny(trigger)) {
            this.yieldTimed(0.2);
        }
    }
    public moveTardyPlayersToArena(arena: Arena) {
        let exclude = PlayerHeroes.getInstance().getHeroesInsideAny(arena.arenaCheck);
        PlayerHeroes.getInstance().moveHeroesToRect(ChooseOne(...arena.tardy), exclude);
    }
    public waitWhileArenaHasEnemies(arena: Arena, minimum = 0) {
        this.yieldTimed(3);
        while (arena.countRemainingEnemies() > minimum) {
            this.yieldTimed(0.2);
        }
    }
    //Spawning
    public generateSpawn(arena: Arena, func: ( place: Vector2) => CUnit | undefined,
                         spawnRect?: rect,
                         enemyPlayer: player =  GameConfig.getInstance().creepPlayer
    ) {
        let place = spawnRect != null ? Vector2.randomPointInRect(spawnRect) : Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
        let u = func(place);
        if (u) arena.addEnemy(u);
        place.recycle();
    }

    public generateSpawnForSelectPlayersAsync(arena: Arena, func: (place: Vector2, focusPlayer?: CUnit) => CUnit | undefined,
                                              players: player[],
                                              baseDelay: number,
                                              repeatPerPlayer: number,
                                              spawnRect?: rect
    ) {
        let totalPlays = players.length;
        let id: number = 0;

        Delay.getInstance().addDelay(() => {
            if (id >= players.length) id = 0;
            let play = players[id];
            id++;

            let place = spawnRect != null ? Vector2.randomPointInRect(spawnRect) : Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
            let focusTarget = PlayerHeroes.getInstance().getHero(play);
            let u = func(place, focusTarget);
            if (u) arena.addEnemy(u);
            place.recycle();

        }, baseDelay / totalPlays, repeatPerPlayer * totalPlays);
    }
    public generateSpawnForAllPlayerAsync(arena: Arena, func: (place: Vector2, focusPlayer?: CUnit) => CUnit | undefined,
                                          baseDelay: number,
                                          repeatPerPlayer: number,
                                          spawnRect?: rect
    ) {
        this.generateSpawnForSelectPlayersAsync(arena, func,  GameConfig.getInstance().playingPlayers, baseDelay, repeatPerPlayer, spawnRect);
    }
    public generateSpawnPerPlayerFurthersSpawnAsync(arena: Arena,
                                                    func: (place: Vector2, focusPlayer?: CUnit) => CUnit | undefined,
                                                    baseDelay: number, repeatPerPlayer: number) {
        let rc = arena.getFurthestSpawnerOfPlayers();
        this.generateSpawnForSelectPlayersAsync(arena, func,  GameConfig.getInstance().playingPlayers, baseDelay, repeatPerPlayer, rc)
    }

    public generateSpawnsMultiple(arena: Arena, func: (place: Vector2) => CUnit | undefined,
                                  baseDelay: number,
                                  totalRepeats: number,
                                  spawnRect?: rect) {
        Delay.getInstance().addDelay(() => {
            let place = spawnRect != null ? Vector2.randomPointInRect(spawnRect) : Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
            let u = func(place);
            if (u) arena.addEnemy(u);
            place.recycle();

        }, baseDelay, totalRepeats);
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

