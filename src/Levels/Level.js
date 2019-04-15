/// <reference path="../../defs/phaser.d.ts" />
import Bob from '../Sprites/Bob.js';
import Flit from '../Sprites/Flit.js';
import Boxes from '../Sprites/Boxes.js';
import Enums from './Tilemaps.js';
import Interaction from '../Sprites/Interaction.js';
import HUD from '../Scenes/HUD.js';
import Dialog from '../Scenes/Dialog.js';
/**
 * Class that hold the level specific data and operations
 */
export default class Level extends Phaser.Scene {
    /** The zones created from the maps interaction layer */
    zones;
    fliesCollected = 0;
    shroomsCollected = 0;
    mapIds;
    backgrounds;
    switchIds;
    sky;
    totalShrooms= 0;
    totalFlies = 0;
    debug = false;
    mapProperties;
    loader;
    mapName;

    constructor(handle, mapName) {
        super(handle);
        this.mapName = mapName;
    }
    reset() {
        this.totalShrooms = 0;
        this.totalFlies = 0;
        this.fliesCollected = 0;
        this.shroomsCollected = 0;
    }
    //NB: Call from preload
    preload() {
        this.load.tilemapTiledJSON(this.mapName, `assets/Levels/${this.mapName}.json`);
        this.map = this.make.tilemap({ key: this.mapName });
        this.mapProperties = this.map.properties;
        //this.map = this.map;
        if (this.map.properties["debug"]) this.debug = this.map.properties["debug"];

        // set the boundaries of our game world
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // listen for player input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);

        if (this.debug) {
            this.input.on('gameobjectdown', function (pointer, gameObject) {
                if (gameObject.toolInfo) {
                    gameObject.toolInfo.visible = !gameObject.toolInfo.visible;
                    console.log(gameObject.toolInfo.visible);
                }
            });
        }
    }
    create() { 
        this.cameras.main.setBackgroundColor(0x10ceff);
        this.buildLevel();
        if(!this.HUD){
            this.HUD = this.scene.add('HUD', HUD, true, { x: 400, y: 300 });
        } else {
            this.scene.resume('HUD');
            this.events.emit('updateHUD', this.game.Bob);
            this.events.emit('updateHUD', this.game.Flit);
        }
        //Level complete so display summary
        this.events.on('levelcomplete', function () { 
            let d = new Dialog(this, 400, 200, 'Level Complete', 'Next');
            d.depth = 1000;
            this.add.existing(d);
            //when closed finish level
            this.events.on('dialogclosed', function () {
                console.log('closed');
                this.scene.get('LevelLoader').levelFinished();
            },this);
        }, this);
        //Character died so restart
        this.events.on('died', function (player) {
            this.scene.pause('HUD');
            this.scene.restart(); 
        },this);
    }
    /**
     * Crete the maps, player and set up collisions
     * @param {PhaserScene} scene The scene to populate
     */
    buildLevel() {
        this.reset();
        let sets = [];
        this.map.tilesets.forEach((b) => {
            //console.log(`Added tilesetImage ${b.name}`);
            this.map.addTilesetImage(b.name, b.name, b.tileWidth, b.tileHeight);
            sets.push(b.name);
        });
        
        this.createPlayer();
        this.mapLayers = {};
        let layerDepth = 1;
        //Tile layers
        this.map.layers.forEach((l) => {
            //console.log(`Created static layer ${l.name}`, l);
            switch (l.properties.LayerType.toLowerCase()) {
                case 'static':
                    this.mapLayers[l.name] = this.map.createStaticLayer(l.name, sets, 0, 0).setCollisionByExclusion([-1]);
                    this.mapLayers[l.name].setDepth(l.properties.depth || 1);
                      break;
                case 'dynamic':
                    this.mapLayers[l.name] = this.map.createDynamicLayer(l.name, sets, 0, 0);
                    this.mapLayers[l.name].depth = l.properties.depth || 1;
                    if (l.name === 'InteractionTiles') {
                        //update the ids of the tiles with the gid
                        this.switchIds = new Enums(this.mapLayers[l.name].tileset.find(x => x.name == 'components').firstgid);
                    }
                    break;
            }
        });
        //object layers
        this.map.objects.forEach((l) => {
            //console.log(`Created static layer ${l.name}`, l);
            switch (l.name) {
                case 'Boxes':
                    var newBoxes = this.map.createFromObjects('Boxes', 'Box', { key: 'ComponentSheet', frame: this.switchIds.Boxes, origin: 0 });
                    this.mapLayers[l.name] = new Boxes(this, [], newBoxes);
                    this.mapLayers[l.name].setDepth(l.properties.depth || 1);
                    break;
                case 'Interaction':
                    //Get the rectangles from the map
                    this.mapLayers[l.name]= this.map.getObjectLayer('Interaction');
                    this.interactionZones = new Interaction(this, [], l, this.mapLayers[l.name], this.debug );
                    //scene.mapLayers[l.name].setDepth(l.properties.depth || 1);
                    break;
                case 'Sky':
                    //Add backgrounds
                    if (!this.sky) this.sky = new Phaser.GameObjects.Group(this);
                    this.mapLayers[l.name] = this.map.getObjectLayer('Sky');
                    this.mapLayers[l.name].objects.forEach((b) => {
                        //NB: Theimages are loaded from the Tiled Map.Properties.Backgrounds, pipe seperated
                        let name = b.name.substr(0, b.name.lastIndexOf('.'));
                        if (name !== '') {
                            let img = this.game.textures.get(name).source[0];
                            if (img !== null) {
                                if (b.type == 'TileSprite') {
                                    let o = this.add.tileSprite(b.x, b.y - img.height, this.game.canvas.clientWidth, img.width, name);
                                    this.sky.add(o);
                                    o.setOrigin(0, 0);
                                    o.fixedToCamera = true;
                                    o.setDepth(l.properties.depth || 1);
                                }
                                if (b.type == 'Image') {
                                    let o = this.add.image(b.x, b.y - img.height, name);
                                    o.setOrigin(0, 0);
                                    o.setDepth(l.properties.depth || 1);
                                }
                            }
                        }
                    });
                    
                    break;
            }
        });

        //create player collision
        this.physics.add.collider(this.mapLayers.World , this.player);
        this.physics.add.collider(this.mapLayers.World, this.flit);

        //Set up the coin layer with overlap and callback
        this.physics.add.overlap(this.player, this.mapLayers.Coins);
        this.physics.add.overlap(this.flit, this.mapLayers.Coins);
        this.mapLayers.Coins.setTileIndexCallback(this.switchIds.Collectables, this.collectCoin, this);

        //count the collectables
        if (this.mapLayers.Coins) {
            let tiles = this.mapLayers.Coins.layer.data;
            for (var i = 0; i < tiles.length; i++) {
                var tile = tiles[i];
                for (var j = 0; j < tile.length; j++) {
                    if (tile[j].index === this.switchIds.Component.Fly) this.totalFlies++;
                    if (tile[j].index === this.switchIds.Component.Shroom) this.totalShrooms++;
                }
            }
        }
        
        //set changing player after loader has finished so player keyboard is used
        this._ChangingPlayer = false;

        //scene.sound.playAudioSprite('sfx', 'music_zapsplat_rascals_123', {volume:.5, repeat:true});
        //when a box hits a tile
        this.events.on('boxTileCollide', (box, tile) => { 
            if (tile.constructor.name === 'InteractionZone') {
                if (tile.tileType && tile.tileType.isBlockActivated) {
                    tile.process();
                }
            }
        });
    }

