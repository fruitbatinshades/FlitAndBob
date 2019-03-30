/// <reference path="../../defs/phaser.d.ts" />
import Boxes from '../Sprites/boxes.js';
import Enums from '../Levels/Tilemaps.js';
import Level from '../Levels/Level.js';

export default class MapLoader{
    /**
     * 
     * @param {Phaser.Scene} scene Scene to add map to
     * @param {string} mapKey Key for the map to add 
     */
    static BuildScene(scene, mapKey) {
        let info = {
            flies: 0,
            shrooms: 0,
            fliesCollected: 0,
            shroomsCollected:0
        };
        // load the map 
        scene.map = scene.make.tilemap({ key: 'map' });

        //set up the background
        scene.background = scene.add.group('background');

        let lvl = new Level(scene);

        scene.background.add(scene.add.tileSprite(0, scene.map.heightInPixels - 700, scene.game.canvas.clientWidth, 512, 'bricktile'));
        scene.add.image(900, scene.map.heightInPixels - 350, 'gnome');
        //scene.background.add(scene.add.tileSprite(0, scene.map.heightInPixels - 346, scene.game.canvas.clientWidth, 256, 'largegrass'));
        // scene.background.add(scene.add.tileSprite(0, scene.game.canvas.clientHeight - 80, scene.game.canvas.clientWidth, 256, 'clouds', 1));
        Phaser.Actions.Call(scene.background.getChildren(), function (layer) {
            layer.setOrigin(0, 0);
            layer.alpha = 1;
            layer.fixedToCamera = true;
        }, scene);

        // tiles for the ground layer
        scene.groundTiles = scene.map.addTilesetImage('tiles');
        scene.componentTiles = scene.map.addTilesetImage('components');
        // create the ground layer
        let back = scene.map.createStaticLayer('Background', scene.groundTiles, 0, 0);
        //back.setCollision([38, 39], false);//ignore grass tiles
        scene.groundLayer = scene.map.createStaticLayer('World', scene.groundTiles, 0, 0);
        // the player will collide with this layer
        scene.groundLayer.setCollisionByExclusion([-1]);

        // coin image used as tileset

        // add coins as tiles
        scene.coinLayer = scene.map.createDynamicLayer('Coins', scene.groundTiles, 0, 0);
        //count occurances
        let tiles = scene.coinLayer.layer.data;
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            for (var j = 0; j < tile.length; j++) {
                if (tile[j].index === 48) info.flies++;
                if (tile[j].index === 38) info.shrooms++;
            }
        }

        scene.switchLayer = scene.map.createDynamicLayer('Switches', scene.componentTiles, 0, 0);
        //update the ids of the tiles with the gid
        info.switchIds = new Enums(scene.switchLayer.tileset[0].firstgid);

        //Get the rectangles from the map
        scene.interactionLayer = scene.map.getObjectLayer('Interaction');
        scene.interactionZones = [];
        for (let i = 0; i < scene.interactionLayer.objects.length; i++) {
            let current = scene.interactionLayer.objects[i];
            let zone = scene.add.zone(current.x, current.y).setSize(current.width, current.height);
            scene.physics.world.enable(zone);
            zone.body.setAllowGravity(false);
            zone.body.moves = false;
            zone.tintFill = 0xaa000000;
            zone.properties = current.properties;
            scene.interactionZones.push(zone);
        }

        var newBoxes = scene.map.createFromObjects('Boxes', 'Box', { key: 'tiles', frame: [27, 26, 25, 24], origin: 0 });
        scene.box2 = new Boxes(scene, [], newBoxes);

        //get the boxes from the map
        var pushableBoxes = scene.map.createFromObjects('Pushable', 'Box', { key: 'tiles', frame: 29 });
        //get an array of the box tiles and create group from them
        scene.boxTiles = new Phaser.Physics.Arcade.Group(scene.world, scene, pushableBoxes, { bounceX: 1, originX: 0, originY: 1 });

        //set the group to respond to physics
        scene.physics.world.enable(scene.boxTiles);
        for (let i = 0; i < scene.boxTiles.children.entries.length; i++) {
            let x = scene.boxTiles.children.entries[i];
            x.body.immovable = true;
            x.name = 'Box_' + i;
        }
        //   //x.body.mass = 2;
        //   //x.body.overlapX = 10;
        console.log('built boxTiles');
        // set the boundaries of our game world
        scene.physics.world.bounds.width = scene.groundLayer.width;
        scene.physics.world.bounds.height = scene.groundLayer.height;

        return info;
    }
    static createInteraction(scene, map) {
        
    }
}
/*

//create layer
//set collision callbacks

*/