/// <reference path="../../defs/phaser.d.ts" />
import Player from '../Sprites/Player.js';
import Flit from '../Sprites/Flit.js';
import PlayerContainer from '../Groups/PlayerContainer.js';
//import Coins from '../Groups/Coins.js';

export default class GameScene extends Phaser.Scene {
  constructor (key) {
    super(key);
  }
  
  init (data) {
    this._LEVEL = data.level;
    this._LEVELS = data.levels;
    this._NEWGAME = data.newGame;
    this.loadingLevel = false;
    this._SCORE = 0;
    //Currently selected character
    this._ActivePlayer = null;
    //Camera is transitioning between player
    this._ChangingPlayer = false;
    if (this._NEWGAME) this.events.emit('newGame');
  }

  create () {
    // listen for player input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // create our tilemap
    this.createMap();
    // create our player
    this.createPlayer();
    // add collisions
    this.addCollisions();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // update our camera
    this.cameras.main.startFollow(this.player);
    this._ActivePlayer = this.player;
    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');

    // this text will show the score
    this.text = this.add.text(20, 20, '0', {
        fontSize: '30px',
        strokeThickness: 1,
        fill: '#ffffff',
        shadow: {
            offsetX: 1,
            offsetY: 1,
            color: '#000',
            blur: 2,
            stroke: true,
            fill: false
        }
    });
    this.notes = this.add.text(20, 60, '0', {
      fontSize: '20px',
      strokeThickness: 1,
      fill: '#ffffff'
  });
    // fix the text to the camera
    this.text.setScrollFactor(0);
    this.notes.setScrollFactor(0);
  }
  switchCharacter(){
    //stop current player activity
    this._ActivePlayer.idle();
    this._ActivePlayer.body.setVelocityX(0);
    //get the other character
    this._ActivePlayer = this._ActivePlayer.constructor.name === 'Player' ? this.flit : this.player;
    this._ChangingPlayer = true;
    //pan the camera 
    this.cameras.main.stopFollow();
    this.cameras.main.pan(this._ActivePlayer.x, this._ActivePlayer.y, 1000, 'Sine.easeInOut',true, (cam, complete, x ,y) => {
     if(complete === 1)
     {
        this.cameras.main.startFollow(this._ActivePlayer, true, .1, .1);
        this._ChangingPlayer = false;
     }
    });
  }
  update () {
    //Switch characters
    if(Phaser.Input.Keyboard.JustDown(this.shiftKey)){
      this.switchCharacter();
    }
    if(!this._ChangingPlayer){
      this._ActivePlayer.update(this.cursors);
    }
    this.banana.children.entries.forEach(function(b){
      b.body.setVelocityX(0);
    });
    this.notes.setText(this._ActivePlayer.player.anims.currentFrame.textureFrame);
    
  }

  addCollisions () {
      // player will collide with the level tiles 
    this.physics.add.collider(this.groundLayer, this.player);
    this.physics.add.collider(this.groundLayer, this.flit);
    this.coinLayer.setTileIndexCallback(17, this.collectCoin, this);
    // when the player overlaps with a tile with index 17, collectCoin 
    // will be called    
    this.physics.add.overlap(this.player, this.coinLayer);
    this.physics.add.overlap(this.flit, this.coinLayer);
    this.physics.add.collider(this.banana, this.player, this.collideObjects.bind(this.player), null, this);
    this.physics.add.collider(this.groundLayer, this.banana);
  }

  collectStar(player, star)
{
    star.disableBody(true, true);
}
  createPlayer () {
    this.map.findObject('Player', (obj) => {
      if (this._NEWGAME && this._LEVEL === 1) {
          if (obj.type === 'StartPosition') {
            if(obj.name === 'Bob')
              this.player = new PlayerContainer(this, obj.x, obj.y, new Player(this, 0,0));
            if(obj.name === 'Flit')
              this.flit = new Flit(this, obj.x, obj.y);
        }
      }
    });
  }
  pushBox(sprite, tile){

  }
  
  collideObjects(sprite, tile) {
    sprite.body.setVelocityX(0);
    tile.body.setVelocityX(0);

//this._ActivePlayer.addChild(tile);
    // var sa = tile.body.touching;

     if(tile.body.touching.left || sprite.body.touching.right ){
       console.log('touch');
     }
     tile.body.setVelocityX(400).setBounce(1);
    // }
    //tile.setVelocityX(0);

    console.log('hit');
}
    // this function will be called when the player touches a coin
    collectCoin(sprite, tile) {
        this.coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
        this._SCORE++; // add 10 points to the score
        this.text.setText(this._SCORE); // set the text to show the current score
        return false;
    }

  createMap () {
    // load the map 
    this.map = this.make.tilemap({key: 'map'});

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
     var b1 = this.map.createDynamicLayer('Banana', this.groundTiles, 0, 0);
     //get an array of the box tiles
     var b2 = this.map.createFromTiles(7, null, {key:'tiles', frame: 3});
     //change origin
     b2.forEach((x) =>{
        x.setOrigin(0,0);
    });
    //create a new physics group
     this.banana = new Phaser.Physics.Arcade.Group(this.world, this, b2, { bounceX: 1});
     //set the group to respond to physics
     this.physics.world.enable(this.banana);
      //this.banana.setCollisionByExclusion([-1]);

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
