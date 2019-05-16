export default class Effects {
    /** Lookup to effects that process map key: Effect */
    effect = {
        "Fast": this.fast,
        "Injure": this.injure,
        "Kill": this.kill,
        "Slippy": this.slippy,
        "Slow": this.slow,
        "Push": this.push
    };
    /**
     * Player speeds up
     * @param {InteractionZone} triggerZone
     * @param {Phaser.GameObjects.Sprite} player
     */
    fast(triggerZone, player) {
        if (player !== null) {
            player.isFast = true;
        }
    }
    /**
     * Player is injured
     * @param {InteractionZone} triggerZone
     * @param {Phaser.GameObjects.Sprite} player
     */
    injure(triggerZone, player) {
        if (player !== null && triggerZone.Affect) {
            if (triggerZone.Affect.key === null || player.is(triggerZone.Affect.key)) {
                player.injure(triggerZone.Effect.params.health || 10);
            }
        }
    }
    /**
    * Kill the player
    * @param {InteractionZone} triggerZone
    * @param {Phaser.GameObjects.Sprite} player
    */
    kill(triggerZone, player) {
        if (player !== null) {
            if (triggerZone.Affect === null || triggerZone.Affect.key === null || player.is(triggerZone.Affect.key)) {
                player.kill();
            }
        }
    }
    /**
     * Player slides and cannot turn aroud
     * @param {InteractionZone} triggerZone
     * @param {Phaser.GameObjects.Sprite} player
     */
    slippy(triggerZone, player) {
        if (player !== null) {
            player.effectSpeed = 500;
        }
    }
    /**
     * Player slows down
     * @param {InteractionZone} triggerZone
     * @param {Phaser.GameObjects.Sprite} player
     */
    slow(triggerZone, player) {
        if (player !== null) {
            player.isSlow = true;
        }
    }
    push(z, player) {
        if (player !== null) {
            if (z.Affect === null || z.Affect.key === null || player.is(z.Affect.key)) {
                player.zoneInControl = true;
                player.zoneValue = z.Effect.params;
            }
        }
    }
}