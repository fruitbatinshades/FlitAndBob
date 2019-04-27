/**
 * Transitions for the interactions N.B. interaction is passed to each method as 'this'
 */
export default class Transitions{
    constructor() {
        /** Lookup to transitions that process map key: Transition */
        this.transition = {
            "fadeAndDisable": this.fadeAndDisable,
            "toggleVisibility": this.toggleVisibility
        };
    }

    /**
    * Toggles tile visibilty
    * @param {Phaser.GameObjects.Tile[]} tiles
    */
    toggleVisibility(tiles) {
        tiles.forEach((x) => {
            x.visible = !x.visible;
        });
    }
    /**
     * Fades and disables tiles
     * @param {Phaser.GameObjects.Tile[]} tiles Tiles that are affected
     * @param {InteractionZone} zone Zone to process
     */
    fadeAndDisable(tiles, zone) {
        let alphaTarget = tiles[0].visible ? 0 : 1;
        let targetZone = this.getTargetZone(zone.Target.key);

        //if showing, make them visible else they will pop in at the end
        if (alphaTarget === 1) {
            tiles.forEach((x) => {
                x.alpha = 0;
                x.visible = !x.visible;
            });
        } else {
            tiles.reverse();
        }
        this.scene.tweens.add({
            targets: tiles,
            alpha: alphaTarget,
            ease: 'Power1',
            duration: 500,
            delay: function (i, total, target) {
                return i * 250;
            },
            onComplete: function (tween, targets, zone) {
                targets.forEach((x) => {
                    x.visible = x.alpha === 1;
                });
                zone.body.enable = !zone.body.enable;
                zone.active = !zone.active;
                zone.adjustWorld();
            },
            onCompleteParams: [targetZone]
        });
    }
}