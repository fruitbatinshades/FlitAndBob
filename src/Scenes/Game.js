/// <reference path="../../defs/phaser.d.ts" />
import Player from '../Sprites/Player.js';
import Flit from '../Sprites/Flit.js';
//import PlayerContainer from '../Groups/PlayerContainer.js';
import Settings from '../settings.js';
import Utils from '../Utils/Debug.js';
import fbisUtils from '../Utils/Debug.js';
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

    this.graphics = this.add.graphics();
    this.physics.collide(this.boxTiles, this.boxTiles);
    this.physics.collide(this.boxTiles, this.groundLayer);
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
    //this.physics.collide(this.boxTiles, this.boxTiles);
    // this.boxTiles.children.entries.forEach(function (b) {
    //   b.body.setVelocityX(0);
    //   //THe boxes drop through each other unles we manually check and make them make immovable
    //   if (b.body.moves && (b.body.blocked.down || b.body.touching.down || b.body.blocked.up || b.body.touching.up) && Math.abs(b.body.deltaY()) < 1)
    //   {
    //     b.body.immovable = true;
    //     b.body.moves = false;
    //     b.body.speed = 0;
    //     b.tint = 0x00FF00;
    //   }else{
    //     b.body.immovable = false;
    //     b.body.moves = true;
    //   }
    // });
    this.boxTiles.children.entries.forEach(function (b) {
      //if (b.body.touching.none && b.body.blocked.none) b.tint = 0xFF0000;
      b.body.setVelocityX(0);
      // if (b.body.onFloor())
      //   b.tint = 0xFF0000;
      // else
      //   b.tint = 0xFFFFFF;
    });

    //sync the background to the camera
    Phaser.Actions.Call(this.background.getChildren(), function(layer) {
      layer.x = this.cameras.main.scrollX;
      ////Scroll background
      //layer.tilePositionX += Math.sign(this._ActivePlayer.body.velocity.x);
    }, this);
    this.graphics.clear();
    Phaser.Actions.Call(this.boxTiles.getChildren(), function(a){
      this.drawCollision(a);
    }, this);
    this.drawCollision(this.player);
    this.drawCollision(this.flit);
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
    this.physics.add.collider(this.flit, this.boxTiles, this.overBox, null,  this);
    this.physics.add.collider(this.groundLayer, this.boxTiles, this.stopOnGround);
    this.physics.add.collider(this.boxTiles, this.boxTiles, this.stopOnBox, null, this); //get boxes to collide so you can stack them
   
  }
  stopOnGround(box, ground){
    box.allowGravity = false;
    box.immovable = true;
    box.moves = false;
    box.enabled = false;
    // box.tint = 0x0000FF;
    //ground.tint = 0xFF00FF;
  }
  stopOnBox(a,b){
    console.log('box hit');
    a.body.immovable = true;
    a.body.moves = false;
    a.body.enabled = false;
    // a.tintFill = true;
    // a.tint = 0xCCCCCC;
  }
  overBox(player, box){
    if(Phaser.Input.Keyboard.JustDown(this.spaceKey)){
      this._ActivePlayer.overBox(box);
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

    //set up the background
    this.background = this.add.group('background');
    this.background.add(this.add.tileSprite(0, this.game.canvas.clientHeight - 80, this.game.canvas.clientWidth, 256, 'mountains'));
    this.background.add(this.add.tileSprite(0, this.game.canvas.clientHeight - 80, this.game.canvas.clientWidth, 256, 'trees'));

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

    //get the boxes from the map
    var pushableBoxes = this.map.createFromObjects('Pushable', 'Box', { key: 'tiles', frame: 3});
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
      x.body.checkCollision.left = true;
      x.body.checkCollision.right = true;
      x.body.moves = false;
      x.name = 'Box_' + i;
    }
    //   //x.body.mass = 2;
    //   //x.body.overlapX = 10;
    console.log('built boxTiles');
    // set the boundaries of our game world
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;
  }

  drawCollision(a) {
    var b = a.body;
    let midW = b.left + (b.width / 2); // center of body
    let midH = b.top + (b.height / 2); // center of body
    this.graphics.depth = 100;
    this.graphics.blendMode = 4;
    //width of collision check line
    let collisionW = 3;
    //shorten collision check line by this amount * 2, just to keep the display a bit cleaner
    let collisionTrim = 10;

    //color of collision check lines
    let collisionC = 0xFFFFFF;
    //colour of touching triangle
    let touchingC = 0xFFFFFF;
    //colour of blocked triangle
    let blockedC = 0xFFFFFF;

    //Show lines for collision checks
    if (b.checkCollision.none === false) {
      if (b.checkCollision.left) {
        this.graphics.lineStyle(collisionW, collisionC, 1);
        this.graphics.lineBetween(b.left - collisionW, b.top + collisionTrim, b.left - collisionW, b.bottom - collisionTrim);
      }
      if (b.checkCollision.right) {
        this.graphics.lineStyle(collisionW, collisionC, 1);
        this.graphics.lineBetween(b.right + collisionW, b.top + collisionTrim, b.right + collisionW, b.bottom - collisionTrim);
      }
      if (b.checkCollision.up) {
        this.graphics.lineStyle(collisionW, collisionC, 1);
        this.graphics.lineBetween(b.left + collisionTrim, b.top - collisionW, (b.left + b.width) - collisionTrim, b.top - collisionW);
      }
      if (b.checkCollision.down) {
        this.graphics.lineStyle(collisionW, collisionC, 1);
        this.graphics.lineBetween(b.left + collisionTrim, b.bottom + collisionW, (b.left + b.width) - collisionTrim, b.bottom + collisionW);
      }
    }
    //Show a large arrow for touching
    if (b.touching.none === false) {
      this.graphics.lineStyle(3, touchingC);
      if (b.touching.down) {
        this.graphics.strokeTriangle(midW - 15, b.bottom - 15, midW + 15, b.bottom - 15, midW, b.bottom)
      }
      if (b.touching.up) {
        this.graphics.strokeTriangle(midW - 15, b.top + 15, midW + 15, b.top + 15, midW, b.top)
      }
      if (b.touching.left) {
        this.graphics.strokeTriangle(b.left, midH - 15, b.left + 15, midH, b.left, midH + 15);
      }
      if (b.touching.right) {
        this.graphics.strokeTriangle(b.right, midH - 15, b.right - 15, midH, b.right, midH + 15);
      }
    }

    //Show a small arrow for blocked
    if (b.blocked.none === false) {
      this.graphics.lineStyle(3, blockedC);
      if (b.blocked.up) {
        this.graphics.strokeTriangle(midW - 10, b.top + 10, midW + 10, b.top + 10, midW, b.top)
      }
      if (b.blocked.down) {
        this.graphics.strokeTriangle(midW - 10, b.bottom - 10, midW + 10, b.bottom - 10, midW, b.bottom)
      }
      if (b.blocked.left) {
        this.graphics.strokeTriangle(b.left, midH - 10, b.left + 10, midH, b.left, midH + 10);
      }
      if (b.blocked.right) {
        this.graphics.strokeTriangle(b.right, midH - 10, b.right - 10, midH, b.right, midH + 10);
      }
    }
    //Show the origin point
    this.graphics.fillStyle(0xFF0000);
    this.graphics.fillCircle(b.left + (b.width * a.originX), b.top + (b.height * a.originY), 4);
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
