/// <reference path="../../defs/phaser.d.ts" />
import Boxes from '../Sprites/boxes.js';

export default class MapLoader{
    /**
     * 
     * @param {Phaser.Scene} scene Scene to add map to
     * @param {string} mapKey Key for the map to add 
     */
    static BuildScene(scene, mapKey) {
        // load the map 
        scene.map = scene.make.tilemap({ key: 'map' });

        //set up the background
        scene.background = scene.add.group('background');

        scene.add.image(1100, scene.map.heightInPixels - 366, 'gnome');
        //this.background.add(this.add.tileSprite(0, this.map.heightInPixels - 500, this.game.canvas.clientWidth, 256, 'mountains'));
        scene.background.add(scene.add.tileSprite(0, scene.map.heightInPixels - 346, scene.game.canvas.clientWidth, 256, 'largegrass'));
        // scene.background.add(scene.add.tileSprite(0, scene.game.canvas.clientHeight - 80, scene.game.canvas.clientWidth, 256, 'clouds', 1));
        Phaser.Actions.Call(scene.background.getChildren(), function (layer) {
            layer.setOrigin(0, 0);
            layer.alpha = .9;
            layer.fixedToCamera = true;
        }, scene);


        // tiles for the ground layer
        scene.groundTiles = scene.map.addTilesetImage('tiles');
        // create the ground layer
        let back = scene.map.createStaticLayer('Background', scene.groundTiles, 0, 0);
        back.setCollision([38, 39], false);//ignore grass tiles
        scene.groundLayer = scene.map.createStaticLayer('World', scene.groundTiles, 0, 0);
        // the player will collide with this layer
        scene.groundLayer.setCollisionByExclusion([-1]);

        // coin image used as tileset
        scene.coinTiles = scene.map.addTilesetImage('coin');
        // add coins as tiles
        scene.coinLayer = scene.map.createDynamicLayer('Coins', scene.coinTiles, 0, 0);

        var newBoxes = scene.map.createFromObjects('Boxes', 'Box', { key: 'tiles', frame: [27, 26, 25, 24], origin: 0 });
        scene.box2 = new Boxes(scene, [], newBoxes);

        //get the boxes from the map
        var pushableBoxes = scene.map.createFromObjects('Pushable', 'Box', { key: 'tiles', frame: 29 });
        //get an array of the box tiles and create group from them
        scene.boxTiles = new Phaser.Physics.Arcade.Group(scene.world, scene, pushableBoxes, { bounceX: 1, originX: 0, originY: 1 });

        //set the group to respond to physics
        scene.physics.world.enable(scene.boxTiles);
        for (let i = 0; i < scene.boxTiles.children.entries.length; i++) {
            //   x.body.setCollideWorldBounds(true); // don't go out of the map
            //x.setOrigin(0, 0);
            //   x.body.allowGravity = false;

            let x = scene.boxTiles.children.entries[i];
            x.body.immovable = true;
            //x.body.setGravityX(1);
            // x.body.checkCollision.left = true;
            // x.body.checkCollision.right = true;
            // x.body.moves = false;
            x.name = 'Box_' + i;
        }
        //   //x.body.mass = 2;
        //   //x.body.overlapX = 10;
        console.log('built boxTiles');
        // set the boundaries of our game world
        scene.physics.world.bounds.width = scene.groundLayer.width;
        scene.physics.world.bounds.height = scene.groundLayer.height;
    }
}