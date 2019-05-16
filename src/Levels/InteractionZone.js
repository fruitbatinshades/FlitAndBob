import Enums from './Tilemaps.js';

/**
 * Class populated from the tilemap Interaction Layer rectangles
 * @member {int} tileType the type of tile under the zone (tilemaps.js > )
 * @member {Phaser.Tilemaps.Tile} tileObj Ref to the map obj
 * @member {InteractionParams} Target Single target ID
 * @member {InteractionParams} GroupKey Key to group multiple targets
 * @member {InteractionParams} Action The action to use when client is over the zone and presses space (Show/Hide)
 * @member {InteractionParams} Effect The effect to use on the player (injure)
 * @member {InteractionParams} Transition The visual effect to use (toggleVisibility, fadeAndDisable)
 * @member {InteractionParams} Implementation Class to use for this tile (not implemented)
 * @member {InteractionParams} Affect What player does it affect (flit, bob)
 * @member {InteractionParams} Blocks Whether it blocks (physics)
 */
export default class InteractionZone extends Phaser.GameObjects.Zone {
    //Unique name of the zone
    name = null;
    tileObj = null;
    GroupKey = null;
    Target = null;
    Action = null;
    Effect = null;
    Transition = null;
    Implementation = null;
    Affect = null;
    Blocks = null;
    DeadWeight = null;
    //Whether the target has been shown to the camera so it only happens once
    _groupShown = false;
    tileType;
    isActive = true;
    _switchOn = false;

    get switchOn() {
        return this._switchOn;
    }
    set switchOn(value) {
        this._switchOn = value;
        //chain related switches
        
    }

