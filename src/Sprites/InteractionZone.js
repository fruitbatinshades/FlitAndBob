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
    //Unique name of the zone
    name = null;
    //Ref to the tile
    TileObj = null;
    Blocks = null;
    Related;
    Implementation;
    //The visual effect to use (toggleVisibility, fadeAndDisable)
    Transition = { key: 'toggleVisibility' };
    constructor(scene, tileObj, debug) {
        super(scene, tileObj.x + 2, tileObj.y + 2, tileObj.width - 4, tileObj.height - 4);
        
        this.setOrigin(0);
        scene.physics.world.enable(this);
        this.body.setAllowGravity(false).moves = false;
        this.tileObj = tileObj;
        this.properties = tileObj.properties;
        this.name = tileObj.name;

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
     * Get the tiles from the switch layer
     * @param {LevelLoaderScene} scene The scene to use
     */
    getVisibleTiles(scene) {
        //TODO: look for offset tiles (conveyor)
        return scene.map.getTilesWithinWorldXY(this.x, this.y, this.width, this.height, (t) => { return true; }, scene.cameras.main, 'Switches');
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