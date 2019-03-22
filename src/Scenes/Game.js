/// <reference path="../../defs/phaser.d.ts" />
import Player from '../Sprites/Player.js';
import Flit from '../Sprites/Flit.js';
//import PlayerContainer from '../Groups/PlayerContainer.js';
import Settings from '../settings.js';
import Utils from '../Utils/Debug.js';
import fbisUtils from '../Utils/Debug.js';
import Boxes from '../Sprites/boxes.js';
//import Coins from '../Groups/Coins.js';

export default class GameScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  init(data) {
    this._LEVEL = data.level;
    this._LEVELS = data.levels;
    this._NEWGAME = data.newGame;
    this.loadingLevel = false;
    this._SCORE = 0;
    
    this._Settings = new Settings(); //shared settings objects

    if (this._NEWGAME) this.events.emit('newGame');

    //used for different code workouts
    this.workout = 'boxOverlap';
  }

  create() {
    // listen for player input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
   
    this.createMap();
    this.createPlayer();
    this.addCollisions();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // update our camera
    this.cameras.main.startFollow(this.player);
    this.game.ActivePlayer = this.player;
    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');
    // this text will show the score
    this.score = this.add.text(20, 20, '0', this._Settings.HUDFont);
    this.notes = this.add.text(20, 60, '0', this._Settings.debugFont);
    // fix the text to the camera
    this.score.setScrollFactor(0);
    this.notes.setScrollFactor(0);

    //set the debug graphic to this scene, re-create it for a different scene
    this.game.DebugG = this.add.graphics();
    this.physics.collide(this.boxTiles, this.boxTiles);
    this.physics.collide(this.boxTiles, this.groundLayer);
  }
  switchCharacter() {
    //stop current player activity
    this.game.ActivePlayer.idle();
    this.game.ActivePlayer.body.setVelocityX(0);
    //get the other character
    this.game.ActivePlayer = this.game.ActivePlayer.constructor.name === 'Player' ? this.flit : this.player;
    this.game.ActivePlayer = this.game.ActivePlayer;

    this.game._ChangingPlayer = true;
    //pan the camera 
    this.cameras.main.stopFollow();
    this.cameras.main.pan(this.game.ActivePlayer.x, this.game.ActivePlayer.y, 500, 'Sine.easeInOut', true, (cam, complete, x, y) => {
      if (complete === 1) {
        this.cameras.main.startFollow(this.game.ActivePlayer, true, .1, .1);
        this.game._ChangingPlayer = false;
      }
    });
  }
  update() {
    //if player has debug text render it
    if(this.player.debugText) this.notes.setText(this.player.debugText);
    //Switch characters
    if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
      this.switchCharacter();
    }
    if (!this.game._ChangingPlayer) {
      this.game.ActivePlayer.update(this.cursors, this.spaceKey);
    }
    this.boxTiles.children.entries.forEach(function (b) {
      //if (b.body.touching.none && b.body.blocked.none) b.tint = 0xFF0000;
      b.body.setVelocityX(0);
    });

    //sync the background to the camera
    Phaser.Actions.Call(this.background.getChildren(), function(layer) {
      layer.x = this.cameras.main.scrollX;
      ////Scroll background
      //layer.tilePositionX += Math.round(this.game.ActivePlayer.body.velocity.x / 100);
    }, this);
     this.game.DebugG.clear();
    // this.game.drawCollision(this.player);
    // this.game.drawCollision(this.flit);
     this.game.drawCollision(this.box2.getChildren());
    // this.game.drawCollision(this.boxTiles.getChildren());
    //this.notes.setText(this.game.ActivePlayer.player.anims.currentFrame.textureFrame);
  }

  addCollisions() {
    // player will collide with the level tiles 
    this.physics.add.collider(this.groundLayer, this.player);
    this.physics.add.collider(this.groundLayer, this.flit);
    this.coinLayer.setTileIndexCallback(1, this.collectCoin, this);
    // when the player overlaps with a tile with index 17, collectCoin 
    // will be called    
    this.physics.add.overlap(this.player, this.coinLayer);
    this.physics.add.overlap(this.flit, this.coinLayer);

    //set up interactive boxes
    this.physics.add.collider(this.player, this.boxTiles, this.overBox, null,  this);
    this.physics.add.collider(this.flit, this.boxTiles, this.overBox, null,  this);
    this.physics.add.collider(this.groundLayer, this.boxTiles, this.stopOnGround);
    this.physics.add.collider(this.boxTiles, this.boxTiles, this.stopOnBox, null, this); //get boxes to collide so you can stack them

    this.box2.addCollisions();
   
  }
  stopOnGround(box, ground){
    // box.allowGravity = false;
    box.immovable = true;
    box.moves = false;
    box.enabled = false;
    // box.tint = 0x0000FF;
    //ground.tint = 0xFF00FF;
  }
  stopOnBox(a,b){
    //console.log('box hit');
    a.body.immovable = true;
    a.body.moves = false;
    a.body.enabled = false;
    // a.tintFill = true;
    // a.tint = 0xCCCCCC;
  }
  overBox(player, box){
    if(Phaser.Input.Keyboard.JustDown(this.spaceKey)){
      this.game.ActivePlayer.overBox(box);
    }
  }
  collectStar(player, star) {
    star.disableBody(true, true);
  }
  createPlayer() {
    this.map.findObject('Player', (obj) => {
      if (this._NEWGAME && this._LEVEL === 1) {
        if (obj.type === 'StartPosition') {
          if (obj.name === 'Bob') {
            //this.player = new PlayerContainer(this, obj.x, obj.y, new Player(this, 0,0));
            this.player = new Player(this, obj.x, obj.y);
            this.game.Bob = this.player;
          }
          if (obj.name === 'Flit') {
            this.flit = new Flit(this, obj.x, obj.y);
            this.game.Flit = this.flit;
          }
        }
      }
    });
  }

  // this function will be called when the player touches a coin
  collectCoin(sprite, tile) {
    this.coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    this._SCORE++; // add 10 points to the score
    this.score.setText(this._SCORE); // set the text to show the current score
    return false;
  }

  createMap() {
    // load the map 
    this.map = this.make.tilemap({ key: 'map' });

    //set up the background
    this.background = this.add.group('background');
    
    //this.background.add(this.add.tileSprite(0, this.map.heightInPixels - 500, this.game.canvas.clientWidth, 256, 'mountains'));
    this.background.add(this.add.tileSprite(0, this.map.heightInPixels - 346, this.game.canvas.clientWidth, 256, 'largegrass'));
    // this.background.add(this.add.tileSprite(0, this.game.canvas.clientHeight - 80, this.game.canvas.clientWidth, 256, 'clouds', 1));
    Phaser.Actions.Call(this.background.getChildren(), function(layer) {
      layer.setOrigin(0,0);
    }, this);

    // tiles for the ground layer
    this.groundTiles = this.map.addTilesetImage('tiles');
    // create the ground layer
    this.groundLayer = this.map.createDynamicLayer('World', this.groundTiles, 0, 0);
    // the player will collide with this layer
    this.groundLayer.setCollisionByExclusion([-1]);

    // coin image used as tileset
    this.coinTiles = this.map.addTilesetImage('coin');
    // add coins as tiles
    this.coinLayer = this.map.createDynamicLayer('Coins', this.coinTiles, 0, 0);

    var newBoxes = this.map.createFromObjects('Boxes', 'Box', { key: 'tiles', frame: 28 });
     this.box2 = new Boxes(this, [], newBoxes);

    //get the boxes from the map
    var pushableBoxes = this.map.createFromObjects('Pushable', 'Box', { key: 'tiles', frame: 29});
    //get an array of the box tiles and create group from them
    this.boxTiles = new Phaser.Physics.Arcade.Group(this.world, this, pushableBoxes, { bounceX: 1, originX:0, originY:1 });
    
    //set the group to respond to physics
    this.physics.world.enable(this.boxTiles);
    for (let i = 0; i < this.boxTiles.children.entries.length; i++) {
      //   x.body.setCollideWorldBounds(true); // don't go out of the map
      //x.setOrigin(0, 0);
      //   x.body.allowGravity = false;

      let x = this.boxTiles.children.entries[i];
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
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;
  }
  //   loadNextLevel (endGame) {
  //     if (!this.loadingLevel) {
  //       this.cameras.main.fade(500, 0, 0, 0);
  //       this.cameras.main.on('camerafadeoutcomplete', () => {
  //         if (endGame) {
  //           this.scene.restart({ level: 1, levels: this._LEVELS, newGame: true });
  //         } else if (this._LEVEL === 1) {
  //           this.scene.restart({ level: 2, levels: this._LEVELS, newGame: false });
  //         } else if (this._LEVEL === 2) {
  //           this.scene.restart({ level: 1, levels: this._LEVELS, newGame: false });
  //         }
  //       });
  //       this.loadingLevel = true;
  //     }
  //   }
};
