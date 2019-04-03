/// <reference path="../../defs/phaser.d.ts" />
import Settings from '../settings.js';
import Enums from '../Levels/Tilemaps.js';

export default class Interaction extends Phaser.Physics.Arcade.Group {
    tileLayer;
    /** Lookup to functions that process map key: Action */
    actions = {
        "ShowHide": this.showHide
    };
    /** Lookup to effects that process map key: Effect */
    effects = {
        "Injure": this.injure,
        "Fast": this.fast,
        "Slow": this.slow
    };
    /** Lookup to transitions that process map key: Transition */
    transitions = {
        "fadeAndDisable": this.fadeAndDisable,
        "toggleVisibility": this.toggleVisibility
    };
    /**
     * Class that manages interactable objects such as switches
     * @param {LevelLoaderScene} scene
     * @param {Array} children 
     * @param {*} interactionLayer 
     * @param {*} objectMap 
     */
    constructor(scene, children, interactionLayer, objectMap) {
        super(scene, children);

        this.scene = scene;
        this.tileLayer = interactionLayer;
        this.lookup = {};

        //Create a zone from the tiled object rectangles
        for (let i = 0; i < objectMap.objects.length; i++) {
            let current = objectMap.objects[i];

            //create the zone so we can interact with it
            let zone = scene.add.zone(current.x + 2, current.y + 2).setSize(current.width - 4, current.height - 4);

            scene.physics.world.enable(zone);
            zone.body.setAllowGravity(false).moves = false;

            zone.properties = current.properties;
            zone.name = current.name;

            this.lookup[current.name] = new InteractionObject(this.scene, current, zone);

            this.add(zone);
        }
        scene.physics.add.overlap(scene.player, this, this.overTarget, null, this);
        scene.physics.add.overlap(scene.flit, this, this.overTarget, null, this);
    }
    /**
     * Fired when a player enters a zone
     * @param {Phaser.GameObjects.Sprite} player The player
     * @param {InteractionObject} zone The zone entered
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
     * @param {InteractionObject} triggerZone The zone information built from the map
     * @param {Phaser.GameObjects.Sprite} player The player in the zone 
     */
    action(triggerZone, player) {
        if (triggerZone.Action !== null) {
            this.runAction(triggerZone.Action, [triggerZone, player]);
        }
        if (triggerZone.Effect !== null) {
            this.runEffect(triggerZone.Effect, [triggerZone, player]);
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
    /**
     * Player speeds up
     * @param {InteractionObject} triggerZone
     * @param {Phaser.GameObjects.Sprite} player 
     */
    fast(triggerZone, player) {
        player.isFast = true;
    }
    /**
     * Player slows down
     * @param {InteractionObject} triggerZone
     * @param {Phaser.GameObjects.Sprite} player 
     */
    slow(triggerZone, player) {
        player.isSlow = true;
    }
    /**
     * Player is injured
     * @param {InteractionObject} triggerZone
     * @param {Phaser.GameObjects.Sprite} player 
     */
    injure(triggerZone, player) {
        if (triggerZone.Target === null || player.is(triggerZone.Target)) {
            player.injure(5);
        }
    }
    /**
     * 
     * @param {string} triggerZone 
     * @param {Phaser.Game.Sprite} player 
     */
    showHide(triggerZone, player) {
        if (triggerZone.Action === 'ShowHide') {
            Object.entries(this.lookup).forEach((targetZone) => {
                let found = [];
                //switch state on the activating object 
                if (targetZone[1].Name === triggerZone.Name) {
                    let activator = triggerZone.getVisibleTiles(this.scene, this.tileLayer);
                    activator.forEach((x) => {
                        x.index = this.scene.switchIds.switchState(x.index);
                    });
                } else if (targetZone[1].Name === triggerZone.Target) {
                    //toggle the zone so it doesn't react if hidden
                    targetZone[1].Zone.body.enable = !targetZone[1].Zone.body.enable;
                    //find related objects switch their state as well
                    found = targetZone[1].getVisibleTiles(this.scene, this.tileLayer);
                } else if (triggerZone.GroupKey !== null && targetZone[1].GroupKey === triggerZone.GroupKey) {
                    //get group tiles
                    found = targetZone[1].getVisibleTiles(this.scene, this.tileLayer);
                }
                if (found.length > 0) {
                    this.runTransition(targetZone[1].Transition, [found]);
                }
            });
        }
    }
    toggleVisibility(tiles) {
        tiles.forEach((x) => {
            x.visible = !x.visible;
        });
    }
    fadeAndDisable(tiles, direction) {
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
            duration: 1000,
            delay: function (i, total, target) {
                return i * 500;
            },
            onComplete: function (tween, targets, items) {
                items.forEach((x) => {
                    x.visible = x.alpha === 1;
                });
            },
            onCompleteParams: [tiles]
        });
    }
}

/**
 * Class populated from the tilemap Interaction Layer rectangles
 */
class InteractionObject {
    //Key to group multiple targets
    GroupKey = null;
    //Single target ID
    Target = null;
    //The action to use when client is over the zone and presses space (Show/Hide)
    Action = null;
    //The effect to use on the player (injure)
    Effect = null;
    //Unique name of the zone
    Name = null;
    //Ref to the tile
    TileObj = null;
    Related;
    Zone = null;
    //The visual effect to use (toggleVisibility, fadeAndDisable)
    Transition = 'toggleVisibility';
    constructor(scene, tileObj, zone) {
        this.tileObj = tileObj;
        this.Name = zone.name;
        this.Zone = zone;

        if (zone.properties.GroupKey) this.GroupKey = zone.properties.GroupKey;
        if (zone.properties.Target) this.Target = zone.properties.Target;
        if (zone.properties.Action) this.Action = zone.properties.Action;
        if (zone.properties.Effect) this.Effect = zone.properties.Effect;
        if (zone.properties.Transition) this.Transition = zone.properties.Transition;
    }
    /**
     * Get the tiles from the switch layer
     * @param {LevelLoaderScene} scene The scene to use
     */
    getVisibleTiles(scene) {
        //TODO: look for offset tiles (conveyor)
        return scene.map.getTilesWithinWorldXY(this.Zone.x, this.Zone.y, this.Zone.width, this.Zone.height, (t) => { return true; }, scene.cameras.main, 'Switches');
    }
}