/// <reference path="../../defs/phaser.d.ts" />
import Player from '../Sprites/Player.js';
import Flit from '../Sprites/Flit.js';
import Boxes from '../Sprites/Boxes.js';

import Enums from './Tilemaps.js';
import Interaction from '../Sprites/Interaction.js';
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
    switchIds;
    sky;
    totalShrooms= 0;
    totalFlies = 0;
    debug = false;
    mapProperties;
    // info: {
    //     shrooms: 0;
    //     flies: 0;
    //     totalShrooms: 0;
    //     totalFlies: 0;
    // }

    //NB: Call from preload
    constructor(scene, name) { 
        this.mapProperties = scene.map.properties;
        if (scene.map.properties["debug"]) this.debug = scene.map.properties["debug"];
        //load backgrounds from map.properties.Backgrounds (Pipe delimeted filename from tiled)
        scene.load.setPath('assets/Levels/Backgrounds/');
        scene.map.properties["Backgrounds"].split('|').forEach((b) => {
            let name = b.substr(0, b.lastIndexOf('.'));
            b.endsWith('.svg') ? scene.load.svg(name, b) : scene.load.image(name, b);
        });

        //load tilesets
        scene.load.setPath('assets/Levels/');
        scene.map.tilesets.forEach((b) => {
            scene.load.image(b.name); 
            //console.log(b.name);
        });
        //this.buildLevel(scene);

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

        if (this.debug) {
            scene.input.on('gameobjectdown', function (pointer, gameObject) {
                if (gameObject.toolInfo)
                    gameObject.toolInfo.visible = !gameObject.toolInfo.visible;
                console.log(gameObject.toolInfo.visible)
            });
        }
    }
    /**
     * Crete the maps, player and set up collisions
     * @param {PhaserScene} scene The scene to populate
     */
    buildLevel(scene) {
        let sets = [];
        scene.map.tilesets.forEach((b) => {
            //console.log(`Added tilesetImage ${b.name}`);
            scene.map.addTilesetImage(b.name, b.name, b.tileWidth, b.tileHeight);
            sets.push(b.name);
        });
        
        this.createPlayer(scene);
        scene.mapLayers = {};
        let layerDepth = 1;
        //Tile layers
        scene.map.layers.forEach((l) => {
            //console.log(`Created static layer ${l.name}`, l);
            switch (l.properties.LayerType.toLowerCase()) {
                case 'static':
                    scene.mapLayers[l.name] = scene.map.createStaticLayer(l.name, sets, 0, 0).setCollisionByExclusion([-1]);
                    scene.mapLayers[l.name].setDepth(l.properties.depth || 1);
                      break;
                case 'dynamic':
                    scene.mapLayers[l.name] = scene.map.createDynamicLayer(l.name, sets, 0, 0);
                    scene.mapLayers[l.name].depth = l.properties.depth || 1;
                    if (l.name === 'Switches') {
                        //update the ids of the tiles with the gid
                        scene.switchIds = new Enums(scene.mapLayers[l.name].tileset[1].firstgid);
                    }
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
                    scene.mapLayers[l.name].setDepth(l.properties.depth || 1);
                    break;
                case 'Interaction':
                    //Get the rectangles from the map
                    scene.mapLayers[l.name]= scene.map.getObjectLayer('Interaction');
                    scene.interactionZones = new Interaction(scene, [], l, scene.mapLayers[l.name], this.debug );
                    //scene.mapLayers[l.name].setDepth(l.properties.depth || 1);
                    break;
                case 'Sky':
                    //Add backgrounds
                    if (!this.sky) this.sky = new Phaser.GameObjects.Group(this.scene);
                    scene.mapLayers[l.name] = scene.map.getObjectLayer('Sky');
                    scene.mapLayers[l.name].objects.forEach((b) => {
                        //NB: Theimages are loaded from the Tiled Map.Properties.Backgrounds, pipe seperated
                        let name = b.name.substr(0, b.name.lastIndexOf('.'));
                        if (name !== '') {
                            let img = scene.game.textures.get(name).source[0];
                            if (img !== null) {
                                if (b.type == 'TileSprite') {
                                    let o = scene.add.tileSprite(b.x, b.y - img.height, scene.game.canvas.clientWidth, img.width, name);
                                    this.sky.add(o);
                                    o.setOrigin(0, 0);
                                    o.fixedToCamera = true;
                                    o.setDepth(l.properties.depth || 1);
                                }
                                if (b.type == 'Image') {
                                    let o = scene.add.image(b.x, b.y - img.height, name);
                                    o.setOrigin(0, 0);
                                    o.setDepth(l.properties.depth || 1);
                                }
                            }
                        }
                    });
                    
                    break;
            }
        });
        scene.cameras.main.setBackgroundColor('#ccccff');

        //create player collision
        scene.physics.add.collider(scene.mapLayers.World , scene.player);
        scene.physics.add.collider(scene.mapLayers.World, scene.flit);

        //Set up the coin layer with overlap and callback
        scene.physics.add.overlap(scene.player, scene.mapLayers.Coins);
        scene.physics.add.overlap(scene.flit, scene.mapLayers.Coins);
        scene.mapLayers.Coins.setTileIndexCallback([48, 38], this.collectCoin, scene);

        //count the collectables
        if (scene.mapLayers.Coins) {
            let tiles = scene.mapLayers.Coins.layer.data;
            for (var i = 0; i < tiles.length; i++) {
                var tile = tiles[i];
                for (var j = 0; j < tile.length; j++) {
                    if (tile[j].index === 48) this.totalFlies++;
                    if (tile[j].index === 38) this.totalShrooms++;
                }
            }
        }
        
        //set changing player after loader has finished so player keyboard is used
        this._ChangingPlayer = false;

        //scene.sound.playAudioSprite('sfx', 'music_zapsplat_rascals_123', {volume:.5, repeat:true});
    }

    /**
     * Collect items depending on the player
     * @param {Phaser.GameObjects.Sprite} sprite The sprite that hit a coin
     * @param {Phaser.Tilemaps.Tile} tile The coin tile
     */
    collectCoin(player, tile) {
        if (tile.index == 48 && player.is('Flit')) {
            this.mapLayers.Coins.removeTileAt(tile.x, tile.y); 
            this.sound.playAudioSprite('sfx', 'FlitMunch');
            player.collected++; 
        }
        if (tile.index === 38 && player.is('Bob')) {
            this.mapLayers.Coins.removeTileAt(tile.x, tile.y);
            this.sound.playAudioSprite('sfx', 'BobMunch');
            player.collected++;
        }
        this.events.emit('updateHUD', player);
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