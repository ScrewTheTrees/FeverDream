import {TreeThread} from "../../TreeRunnable";
import {GameConfig} from "../../../GameConfig";
import {Arena} from "../Arenas/Arena";
import {ChooseOne} from "wc3-treelib/src/TreeLib/Misc";
import {PlayerHeroes} from "../../PlayerManager/PlayerHeroes";
import {Vector2} from "wc3-treelib/src/TreeLib/Utility/Data/Vector2";
import {CUnit} from "../../Units/CUnit/CUnit";

export abstract class Scene extends TreeThread {

    protected constructor() {
        super(0.02);
    }
    abstract onPlayersDeath(): void;
    /** Returns next scene */
    abstract onFinish(): Scene | undefined;

    public hasFinished: boolean = false;
    public numberOfPlayers() {
        return GameConfig.getInstance().playingPlayers.length;
    }

    public startStandardCombatArena(arena: Arena) {
        arena.closeArena();
        this.moveTardyPlayersToArena(arena);
    }

    public waitUntilPlayerTriggerArena(arena: Arena) {
        while (!arena.isPlayerTouchingTrigger()) {
            this.yieldTimed(0.1);
        }
    }
    public moveTardyPlayersToArena(arena: Arena) {
        let exclude = PlayerHeroes.getInstance().getHeroesInside(...arena.arenaCheck);
        PlayerHeroes.getInstance().moveHeroesToRect(ChooseOne(...arena.tardy), exclude);
    }
    public waitWhileArenaHasEnemies(arena: Arena) {
        while (arena.countRemainingEnemies() > 0) {
            this.yieldTimed(0.1);
        }
    }
    //Spawning
    public generateSpawn(arena: Arena, func: (enemyPlayer: player, place: Vector2, focusPlayer: CUnit | undefined) => CUnit) {
        let place = Vector2.randomPointInRect(ChooseOne(...arena.enemySpawns));
        let enemyPlayer = ChooseOne(...GameConfig.getInstance().creepPlayers);
        let focusTarget = PlayerHeroes.getInstance().getHero(ChooseOne(...GameConfig.getInstance().playingPlayers));
        let u = func(enemyPlayer, place, focusTarget);
        arena.addEnemy(u);
        place.recycle();
    }
}

