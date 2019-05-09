//import Phaser from '../phaser.js';

export default class BootScene extends Phaser.Scene {
  constructor (key) {
    super(key);
  }

  preload () {
  // tiles in spritesheet 
    this.load.spritesheet('ComponentSheet', 'assets/Levels/components.png', { frameWidth: 64, frameHeight: 64, margin:1, spacing: 2 }); //Required for icons from the component sheet
    this.load.image('SplashBackground', 'assets/TemporaryBackground-min.png');
    this.load.image('splat', 'assets/splat.png'); //death image
    // this.load.image('ui', 'assets/ui.png'); //ui
    this.load.image('rock', 'assets/BigStone.png'); 
    this.load.image('deadWeight', 'assets/DeadWeight.png'); 
  //  // player animations
    this.load.atlas('flit', 'assets/Flit/flit2.png', 'assets/Flit/flit2.json');
    this.load.atlas('bob', 'assets/Bob/bob.png', 'assets/Bob/bob.json');
    this.load.atlas('UI', 'assets/ui.png', 'assets/ui.json');
  //   this.load.atlas('clouds', 'assets/clouds.png', 'assets/clouds.json');
  }

  create() {
    let startScene = 'LevelLoader';
    let startLevel = 'Example.json';
    //get the name of the scene to start from the querystring
    let l = this.game.urlParams.get('level');
    let s = this.game.urlParams.get('scene');
    //let l = getQueryStringValue('level');
    if (s !== null) startScene = s;
    if (l !== null) startLevel = l;

    this.scene.start(startScene, { level: startLevel, newGame: true, levels: this.levels });
  }
};
