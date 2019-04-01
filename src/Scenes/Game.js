// /// <reference path="../../defs/phaser.d.ts" />
// import Player from '../Sprites/Player.js';
// import Flit from '../Sprites/Flit.js';
// //import PlayerContainer from '../Groups/PlayerContainer.js';
// import Settings from '../settings.js';
// import Utils from '../Utils/Debug.js';
// import MapLoader from '../Utils/MapLoader.js';
// import Boxes from '../Sprites/boxes.js';
// import Enums from '../Levels/Tilemaps.js';

// export default class GameScene extends Phaser.Scene {
//   constructor(key) {
//     super(key);
//   }

//   init(data) {
//     this._LEVEL = data.level;
//     this._LEVELS = data.levels;
//     this._NEWGAME = data.newGame;
//     this.loadingLevel = false;
//     this._SCORE = 0;
    
//     this._Settings = new Settings(); //shared settings objects

//     if (this._NEWGAME) this.events.emit('newGame');

//     //used for different code workouts
//     this.workout = 'boxOverlap';
//   }

//   create() {
//     // listen for player input
//     this.cursors = this.input.keyboard.createCursorKeys();
//     this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
//     this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
//     this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CONTROL);
   
//     this.createMap();
//     this.createPlayer();
//     this.addCollisions();

//     // set bounds so the camera won't go outside the game world
//     this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

//     this.header = this.add.image(11, 0, 'header');
//     this.header.setOrigin(0, 0);
//     this.header.setScrollFactor(0);
//     //flies
//     this.add.image(60, 54, 'tiles', 47).setScrollFactor(0).setScale(.5);
//     this.fliesCollected = this.add.text(80, 42, '0', this._Settings.HUDFont);
//     //shrooms
//     this.add.image(60, 80, 'tiles', 37).setScrollFactor(0).setScale(.5);
//     this.shroomsCollected = this.add.text(80, 70, '0', this._Settings.HUDFont);
//     this.updateHeader();

//     // update our camera
//     this.cameras.main.startFollow(this.player);
//     this.game.ActivePlayer = this.player;
//     // set background color, so the sky is not black    
//     this.cameras.main.setBackgroundColor('#ccccff');
//     // this text will show the score

//     this.notes = this.add.text(50, 52, '0', this._Settings.debugFont);
//     // fix the text to the camera
//     this.fliesCollected.setScrollFactor(0);
//     this.shroomsCollected.setScrollFactor(0);
//     this.notes.setScrollFactor(0);

//     //set the debug graphic to this scene, re-create it for a different scene
//     this.game.DebugG = this.add.graphics();
//     this.physics.collide(this.boxTiles, this.boxTiles);
//     this.physics.collide(this.boxTiles, this.groundLayer);

//   }
//   switchCharacter() {
//     //stop current player activity
//     this.game.ActivePlayer.idle();
//     this.game.ActivePlayer.body.setVelocityX(0);
//     //get the other character
//     this.game.ActivePlayer = this.game.ActivePlayer.constructor.name === 'Player' ? this.flit : this.player;
//     this.game.ActivePlayer = this.game.ActivePlayer;

//     this.game._ChangingPlayer = true;
//     //pan the camera 
//     this.cameras.main.stopFollow();
//     this.cameras.main.pan(this.game.ActivePlayer.x, this.game.ActivePlayer.y, 500, 'Sine.easeInOut', true, (cam, complete, x, y) => {
//       if (complete === 1) {
//         this.cameras.main.startFollow(this.game.ActivePlayer, true, .1, .1);
//         this.game._ChangingPlayer = false;
//       }
//     });
//   }
//   update() {
//     //if player has debug text render it
//     if(this.player.debugText) this.notes.setText(this.player.debugText);
//     //Switch characters
//     if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
//       this.switchCharacter();
//     }
//     if (!this.game._ChangingPlayer) {
//       this.game.ActivePlayer.update(this.cursors, this.spaceKey);
//     }
//     this.boxTiles.children.entries.forEach(function (b) {
//       //if (b.body.touching.none && b.body.blocked.none) b.tint = 0xFF0000;
//       b.body.setVelocityX(0);
//     });

