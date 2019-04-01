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
        }
        scene.physics.add.overlap(scene.player, this, this.overTarget, null, this);
        scene.physics.add.overlap(scene.flit, this, this.overTarget, null, this);
    }
    overTarget(player, zone) {
        if (Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) {
            this.action(zone);
        }
    }
    action(zone) {
        let t = this.lookup[zone.name];
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
                //switch state on the activating object 
                if (z[1].Name === t.Name) {
                    let found = t.getVisibleTiles(this.scene, this.tileLayer);
                    found.forEach((x) => {
                        x.index = this.scene.switchIds.switchState(x.index);
                    });
                }
                //show/hide related tiles
                if (z[1].Name !== t.Name && (z[1].GroupKey === t.GroupKey || z[1].Target === t.Target)) {
                    //find related objects switch their state as well
                    let found = z[1].getVisibleTiles(this.scene, this.tileLayer);
                    found.forEach((x) => {
                        x.visible = !x.visible;
                    });
                }
            });
        }
     
    }
}
class InteractionObject{
    GroupKey =  null;
    Target = null;
    Action = null;
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