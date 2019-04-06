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

        if (tileObj.properties.GroupKey)
            this.GroupKey = this.splitMapProperty(tileObj.properties.GroupKey);
        if (tileObj.properties.Target)
            this.Target = this.splitMapProperty(tileObj.properties.Target);
        if (tileObj.properties.Action)
            this.Action = this.splitMapProperty(tileObj.properties.Action);
        if (tileObj.properties.Effect)
            this.Effect = this.splitMapProperty(tileObj.properties.Effect);
        if (tileObj.properties.Transition)
            this.Transition = this.splitMapProperty(tileObj.properties.Transition);
        if (tileObj.properties.Implementation) 
            this.Implementation = this.splitMapProperty(tileObj.properties.Implementation);
        if (tileObj.properties.Blocks) {
            this.Blocks = this.splitMapProperty(tileObj.properties.Blocks);
            
        }
        
        //TODO: strip this out on build ???
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
    onBlocked(player, zone) {
        console.log('blocked');
        return true;
    }
    beforeBlock(player, zone) {
        console.log('blocked');
        return true;
    }
    /**
     * Get the tiles from the switch layer
     * @param {LevelLoaderScene} scene The scene to use
     */
    getVisibleTiles(scene) {
        //TODO: look for offset tiles (conveyor)
        return scene.map.getTilesWithinWorldXY(this.x, this.y, this.width, this.height, (t) => { return true; }, scene.cameras.main, 'Switches');
    }
    splitMapProperty(value) {
        if (value.endsWith('}')) {
            //contains json properties
            let firstBrace = value.indexOf('{');
            let s = value.substring(firstBrace);
            let json = JSON.parse(s);
            let key = value.substring(0, firstBrace);
            return { key: key, params: json };
        }
        return { key: value };
    }
}
