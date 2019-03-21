//import Phaser from '../phaser.js';

function getQueryStringValue(key) {
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
} 

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
   this.load.tilemapTiledJSON('map', 'assets/workout.json');
   // tiles in spritesheet 
    this.load.spritesheet('tiles', 'assets/Grass_Platform2.png', {frameWidth: 64, frameHeight: 64});
   this.load.image('trees', 'assets/trees.png');
    this.load.image('mountains', 'assets/snowymountains.png');
    this.load.image('largegrass', 'assets/largegrass.png');
    //this.load.image('grassground', 'assets/grassground.png');
   // simple coin image
    this.load.image('coin', 'assets/coinGold.png');
    this.load.image('blob', 'assets/blob.png');
   // player animations
    this.load.atlas('flit', 'assets/Flit/Flit2.png', 'assets/flit/flit2.json');
    this.load.atlas('bob', 'assets/bob/bob.png', 'assets/bob/bob.json');
    this.load.atlas('clouds', 'assets/clouds.png', 'assets/clouds.json');
  }

  create() {
    let startScene = 'Game';
    //get the name of the scene to start from the querystring
    let s = getQueryStringValue('scene');
    if (s !== '') startScene = s;

    this.scene.start(startScene, { level: 1, newGame: true, levels: this.levels });
  }
};
