/// <reference path="../../defs/phaser.d.ts" />
import Settings from '../settings.js';
import Enums from '../Levels/Tilemaps.js';
import InteractionZone from './InteractionZone.js';

export default class Interaction extends Phaser.Physics.Arcade.Group {
    tileLayer;
    /** Lookup to functions that process map key: Action */
    actions = {
        "ShowHide": this.showHide,
        "ToggleZone": this.ToggleZone
    };
    /** Lookup to effects that process map key: Effect */
    effects = {
        "Injure": this.injure,
        "Fast": this.fast,
        "Slow": this.slow,
        "Kill": this.kill
    };
    /** Lookup to transitions that process map key: Transition */
    transitions = {
        "fadeAndDisable": this.fadeAndDisable,
        "toggleVisibility": this.toggleVisibility,
        "slideOut": this.slideOut
    };
    /**
     * Class that manages interactable objects such as switches
     * @param {LevelLoaderScene} scene
     * @param {Array} children
     * @param {*} interactionLayer
     * @param {*} objectMap
     */
    constructor(scene, children, interactionLayer, objectMap, debug) {
        super(scene, children);

        this.scene = scene;
        this.tileLayer = interactionLayer;
        this.lookup = {};

        //Create a zone from the tiled object rectangles
        for (let i = 0; i < objectMap.objects.length; i++) {
            let current = objectMap.objects[i];
            //create zone and add to key lookup
            let z = new InteractionZone(this.scene, current, debug);

            if (z.Blocks && z.Blocks.key) {
                z.body.static = true;
                z.body.setImmovable(true);
                scene.physics.add.collider(scene.player, z);
                scene.physics.add.collider(scene.flit, z);
                console.log('Collide on ' + z.name)
            }
            else {
                scene.physics.add.overlap(scene.player, this, this.overTarget, null, this);
                scene.physics.add.overlap(scene.flit, this, this.overTarget, null, this);
                console.log('Overlap on ' + z.name)
            }

            this.add(z);
            this.lookup[current.name] = z;
        }
   }
    /**
     * Fired when a player enters a zone
     * @param {Phaser.GameObjects.Sprite} player The player
     * @param {InteractionZone} zone The zone entered
     */
    overTarget(player, zone) {
        let t = this.lookup[zone.name];
        if (!t.Effect || t.Effect === null) {
            //If its an effect require space key
            if (Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) {
                this.action(t, player);
            }
        } else {
            //else fire constantly
            this.action(t, player);
        }
    }
    /**
     * Process the action from the zone
     * @param {InteractionZone} triggerZone The zone information built from the map
     * @param {Phaser.GameObjects.Sprite} player The player in the zone
     */
    action(triggerZone, player) {
        if (triggerZone.Action !== null) {
            this.runAction(triggerZone.Action.key, [triggerZone, player]);
        }
        if (triggerZone.Effect !== null) {
            this.runEffect(triggerZone.Effect.key, [triggerZone, player]);
        }
    }
    /**
     * Run the action defined in the zone
     * @param {string} name Name of the action
     * @param {Array} args Array of arguments
     */
    runAction(name, args) {
        let instance = this.actions[name];
        if (instance)
            try {
                return instance.apply(this, args);
            } catch (e) {
                console.error(e);
            }
        else
            console.log(name + ` action not found`);
    }
    /**
    * Run the effect defined in the zone
    * @param {string} name Name of the action
    * @param {Array} args Array of arguments
    */
    runEffect(name, args) {
        let instance = this.effects[name];
        if (instance)
            try {
                return instance.apply(this, args);
            } catch (e) {
                console.error(e);
            }
        else
            console.log(name + ` effect not found`);
    }
    /**
     * Run the transition defined in the zone
     * @param {string} name Name of the action
     * @param {Array} args Array of arguments
     */
    runTransition(name, args) {
        let instance = this.transitions[name];
        if (instance)
            try {
                return instance.apply(this, args);
            } catch (e) {
                console.error(e);
            }
        else
            console.log(name + ` transition not found`);

    }
    kill(triggerZone, player) { 
        if (triggerZone.Target === null || player.is(triggerZone.Target.key)) {
            player.kill();
        }
    }
    /**
     * Player speeds up
     * @param {InteractionZone} triggerZone
     * @param {Phaser.GameObjects.Sprite} player
     */
    fast(triggerZone, player) {
        player.isFast = true;
    }
    /**
     * Player slows down
     * @param {InteractionZone} triggerZone
     * @param {Phaser.GameObjects.Sprite} player
     */
    slow(triggerZone, player) {
        player.isSlow = true;
    }
    /**
     * Player is injured
     * @param {InteractionZone} triggerZone
     * @param {Phaser.GameObjects.Sprite} player
     */
    injure(triggerZone, player) {
        if (triggerZone.Target === null || player.is(triggerZone.Target.key)) {
            player.injure(5);
        }
    }
    /**
     * Show/Hides target zone and disables it using a transition
     * @param {InteractionZone} triggerZone
     * @param {Phaser.Game.Sprite} player
     */
    showHide(triggerZone, player) {
        if (triggerZone.Action.key === 'ShowHide') {
            Object.entries(this.lookup).forEach((targetZone) => {
                let found = [];
                //switch state on the activating object
                if (targetZone[1].name === triggerZone.name) {
                    let activator = triggerZone.getVisibleTiles(this.scene, this.tileLayer);
                    activator.forEach((x) => {
                        x.index = this.scene.switchIds.switchState(x.index);
                    });
                } else if (targetZone[1].name === triggerZone.Target.key) {
                    //toggle the zone so it doesn't react if hidden
                    targetZone[1].body.enable = !targetZone[1].body.enable;
                    //find related objects switch their state as well
                    found = targetZone[1].getVisibleTiles(this.scene, this.tileLayer);
                } else if (triggerZone.GroupKey !== null && targetZone[1].GroupKey === triggerZone.GroupKey) {
                    //get group tiles
                    found = targetZone[1].getVisibleTiles(this.scene, this.tileLayer);
                }
                if (found.length > 0) {
                    this.runTransition(targetZone[1].Transition.key, [found, targetZone[1]]);
                }
            });
        }
    }
    toggleZone(triggerZone, player) {
        targetZone[1].Zone.body.enable = !targetZone[1].Zone.body.enable;
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
     * @param {Phaser.GameObjects.Tile[]} tiles
     * @param {string} direction
     */
    fadeAndDisable(tiles, zone) {
        let alphaTarget = tiles[0].visible ? 0 : 1;

        //if showing, make them visible else they will pop in at the end
        if (alphaTarget === 1) {
            tiles.forEach((x) => {
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
            onComplete: function (tween, targets, items) {
                items.forEach((x) => {
                    x.visible = x.alpha === 1;
                });
            },
            onCompleteParams: [tiles]
        });
    }
    // slideOut(tiles, zone) {
    //     let targetX, targetY;
    //     switch (zone.Transition.params.direction) {
    //         case 'up':
    //             targetY = zone.Zone.body.top - tiles[0].height
    //             break;
    //         case 'down':
    //             targetY = zone.Zone.body.bottom;
    //             break;
    //     }
    //     if (targetY) {
    //         this.scene.tweens.add({
    //             targets: tiles,
    //             pixelY: targetY,
    //             ease: 'Power1',
    //             duration: 1000,
    //             onComplete: function (tween, targets, items) {
    //                 items.forEach((x) => {
    //                     x.visible = !x.visible;
    //                 });
    //             },
    //             onCompleteParams: [tiles]
    //         });
    //     }
    // }
}