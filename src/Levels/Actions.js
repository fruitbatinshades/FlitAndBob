/**
 * Actions for the interactions N.B. Interaction.js is passed to each method as 'this'
 */
export default class Actions{
    constructor() {
        /* Lookup to functions that process map key: Action */
        this.action = {
            "ShowHide": this.showHide,
            "Toggle": this.toggleZone
        };
    }

    /**
    * Show/Hides target zone and disables it using a transition
    * @param {InteractionZone} triggerZone
    * @param {Phaser.Game.Sprite} player
    */
    showHide(triggerZone, player) {
        if (triggerZone.Action.key === 'ShowHide') {

            let found = [];
            let targetZone;
            if (triggerZone.Target) {
                targetZone = this.getTargetZone(triggerZone.Target.key);
            }
            if (targetZone) {
                found = targetZone.getVisibleTiles(this.scene);
                if (found.length > 0) {
                    found.forEach((x) => {
                        x.visible = !targetZone.isActive;
                    });
                    targetZone.body.enable = !targetZone.body.enable;
                    targetZone.isActive = !targetZone.isActive;
                    targetZone.adjustWorld();
                }
            }
            else if (triggerZone.GroupKey != null) {
                //no target so check group
                let group = this.getGroup(triggerZone.GroupKey.key, triggerZone.name)
                if (group.length !== 0) {
                    for (let i = 0; i < group.length; i++) {
                        let g = group[i][1];
                        if (g.tileType && g.tileType.isLight) {
                            let switchTile = this.scene.map.getTileAt(g.tileObj.x / 64, g.tileObj.y / 64, false, 'InteractionTiles')
                            switchTile.index = this.scene.switchIds.switchState(switchTile.index, triggerZone);
                        } else {
                            found = g.getVisibleTiles(this.scene);
                            if (found.length > 0) {
                                found.forEach((x) => {
                                    x.visible = !x.visible;
                                });
                                g.body.enable = !g.body.enable;
                                g.isActive = !g.isActive;
                                g.adjustWorld();
                            }
                        }
                    }
                }
            }
        }
    }
    toggleZone(triggerZone, player) {
        let targetZone = this.getTargetZone(triggerZone.Target.key);
        if (targetZone) {
            targetZone.isActive = !targetZone.isActive;
            targetZone.body.enable = targetZone.isActive;
        }
    }
}