/// <reference path="../../defs/phaser.d.ts" />
import Settings from '../settings.js';
import Enums from '../Levels/Tilemaps.js';

export default class Interaction extends Phaser.Physics.Arcade.Group
{
    tileLayer;
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
            let zone = scene.add.zone(current.x, current.y).setSize(current.width, current.height);
            
            scene.physics.world.enable(zone);
            zone.body.setAllowGravity(false).moves = false;

            zone.properties = current.properties;
            zone.name = current.name;
            
            this.lookup[current.name] = new InteractionObject(this.scene, current, zone);
            
            this.add(zone);

            // if (this.lookup[current.name].Effect === 'Block') {
            //     scene.physics.add.collider(scene.flit, zone);
            // }
        }
        scene.physics.add.overlap(scene.player, this, this.overTarget, null, this);
        scene.physics.add.overlap(scene.flit, this, this.overTarget, null, this);
    }
    block(player, zone) {
        return false;
    }
    overTarget(player, zone) {
        let t = this.lookup[zone.name];
        if (!t.Effect || t.Effect === null) {
            if (Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) {
                this.action(t,player);
            }
        } else {
            this.action(t, player);
        }
    }
    action(t, player) {
        
        if (t.Action === 'Toggle') {
            //loop through the lookup finding the same groups
            Object.entries(this.lookup).forEach((z) => {
                if (z[1].GroupKey === t.GroupKey || z[1].Target === t.Target) {
                    //find related objects switch their state as well
                    let found = z[1].getVisibleTiles(this.scene, this.tileLayer);
                    found.forEach((x) => {
                        x.index = this.scene.switchIds.switchState(x.index);
                    });
                }
            });
        }
        if (t.Action === 'ShowHide') {
            Object.entries(this.lookup).forEach((z) => {
                let found = [];
                //switch state on the activating object 
                if (z[1].Name === t.Name) {
                    let activator = t.getVisibleTiles(this.scene, this.tileLayer);
                    activator.forEach((x) => {
                        x.index = this.scene.switchIds.switchState(x.index);
                    });
                } else if (z[1].Name === t.Target) {
                        //Get target tiles
                        z[1].Zone.active = !z[1].Zone.active;
                        //find related objects switch their state as well
                        found = z[1].getVisibleTiles(this.scene, this.tileLayer);
                } else if (t.GroupKey !== null && z[1].GroupKey === t.GroupKey) {
                    //get group tiles
                    found = z[1].getVisibleTiles(this.scene, this.tileLayer);
                }
                if (found.length > 0) {
                    found.forEach((x) => {
                        x.visible = !x.visible;
                    });
                }
            });
        }
        if (t.Effect === 'Injure') {
            if (t.Target === null || player.is(t.Target)) {
                player.injure(10);
            }
            // if (t.Target === 'Bob') console.log('injure bob');
            // if (t.Target === 'Flit') console.log('injure flit');
        }
        
        if (t.Effect === 'Slow') {
            player.isSlow = true;
        }
        if (t.Effect === 'Fast') {
            player.isFast = true;
        }
        if (t.Effect === 'Block') {
            player.body.velocity.x = 0;
        }
        // if (t.Effect === 'Force') {
        //     player.setGravity(0, 600);
        // }
    }
}
class InteractionObject{
    GroupKey =  null;
    Target = null;
    Action = null;
    Effect = null;
    Name = null;
    TileObj = null;
    Related;
    Zone = null;
    constructor(scene, tileObj, zone) { 
        this.tileObj = tileObj;
        this.Name = zone.name;
        this.Zone = zone;

        if (zone.properties.GroupKey) this.GroupKey = zone.properties.GroupKey;
        if (zone.properties.Target) this.Target = zone.properties.Target;
        if (zone.properties.Action) this.Action = zone.properties.Action;
        if (zone.properties.Effect) this.Effect = zone.properties.Effect;
    }
    /**
     * Get the tiles from the switch layer
     * @param {LevelLoaderScene} scene The scne to use
     */
    getVisibleTiles(scene) { 
        //TODO: look for offset tiles (conveyor)
        return scene.map.getTilesWithinWorldXY(this.Zone.x, this.Zone.y, this.Zone.width, this.Zone.height, (t) => { return true; }, scene.cameras.main, 'Switches');
    }
}