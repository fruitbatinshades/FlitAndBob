/// <reference path="../../defs/phaser.d.ts" />
import Player from '../Sprites/Player.js';
import Flit from '../Sprites/Flit.js';
import Boxes from '../Sprites/boxes.js';
/**
 * Class that hold the level specific data and operations
 */
export default class Level{
    /** The zones created from the maps interaction layer */
    zones;
    flies = 0;
    shrooms = 0;
    fliesCollected = 0;
    shroomsCollected = 0;
    mapIds;
    backgrounds;
    ActivePlayer = null;
    _ChangingPlayer = true;

    //NB: Call from preload
    constructor(scene) { 
        //load backgrounds from map.properties.Backgrounds (Pipe delimeted filename from tiled)
        scene.load.setPath('assets/levels/backgrounds/');
        scene.map.properties["Backgrounds"].split('|').forEach((b) => {
            let name = b.substr(0, b.lastIndexOf('.'));
            b.endsWith('.svg') ? scene.load.svg(name, b) : scene.load.image(name, b);
            //console.log(name, b);
        });

        //load tilesets
        scene.load.setPath('assets/levels/');
        scene.map.tilesets.forEach((b) => {
            scene.load.image(b.name); 
            //console.log(b.name);
        });

        // set the boundaries of our game world
        scene.physics.world.bounds.width = scene.map.widthInPixels;
        scene.physics.world.bounds.height = scene.map.heightInPixels;
        // set bounds so the camera won't go outside the game world
        scene.cameras.main.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);

        // listen for player input
        scene.cursors = scene.input.keyboard.createCursorKeys();
        scene.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        scene.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        scene.ctrlKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CONTROL);
    }
    /**
     * Crete the maps, player and set up collisions
     * @param {PhaserScene} scene The scene to populate
     */
    buildLevel(scene) {
        //Add backgrounds
        scene.background = scene.add.group('background');
        scene.map.properties["Backgrounds"].split('|').forEach((b) => {
            //TODO: position tilesprite from properties
            let name = b.substr(0, b.lastIndexOf('.'));
            let layer =  scene.add.tileSprite(0, 0, scene.game.canvas.clientWidth, 512, name);
            layer.setOrigin(0, 0);
            layer.alpha = 1;
            layer.fixedToCamera = true;
        });
        let sets = [];
        scene.map.tilesets.forEach((b) => {
            //console.log(`Added tilesetImage ${b.name}`);
            scene.map.addTilesetImage(b.name, b.name, b.tileWidth, b.tileHeight);
            sets.push(b.name);
        });
        
        this.createPlayer(scene);
        scene.mapLayers = {};
        //Tile layers
        scene.map.layers.forEach((l) => {
            //console.log(`Created static layer ${l.name}`, l);
            switch (l.properties.LayerType.toLowerCase()) {
                case 'static':
                    scene.mapLayers[l.name] = scene.map.createStaticLayer(l.name, sets, 0, 0).setCollisionByExclusion([-1]);
                    break;
                case 'dynamic':
                    scene.mapLayers[l.name] = scene.map.createDynamicLayer(l.name, sets, 0, 0);
                    break;
            }
        });
        //object layers
        scene.map.objects.forEach((l) => {
            //console.log(`Created static layer ${l.name}`, l);
            switch (l.name) {
                case 'Boxes':
                    var newBoxes = scene.map.createFromObjects('Boxes', 'Box', { key: 'tiles', frame: [27, 26, 25, 24], origin: 0 });
                    scene.mapLayers[l.name] = new Boxes(scene, [], newBoxes);
            }
        });
        scene.cameras.main.setBackgroundColor('#ccccff');

        //create player collision
        scene.physics.add.collider(scene.mapLayers.World , scene.player);
        scene.physics.add.collider(scene.mapLayers.World, scene.flit);

        //Set up the coin layer with verlap and callback
        scene.physics.add.overlap(scene.player, scene.mapLayers.Coins);
        scene.physics.add.overlap(scene.flit, scene.mapLayers.Coins);
        scene.mapLayers.Coins.setTileIndexCallback([48, 38], this.collectCoin, scene);
        
        //set changing player after loader has finished so player keyboard is used
        this._ChangingPlayer = false;
    }

    /**
     * Collect items depending on the player
     * @param {Phaser.GameObjects.Sprite} sprite The sprite that hit a coin
     * @param {Phaser.Tilemaps.Tile} tile The coin tile
     */
    collectCoin(sprite, tile) {
        let isFlit = sprite === this.flit;
        if (tile.index == 48 && isFlit) {
            this.mapLayers.Coins.removeTileAt(tile.x, tile.y); 
            this.fliesCollected++; 
        }
        if (tile.index === 38 && !isFlit) {
            this.mapLayers.Coins.removeTileAt(tile.x, tile.y);
            this.shroomsCollected++;
        }
        //this.updateHeader();
        return false;
    }
    /**
     * Create Flit and Bob sprite classes
     * @param {PhaserScene} scene The scene to populate
     */
    createPlayer(scene) {
        scene.map.findObject('Player', (obj) => {
            // if (scene._NEWGAME && scene._LEVEL === 1) {
                if (obj.type === 'StartPosition') {
                    if (obj.name === 'Bob') {
                        scene.player = new Player(scene, obj.x, obj.y);
                        scene.player.depth = 100;
                        scene.game.Bob = scene.player;
                        this.ActivePlayer = scene.player;
                    }
                    if (obj.name === 'Flit') {
                        scene.flit = new Flit(scene, obj.x, obj.y);
                        scene.flit.depth = 100;
                        scene.game.Flit = scene.flit;
                    }
                }
            // }
        });
        scene.cameras.main.startFollow(scene.player);
        scene.game.ActivePlayer = scene.player;
    }
}