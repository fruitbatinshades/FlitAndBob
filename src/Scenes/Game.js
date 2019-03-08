/// <reference path="../../defs/phaser.d.ts" />
import Player from '../Sprites/Player.js';
import Flit from '../Sprites/Flit.js';
//import PlayerContainer from '../Groups/PlayerContainer.js';
import Settings from '../settings.js';
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
    
    this._ActivePlayer = null; //Currently selected character
    this._ChangingPlayer = false; //Camera is transitioning between player
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
    this._ActivePlayer = this.player;
    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');

    // this text will show the score
    this.score = this.add.text(20, 20, '0', this._Settings.HUDFont);
    this.notes = this.add.text(20, 60, '0', this._Settings.debugFont);
    // fix the text to the camera
    this.score.setScrollFactor(0);
    this.notes.setScrollFactor(0);
  }
  switchCharacter() {
    //stop current player activity
    this._ActivePlayer.idle();
    this._ActivePlayer.body.setVelocityX(0);
    //get the other character
    this._ActivePlayer = this._ActivePlayer.constructor.name === 'Player' ? this.flit : this.player;
    this._ChangingPlayer = true;
    //pan the camera 
    this.cameras.main.stopFollow();
    this.cameras.main.pan(this._ActivePlayer.x, this._ActivePlayer.y, 500, 'Sine.easeInOut', true, (cam, complete, x, y) => {
      if (complete === 1) {
        this.cameras.main.startFollow(this._ActivePlayer, true, .1, .1);
        this._ChangingPlayer = false;
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
    if (!this._ChangingPlayer) {
      this._ActivePlayer.update(this.cursors, this.spaceKey);
    }
    this.boxTiles.children.entries.forEach(function (b) {
      b.body.setVelocityX(0);
    });
    //this.notes.setText(this._ActivePlayer.player.anims.currentFrame.textureFrame);
  }

  addCollisions() {
    // player will collide with the level tiles 
    this.physics.add.collider(this.groundLayer, this.player);
    this.physics.add.collider(this.groundLayer, this.flit);
    this.coinLayer.setTileIndexCallback(17, this.collectCoin, this);
    // when the player overlaps with a tile with index 17, collectCoin 
    // will be called    
    this.physics.add.overlap(this.player, this.coinLayer);
    this.physics.add.overlap(this.flit, this.coinLayer);

    //set up interactive boxes
    this.physics.add.collider(this.player, this.boxTiles, this.overBox, null,  this);
    this.physics.add.collider(this.groundLayer, this.boxTiles);
    this.physics.add.collider(this.boxTiles, this.boxTiles, this.logCollide, null, this); //get boxes to collide so you can stack them
   
  }
  logCollide(a,b){
    a.scene.player.debugText =  `ticks: ${new Date().getTime()}`
    + '\nA-touching:' + JSON.stringify(a.body.touching) 
    + '\nB-touching:' + JSON.stringify(b.body.touching) 
    ;
    return true;
  }
  overBox(player, box){
    //WHy is touching never true :(
    // this.player.debugText =  `ticks: ${new Date().getTime()}`
    // + '\nply-touching:' + JSON.stringify(player.body.blocked) 
    // + '\nbox-touching:' + JSON.stringify(box.body.touching) 
    // ;

    if(Phaser.Input.Keyboard.JustDown(this.spaceKey)){
      console.log('pick up box');
      this.player.overBox(box);
    }

  }
  collectStar(player, star) {
    star.disableBody(true, true);
  }
  createPlayer() {
    this.map.findObject('Player', (obj) => {
      if (this._NEWGAME && this._LEVEL === 1) {
        if (obj.type === 'StartPosition') {
          if (obj.name === 'Bob')
            //this.player = new PlayerContainer(this, obj.x, obj.y, new Player(this, 0,0));
            this.player = new Player(this, obj.x, obj.y);
          if (obj.name === 'Flit')
            this.flit = new Flit(this, obj.x, obj.y);
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

    //get the boxes from the map
    //var b1 = this.map.createDynamicLayer('boxTiles', this.groundTiles, 0, 0);
    var b1 = this.map.createFromObjects('Pushable', 'Box', { key: 'tiles', frame: 3});

    //get an array of the box tiles and create group from them
    var b2 = this.map.createFromTiles(7, null, { key: 'tiles', frame: 3 });
    this.boxTiles = new Phaser.Physics.Arcade.Group(this.world, this, b1, { bounceX: 1 });
    //set the group to respond to physics
    this.physics.world.enable(this.boxTiles);
    this.boxTiles.children.entries.forEach((x) => {
      x.body.setCollideWorldBounds(true); // don't go out of the map
      x.setOrigin(0, 0);
      x.body.overlapX = 10;
    });
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
