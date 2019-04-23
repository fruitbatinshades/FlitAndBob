/// <reference path="../../defs/phaser.d.ts" />
import Settings from '../settings.js';
import Enums from '../Levels/Tilemaps.js';
import InteractionZone from './InteractionZone.js';

export default class Interaction extends Phaser.Physics.Arcade.Group {
    tileLayer;
    /** Lookup to functions that process map key: Action */
    actions = {
        "ShowHide": this.showHide,
        "Toggle": this.toggleZone
    };
    /** Lookup to effects that process map key: Effect */
    effects = {
        "Injure": this.injure,
        "Fast": this.fast,
        "Slow": this.slow,
        "Kill": this.kill,
        "Slippy": this.slippy
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
    constructor(scene, children, interactionLayer, objectMap, debug) {
        super(scene, children);

        this.scene = scene;
        this.tileLayer = interactionLayer;
        this.lookup = {};
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.inExit = false;

        //Create a zone from the tiled object rectangles
        for (let i = 0; i < objectMap.objects.length; i++) {
            let current = objectMap.objects[i];
            //create zone and add to key lookup
            let z = new InteractionZone(this.scene, current, this, debug);

            //ADD TO THE GROUP BEFORE SETTING PHYSICS OR THEY WILL BE RESET AND YOU'LL GET A COLLSION BUT IT WON'T STOP YOU!!!
            this.add(z);
            //If there is a blocks property set up collision
            if (z.Blocks) {
                z.body.setImmovable(true); //do this else you pass through
                scene.physics.add.collider(scene.bob, z, this.blocks, this.preBlock, this);
                scene.physics.add.collider(scene.flit, z, this.blocks, this.preBlock, this);
                //if the zone blocks boxes
                if (z.Blocks.key === 'Box') {
                    scene.physics.add.collider(scene.mapLayers['Boxes'], z, scene.mapLayers['Boxes'].tileCollide, null, scene.mapLayers['Boxes']);
                } else if (z.Blocks.key) {
                    //if properties provided set the relevant one
                    z.body.checkCollision.up = z.Blocks.key.indexOf('T') !== -1;
                    z.body.checkCollision.right = z.Blocks.key.indexOf('R') !== -1;
                    z.body.checkCollision.down = z.Blocks.key.indexOf('B') !== -1;
                    z.body.checkCollision.left = z.Blocks.key.indexOf('L') !== -1;
                }
                if (!current.visible) z.body.enable = false;
            }
            else {
                if (z.tileType && z.tileType.isBlockActivated) {
                    let a = scene.physics.add.collider(scene.mapLayers['Boxes'], z, scene.mapLayers['Boxes'].tileCollide, null, scene.mapLayers['Boxes']);
                } else {
                    //set up overlap for callback
                    scene.physics.add.overlap(scene.bob, z, this.overZone, null, this);
                    scene.physics.add.overlap(scene.flit, z, this.overZone, null, this);
                }
            }
            this.lookup[current.name] = z;
        }
    }
    /**
     * Get a zone by it's key
     * @param {string} name Name of zone
     * @returns {InteractionZone} The zone if found or null
     */
    getByKey(name) {
        let f = Object.keys(this.lookup).find(zName => zName === name);
        return this.lookup[f] || null;
    }
    /**
     * Get all zones in a group
     * @param {string} name The GroupKey to get
     * @param {string} exclude The zone name to exclude
     */
    getGroup(name, exclude) {
        if (name === null) return null;
        return Object.entries(Object.filter(this.lookup, (z) => z.hasOwnProperty('GroupKey') && z.GroupKey !== null && z.GroupKey.key && z.GroupKey.key === name && z.name != exclude));
    }
    /**
     * Get the switches in a group
     * @param {string} name The GroupKey to get
     * @param {string} exclude The zone name to exclude
     */
    getGroupSwitches(name,exclude) {
        if (name === null) return null;
        return Object.entries(Object.filter(this.lookup, (z) => z.hasOwnProperty('GroupKey') && z.GroupKey !== null && z.GroupKey.key && z.GroupKey.key === name && z.tileType.isSwitch && z.name != exclude));
    }
    /**
     * Get an average co-ordinate for a group
     * @param {string} name The GroupKey to get
     * @param {string} exclude The zone name to exclude
     * @returns {object} rectangle
     */
    getGroupRectangle(name, exclude) {
        let group = this.getGroup(name, exclude);
        if (group == null) return null;
        let X = [], Y = [];
        for (let i = 0; i < group.length; i++){
            let c = group[i][1]; 
            X.push(c.x);
            X.push(c.x + c.width);
            Y.push(c.y);
            Y.push(c.y + c.height);
        }
        return new Phaser.Geom.Rectangle(Math.min(...X), Math.min(...Y), Math.max(...X) - Math.min(...X), Math.max(...Y) - Math.min(...Y));
    }
    getTargetRectangle(name) {
        let target = this.getByKey(name);
        if (target) return new Phaser.Geom.Rectangle(target.x, target.y, target.width, target.height);
        return;
    }
    blocks(player, zone) {
        //player is blocked
    }
    /**
     * Check to see if the zone affects the player
     * @param {Phaser.GameObjects.Sprite} player The player that has entered the zone
     * @param {InteractionZone} zone The zone that has been enetered
     */
    preBlock(player, zone) {
        //Check if specific player set or block either
        if (zone.Affect === null || zone.Affect.key === null || player.is(zone.Affect.key)) {
            return true;
        }
        return false;
    }
    /**
     * Fired when a player enters a zone
     * @param {Phaser.GameObjects.Sprite} player The player
     * @param {InteractionZone} zone The zone entered
     */
    overZone(player, zone) {
        //check its the active player
        if (player.is(this.scene.ActivePlayer.name)) {
            let t = this.lookup[zone.name];
            //If its an effect require space key
            if (t.Effect === null) {
                if (this.scene.input.keyboard.checkDown(this.spaceKey, 1000)) {
                    //if affect is supplied make sure its our player
                    if (t.Affect === null || (t.Affect !== null && t.Affect.key === player.name)) {
                        zone.process(player, true);
                    }
                }
            } else {
                //else fire constantly
                zone.process(player, true);
            }
        }
        if (!this.inExit && zone.name === 'Exit') {
            //check both Flit and Bob are here
            if (zone.body.hitTest(this.scene.bob.x, this.scene.bob.y) && zone.body.hitTest(this.scene.flit.x, this.scene.flit.y)) {
                this.inExit = true;
                this.scene.events.emit('levelcomplete');
            }
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
        if (name !== null) {
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
    }
    /**
    * Run the effect defined in the zone
    * @param {string} name Name of the action
    * @param {Array} args Array of arguments
    */
    runEffect(name, args) {
        if (name !== null) {
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
    }
    /**
     * Run the transition defined in the zone
     * @param {string} name Name of the action
     * @param {Array} args Array of arguments
     */
    runTransition(name, args) {
        if (name !== null) {
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
     * PLayer slides and cannot turn aroud
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
    getTargetZone(name) {
        return this.lookup[name];
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
            else if (triggerZone.GroupKey != null){
                //no target so check group
                let group = this.getGroup(triggerZone.GroupKey.key, triggerZone.name)
                if (group.length !== 0) {
                    for (let i = 0; i < group.length; i++) {
                        let g = group[i][1];
                        if (g.tileType && g.tileType.isLight) {
                            let switchTile = this.scene.map.getTileAt(g.tileObj.x / 64, g.tileObj.y / 64, false, 'InteractionTiles')
                            switchTile.index = this.scene.switchIds.switchState(switchTile.index, triggerZone);
                        }else{
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
            targetZone.active = !targetZone.active;
        }
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