    /**
     * Collect items depending on the player
     * @param {Phaser.GameObjects.Sprite} sprite The sprite that hit a coin
     * @param {Phaser.Tilemaps.Tile} tile The coin tile
     */
    collectCoin(player, tile) {
        let collected = false;
        if (player.is('Flit')) {
            switch (tile.index) {
                case this.switchIds.Component.Fly:
                    player.collected++;
                    this.sound.playAudioSprite('sfx', 'FlitMunch');
                    collected = true;
                    break;
                case this.switchIds.Component.Honey:
                    //TODO: Add power up for flit
                    collected = true;
                    break;
            }
        }
        if (player.is('Bob')) {
            switch (tile.index) {
                case this.switchIds.Component.Shroom:
                    player.collected++;
                    this.sound.playAudioSprite('sfx', 'BobMunch');
                    collected = true;
                    break;
                case this.switchIds.Component.Fizz:
                    //TODO: add power up for Bob
                    collected = true;
                    break;
            }
        }
        if (collected) this.mapLayers.Coins.removeTileAt(tile.x, tile.y);
        this.events.emit('updateHUD', player);
        return false;
    }
    /**
     * Create Flit and Bob sprite classes
     * @param {PhaserScene} scene The scene to populate
     */
    createPlayer() {
        this.map.findObject('Player', (obj) => {
            // if (scene._NEWGAME && scene._LEVEL === 1) {
                if (obj.type === 'StartPosition') {
                    if (obj.name === 'Bob') {
                        this.player = new Bob(this, obj.x, obj.y);
                        this.player.depth = 100;
                        this.game.Bob = this.player;
                    }
                    if (obj.name === 'Flit') {
                        this.flit = new Flit(this, obj.x, obj.y);
                        this.flit.depth = 100;
                        this.game.Flit = this.flit;
                    }
                }
            // }
        });
        this.cameras.main.startFollow(this.player);
        this.registry.set('ActivePlayer', this.player);
    }
    update() {
        //Switch characters
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
            this.switchCharacter();
        }
        //only pass keyboard to player if not switching
        if (this.registry.list.ActivePlayer && !this.game._ChangingPlayer) {
            this.registry.list.ActivePlayer.update(this.cursors, this.spaceKey);
        }
        //sync the background to the camera
        Phaser.Actions.Call(this.sky.getChildren(), function (layer) {
            layer.x = this.cameras.main.scrollX;
            layer.tilePositionX = this.cameras.main.scrollX ;
        }, this);
    }
    switchCharacter() {
        let ap = this.registry.list.ActivePlayer;
        //stop current player activity
        ap.idle();
        ap.body.setVelocityX(0);
        //get the other character
        this.registry.set('ActivePlayer', ap.is('Bob') ? this.flit : this.player);
        ap = this.registry.list.ActivePlayer;

        this.game._ChangingPlayer = true;
        //pan the camera 
        this.cameras.main.stopFollow();
        this.cameras.main.pan(ap.x, ap.y, 500, 'Sine.easeInOut', true, (cam, complete, x, y) => {
            if (complete === 1) {
                this.cameras.main.startFollow(ap, true, .1, .1);
                this.game._ChangingPlayer = false;
            }
        });
    }
}