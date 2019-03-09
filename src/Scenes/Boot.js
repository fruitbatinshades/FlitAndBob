//import Phaser from '../phaser.js';

export default class BootScene extends Phaser.Scene {
  constructor (key) {
    super(key);
  }

  preload () {
    this.levels = {
      1: 'level1',
      2: 'level2'
    };
   // map made with Tiled in JSON format
   this.load.tilemapTiledJSON('map', 'assets/map.json');
   // tiles in spritesheet 
   this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight: 70});
   this.load.image('trees', 'assets/trees.png');
   this.load.image('mountains', 'assets/snowymountains.png');
   // simple coin image
   this.load.image('coin', 'assets/coinGold.png');
   // player animations
   this.load.atlas('player', 'assets/player.png', 'assets/player.json');
   // player animations
   this.load.atlas('flit', 'assets/Flit/flit_spritesheet.png', 'assets/flit/flit_spritesheet.json');
   this.load.atlas('bob', 'assets/bob/bob_spritesheet.png', 'assets/bob/bob_spritesheet.json');
  }

  create () {
    this.scene.start('Game', { level: 1, newGame: true, levels: this.levels });
  }
};