//     //sync the background to the camera
//     Phaser.Actions.Call(this.background.getChildren(), function(layer) {
//       layer.x = this.cameras.main.scrollX;
//       layer.tilePositionX = this.cameras.main.scrollX * 0.1;
//       ////Scroll background
//       //layer.tilePositionX += Math.round(this.game.ActivePlayer.body.velocity.x / 100);
//     }, this);
//      this.game.DebugG.clear();
//   }

//   addCollisions() {
//     // player will collide with the level tiles 
//     this.physics.add.collider(this.groundLayer, this.player);
//     this.physics.add.collider(this.groundLayer, this.flit);

//     //Set up the coin layer with verlap and callback
//     this.physics.add.overlap(this.player, this.coinLayer);
//     this.physics.add.overlap(this.flit, this.coinLayer);
//     this.coinLayer.setTileIndexCallback([48, 38], this.collectCoin, this);

//     //Set up the components layer with overlap and callback
//     this.physics.add.overlap(this.player, this.switchLayer);
//     this.physics.add.overlap(this.flit, this.switchLayer);
//     //this.switchLayer.setCollisionBetween(1, 12, true);
    
//     this.switchLayer.setTileIndexCallback(this.info.switchIds.ComponentTilesSwitches(), this.logTileIndex, this);//shroom
//     //this.switchLayer.setTileLocationCallback(27, 23, 1, 1, this.logTileIndex); 
    
//     //set up interactive boxes
//     //player hits boxe
//     this.physics.add.collider(this.player, this.boxTiles, this.overBox, null,  this);
//     this.physics.add.collider(this.flit, this.boxTiles, this.overBox, null, this);
//     //box hits ground
//     this.physics.add.collider(this.groundLayer, this.boxTiles, this.stopOnGround);
//     //get boxes to collide so you can stack them
//     this.physics.add.collider(this.boxTiles, this.boxTiles, this.stopOnBox, null, this); 

//     this.box2.addCollisions();
   
//   }
//   logTileIndex(sprite, tile) { 
//     console.log(tile);
//   }
//   stopOnGround(box, ground){
//     // box.allowGravity = false;
//     box.immovable = true;
//     box.moves = false;
//     box.enabled = false;
//     // box.tint = 0x0000FF;
//     //ground.tint = 0xFF00FF;
//   }
//   stopOnBox(a,b){
//     //console.log('box hit');
//     a.body.immovable = true;
//     a.body.moves = false;
//     a.body.enabled = false;
//     // a.tintFill = true;
//     // a.tint = 0xCCCCCC;
//   }
//   overBox(player, box){
//     if(Phaser.Input.Keyboard.JustDown(this.spaceKey)){
//       this.game.ActivePlayer.overBox(box);
//     }
//   }
//   collectStar(player, star) {
//     star.disableBody(true, true);
//   }
//   createPlayer() {
//     this.map.findObject('Player', (obj) => {
//       if (this._NEWGAME && this._LEVEL === 1) {
//         if (obj.type === 'StartPosition') {
//           if (obj.name === 'Bob') {
//             //this.player = new PlayerContainer(this, obj.x, obj.y, new Player(this, 0,0));
//             this.player = new Player(this, obj.x, obj.y);
//             this.game.Bob = this.player;
//           }
//           if (obj.name === 'Flit') {
//             this.flit = new Flit(this, obj.x, obj.y);
//             this.game.Flit = this.flit;
//           }
//         }
//       }
//     });
//   }

//   // this function will be called when the player touches a coin
//   collectCoin(sprite, tile) {
//     let isFlit = sprite === this.flit;
//     if (tile.index == 48 && isFlit) {
//       this.coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
//       this.info.fliesCollected++; // add 10 points to the score
//     }
//     if (tile.index === 38 && !isFlit) {
//       this.coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
//       this.info.shroomsCollected++; // add 10 points to the score
//     }
//     this.updateHeader();
//     return false;
//   }

//   updateHeader() { 
//     this.fliesCollected.setText(`${this.info.fliesCollected}/${this.info.flies}`); // set the text to show the current score
//     this.shroomsCollected.setText(`${this.info.shroomsCollected}/${this.info.shrooms}`); // set the text to show the current score
//   }

//   createMap() {
//     this.info = MapLoader.BuildScene(this, 'map');
//     console.log(this.info);
//   }
// };
