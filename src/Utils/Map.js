// export default class MapUtils{
//     constructor(){}
//     static InitMap(scene, key){

//     }

//     createMap() {
//         // load the map 
//         this.map = this.make.tilemap({ key: 'map' });
    
//         // tiles for the ground layer
//         this.groundTiles = this.map.addTilesetImage('tiles');
//         // create the ground layer
//         this.groundLayer = this.map.createDynamicLayer('World', this.groundTiles, 0, 0);
//         // the player will collide with this layer
//         this.groundLayer.setCollisionByExclusion([-1]);
    
//         // coin image used as tileset
//         this.coinTiles = this.map.addTilesetImage('coin');
//         // add coins as tiles
//         this.coinLayer = this.map.createDynamicLayer('Coins', this.coinTiles, 0, 0);
    
//         //get the boxes from the map
//         //var b1 = this.map.createDynamicLayer('boxTiles', this.groundTiles, 0, 0);
//         var b1 = this.map.createFromObjects('Pushable', 'Box', { key: 'tiles', frame: 3});
    
//         //get an array of the box tiles and create group from them
//         var b2 = this.map.createFromTiles(7, null, { key: 'tiles', frame: 3 });
//         this.boxTiles = new Phaser.Physics.Arcade.Group(this.world, this, b1, { bounceX: 1 });
//         //set the group to respond to physics
//         this.physics.world.enable(this.boxTiles);
//         this.boxTiles.children.entries.forEach((x) => {
//           x.body.setCollideWorldBounds(true); // don't go out of the map   
//           x.setOrigin(0, 0);
//           x.body.overlapX = 10;
//         });
//         console.log('built boxTiles');
//         // set the boundaries of our game world
//         this.physics.world.bounds.width = this.groundLayer.width;
//         this.physics.world.bounds.height = this.groundLayer.height;
//       }
// }