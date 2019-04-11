import Enums from '../Levels/Tilemaps.js';

/**
 * Class populated from the tilemap Interaction Layer rectangles
 */
export default class InteractionZone extends Phaser.GameObjects.Zone {
    //Key to group multiple targets
    GroupKey = null;
    //Single target ID
    Target = null;
    //The action to use when client is over the zone and presses space (Show/Hide)
    Action = null;
    //The effect to use on the player (injure)
    Effect = null;
    //The visual effect to use (toggleVisibility, fadeAndDisable)
    Transition = null;
    //Unique name of the zone
    name = null;
    //Ref to the tile
    TileObj = null;
    Blocks = null;
    Related;
    Implementation;
    lookup;
    Active = true;
    State = false;
    isSwitch = false;
    isStop = false;
    constructor(scene, tileObj, interaction, debug) {
        super(scene, tileObj.x + 2, tileObj.y + 2, tileObj.width - 4, tileObj.height - 4);
        
        if (tileObj.name === null || tileObj.name === '')
            throw `Zone at ${tileObj} does not have a name`;

        this.interaction = interaction;
        this.setOrigin(0);
        scene.physics.world.enable(this);
        this.body.setAllowGravity(false).moves = false;
        this.tileObj = tileObj;
        this.properties = tileObj.properties;
        this.name = tileObj.name;
        //if ZoneHeight is provided adjust the zone, used to make the zone smaller than the tile
        if (this.properties && this.properties.ZoneHeight) {
            this.body.reset(this.body.x, this.body.bottom - this.properties.ZoneHeight);
            this.body.height = this.properties.ZoneHeight;
        }
        //hide tiles if the zone not visible
        if (!tileObj.visible) {
            this.getVisibleTiles(scene).forEach(x => x.visible = false);
            this.active = false;
        }

        //the tile on the switch layer to see what type it is
        let a = scene.map.getTileAt(tileObj.x / 64, tileObj.y / 64, false, 'Switches');
        if (a !== null) {
            switch (this.scene.switchIds.tileType(a.index)) {
                case 'switch':
                    this.isSwitch = true;
                    break
                case 'stop':
                    this.isStop = true;
                    break;
            }
            console.log(this.name, this.isSwitch, this.isStop);
        }
        
        if (tileObj.properties) {
            if (typeof tileObj.properties.GroupKey !== 'undefined')
                this.GroupKey = new InteractionParams(tileObj.properties.GroupKey);
            if (typeof tileObj.properties.Target !== 'undefined')
                this.Target = new InteractionParams(tileObj.properties.Target);
            if (typeof tileObj.properties.Action !== 'undefined')
                this.Action = new InteractionParams(tileObj.properties.Action);
            if (typeof tileObj.properties.Effect !== 'undefined')
                this.Effect = new InteractionParams(tileObj.properties.Effect);
            if (typeof tileObj.properties.Transition !== 'undefined')
                this.Transition = new InteractionParams(tileObj.properties.Transition);
            if (typeof tileObj.properties.Implementation !== 'undefined')
                this.Implementation = new InteractionParams(tileObj.properties.Implementation);
            if (typeof tileObj.properties.Blocks !== 'undefined') {
                this.Blocks = new InteractionParams(tileObj.properties.Blocks);
            }
        }
        
        //TODO: strip this out on build ???
        //Add tooltips on debug to show the properties from Tiled
        if (debug) {
            scene.add.text(tileObj.x, tileObj.y, tileObj.name, {
                font: '10px monospace',
                fill: '#000000'
            }).setShadow(2, 2, '#333333', 2, true, false)
                .setStroke('#FFFFFF', 3)
                .setFontStyle('bold').depth = 999;
            let props = scene.add.text(0, 0, JSON.stringify(tileObj.properties, null, 4), {
                font: '8px monospace',
                fill: '#000000'
            });
            let r = scene.add.rectangle(0, 0, props.width + 8, props.height + 8, 0xFFFFFF).setOrigin(0);
            let t = scene.add.container(tileObj.x, tileObj.y - 15, [r, props]);
            t.depth = 998;
            t.y = this.y - r.height;
            t.visible = false;
            this.toolInfo = t;
            this.setInteractive();
        }
    }
    /**
     * Process this zone and its related ones
     * @param {Player} player player in zone
     * @param {bool} iterateGroup Only set this on the trigger zone else you'll get an endless loop and stack overflow
     */
    process(player, iterateGroup, parent) {
        if (this.active) {
            this.State = !this.State;
            this.body.debugBodyColor = !this.State ? 0xFF0000 : 0x00FF00;

            if (this.isSwitch) {
                let switchTile = this.scene.map.getTileAt(this.tileObj.x / 64, this.tileObj.y / 64, false, 'Switches')
                switchTile.index = this.interaction.scene.switchIds.switchState(switchTile.index);
            }
            let target;
            if (this.Target !== null && this.Target.key !== null) {
                console.log('I have a target');
                //find the objects that have matching keys and convert to array
                target = this.interaction.getByKey(this.Target.key);
            }
            if (this.isSwitch && iterateGroup) {
                if (this.GroupKey !== null && this.GroupKey.key !== null) {
                    //find the objects that have matching keys and convert to array
                    let group = this.interaction.getGroup(this.GroupKey.key);
                    if (group && group.length != 0) {
                        for (let i = 0; i < group.length; i++) {
                            if (group[i][1].name !== this.name) {
                                //dont pass in the player for grouped actions
                                group[i][1].process(null, false);
                            }
                        }
                    }
                } 
            }
            if (this.Action !== null || this.Effect !== null) {
                this.interaction.action(parent || this, player);
             }
            if (target && this.Transition !== null && this.Transition.key !== null) {
                let tiles = target.getVisibleTiles(this.interaction.scene);
                if (tiles.length != 0) {
                    this.interaction.runTransition(this.Transition.key,[tiles, this]);
                }
            }
            // if (this.Implementation !== null) {
            // }
        }
    }
    /**
     * Get the tiles from the switch layer
     * @param {LevelLoaderScene} scene The scene to use
     * @param {bool} includeSwitches Include the Enum.isSwitch tiles
     */
    getVisibleTiles(scene, includeSwitches, tileLayer) {
        //TODO: look for offset tiles (conveyor)
        if (includeSwitches) {
            return scene.map.getTilesWithinWorldXY(this.x, this.y, this.width, this.height, (t) => { return true; }, scene.cameras.main, tileLayer || 'Switches');
        } else {
            return scene.map.getTilesWithinWorldXY(this.x, this.y, this.width, this.height, (t) => { return x => !this.scene.switchIds.contains(t.index) }, scene.cameras.main, tileLayer || 'Switches');
        }
    }
}
/** Converts the Tiled property to its value and properties (if supplied) */
class InteractionParams{
    key = null;
    params = {}
    constructor(value) { 
        this.splitMapProperty(value);
    }
    has(name){
        if(this.params === null) return false;
        return this.params.hasOwnProperty(name);
    }
    splitMapProperty(value) {
        //if the property has a brace, extract json
        if (!value.endsWith('}')) {
            this.key = value;
            if (this.key === '') this.key = null;
        }else{
            //contains json properties
            let firstBrace = value.indexOf('{');
            let s = value.substring(firstBrace);
            this.params = JSON.parse(s);
            value = value.substring(0, firstBrace);

            if (value === '') value = null;
            this.key = value;
        }
    }
}