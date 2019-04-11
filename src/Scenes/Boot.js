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
      1: 'L1',
      2: 'L2'
    };
  //  // map made with Tiled in JSON format
  //  this.load.tilemapTiledJSON('map', 'assets/Levels/workout.json');
  //  // tiles in spritesheet 
    this.load.spritesheet('ComponentSheet', 'assets/Levels/components.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('SplashBackground', 'assets/TemporaryBackground-min.png');
    this.load.image('Logo', 'assets/TemporaryLogo.png');
    this.load.image('WoodButton', 'assets/TemporaryWoodButton.png');
    this.load.image('splat', 'assets/splat.png');
  //   this.load.image('largegrass', 'assets/largegrass.png');
  //   this.load.image('header', 'assets/header.png');
  //   this.load.svg('gnome', 'assets/levels/backgrounds/gnome.svg');
  //   this.load.image('walltile', 'assets/levels/backgrounds/wallTile.svg'); 
  //   this.load.image('bricktile', 'assets/levels/backgrounds/BrickTile.svg'); 
  //   this.load.image('components', 'assets/levels/components.png'); 
  //   this.load.image('bigStone', 'assets/bigStone.png');
  //   this.load.image('blob', 'assets/blob.png');
  //  // player animations
    this.load.atlas('flit', 'assets/Flit/flit2.png', 'assets/Flit/flit2.json');
    this.load.atlas('bob', 'assets/Bob/bob.png', 'assets/Bob/bob.json');
  //   this.load.atlas('clouds', 'assets/clouds.png', 'assets/clouds.json');
  }

  create() {
    let startScene = 'LevelLoader';
    //get the name of the scene to start from the querystring
    let s = getQueryStringValue('scene');
    if (s !== '') startScene = s;

    this.scene.start(startScene, { level: 'L1', newGame: true, levels: this.levels });
  }
};