    constructor(scene, tileObj, interaction, debug) {
        super(scene, tileObj.x, tileObj.y , tileObj.width , tileObj.height );
        
        if (tileObj.name === null || tileObj.name === '')
            throw `Zone at ${tileObj} does not have a name`;

        this.interaction = interaction;
        this.setOrigin(0);
        scene.physics.world.enable(this);
        this.body.setAllowGravity(false).moves = false;
        this.body.immovable = true;
        this.tileObj = tileObj;
        this.properties = tileObj.properties;
        this.name = tileObj.name;
        this.adjustZone();
        //if ZoneHeight is provided adjust the zone, used to make the zone smaller than the tile (switches, injure)
        //This will overwrite the defaults if set
        if (this.properties && this.properties.ZoneHeight) {
            if (this.properties.ZoneHeightAt) {
                switch (this.properties.ZoneHeightAt)
                {
                    case 'T':
                        this.body.reset(this.body.x, this.body.top);
                        break;
                    default:
                        this.body.reset(this.body.x, this.body.bottom - parseInt(this.properties.ZoneHeight));
                        break;
                }
            } else {
                this.body.reset(this.body.x, this.body.bottom - parseInt(this.properties.ZoneHeight));
            }
            this.body.height = parseInt(this.properties.ZoneHeight);
        }
        //hide tiles if the zone not visible in Tiled
        if (!tileObj.visible) {
            this.getVisibleTiles(scene).forEach(x => x.visible = false);
            this.active = false;
            this.isActive = false;
        }
        
        //The properties are intially null and only set up if the KV pair is in the properties
        if (tileObj.properties) {
            if (typeof tileObj.properties.GroupKey !== 'undefined')
                this.GroupKey = new InteractionParams(tileObj.properties.GroupKey);
            if (typeof tileObj.properties.Target !== 'undefined')
                this.Target = new InteractionParams(tileObj.properties.Target);
            if (typeof tileObj.properties.Affect !== 'undefined')
                this.Affect = new InteractionParams(tileObj.properties.Affect);
            if (typeof tileObj.properties.Action !== 'undefined')
                this.Action = new InteractionParams(tileObj.properties.Action);
            if (typeof tileObj.properties.Effect !== 'undefined')
                this.Effect = new InteractionParams(tileObj.properties.Effect);
            if (typeof tileObj.properties.Transition !== 'undefined')
                this.Transition = new InteractionParams(tileObj.properties.Transition);
            if (typeof tileObj.properties.Implementation !== 'undefined')
                this.Implementation = new InteractionParams(tileObj.properties.Implementation);
            if (typeof tileObj.properties.Blocks !== 'undefined') 
                this.Blocks = new InteractionParams(tileObj.properties.Blocks);
            if (typeof tileObj.properties.DeadWeight !== 'undefined')
                this.DeadWeight = new InteractionParams(tileObj.properties.DeadWeight);
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

            this.scene.events.on('preupdate', this.preUpdate, this);
        }
    }
    /** adjust the zones dimensions for the tile state */
    adjustZone() {
        //the tile on the switch layer to see what type it is
        let tile = this.scene.map.getTileAt(this.tileObj.x / 64, this.tileObj.y / 64, false, 'InteractionTiles');
        if (tile !== null) {
            this.tileType = this.scene.switchIds.tileType(tile.index);
            //adjust zone height for component
            let za = this.scene.switchIds.ZoneAdjust[tile.index];
            if (za) {
                //console.log(tile.index, za);
                if (za.hasOwnProperty('h'))
                    this.body.height = za.h;
                if (za.hasOwnProperty('w'))
                    this.body.width = za.w;
                if (za.hasOwnProperty('y'))
                    this.body.y = tile.pixelY + za.y;

                this.body.reset(this.body.x, this.body.top);
            }
        }
    }
    preUpdate() {
        if(this.scene && this.scene.game && this.scene.game.debugOn)
        this.scene.game.objs.push(this);
    }
    /**
     * Process this zone and its related ones
     * @param {Player} player player in zone
     * @param {bool} iterateGroup Only set this on the trigger zone else you'll get an endless loop and stack overflow
     */
    process(player, iterateGroup, parent) {
         if (this.isActive) {
        //     this.State = !this.State;
             this.body.debugBodyColor = !this.State ? 0xFF0000 : 0x00FF00;
             
             //get the target zone
             let target;
             if (this.Target !== null && this.Target.key !== null) {
                 target = this.interaction.getByKey(this.Target.key);
             }

            //If its a switch, change its state
            if (this.tileType && this.tileType.isSwitch) {
                let switchTile = this.scene.map.getTileAt(this.tileObj.x / 64, this.tileObj.y / 64, false, 'InteractionTiles');
                switchTile.index = this.interaction.scene.switchIds.switchState(switchTile.index, this);
                this.scene.sound.playAudioSprite('sfx', 'switch');
                this.adjustZone();
                let panRect;
                //pan if the target or group is off screen
                if (target && !this._groupShown) {
                    panRect = this.interaction.getTargetRectangle(target.name);
                }
                if (this.GroupKey !== null && this.GroupKey.key !== null && this.GroupKey.key !== '') {
                    if (!this._groupShown) {
                        //Pan the camera to the target if it's off screen
                        panRect = this.interaction.getGroupRectangle(this.GroupKey.key, this.name);
                    }
                }
                if (panRect) {
                    if (!Phaser.Geom.Rectangle.ContainsRect(this.scene.cameras.main.worldView, panRect)) {
                        this.scene.game.panAndReturn(this.scene, panRect);
                    }
                    this._groupShown = true;
                }
            }
             
            //if its an action or effect
            if (this.Action !== null || this.Effect !== null) {
                this.interaction.action(parent || this, player);
            } else if (parent) {
                if (parent.Action != null || parent.Effect !== null) {
                    this.interaction.action(parent, player);
                }
            }
            //if it has a transition
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
    //When a zone's behaviour has changed update the things around it
    adjustWorld() { 
        // let around = this.scene.physics.overlapRect(this.body.x, this.body.y - 2, this.body.width, this.body.height + 2);
        // for (let i = 0; i < around.length; i++){
        //     if (around[i].gameObject.constructor.name === 'Box' || around[i].gameObject.constructor.name === 'Rock') {
        //         around[i].gameObject.activate();
        //     }
        // }
        // console.log('adjust world', around);
    }
    /**
     * Get the tiles from the InteractionTiles layer
     * @param {LevelLoaderScene} scene The scene to use
     * @param {bool} includeSwitches Include the Enum.isSwitch tiles
     */
    getVisibleTiles(scene, includeSwitches, tileLayer) {
        if (includeSwitches) {
            return scene.map.getTilesWithinWorldXY(this.x, this.y, this.width, this.height, (t) => {
                return true;
            }, scene.cameras.main, tileLayer || 'InteractionTiles');
        } else {
            return scene.map.getTilesWithinWorldXY(this.x, this.y, this.width, this.height, (t) => {
                return x => !this.scene.switchIds.contains(t.index)
            }, scene.cameras.main, tileLayer || 'InteractionTiles');
        }
    }
}
/** 
 * Converts the Tiled property to its value and properties (if supplied) 
 * */
class InteractionParams{
    key = null;
    params = {}
    constructor(value) { 
        this.splitMapProperty(value);
    }
    /**
     * Whether the object from tiled has a propety named 'name'
     * @param {string} name the property to check for
     */
    has(name){
        if(this.params === null) return false;
        return this.params.hasOwnProperty(name);
    }
    /**
     * Splits the string property from tiled map
     * @param {string} value Value from the tiled custom properties
     */
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