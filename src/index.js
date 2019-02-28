//import Phaser from './phaser.js';
import config from './config.js';
import GameScene from './Scenes/Game.js';
import BootScene from './Scenes/Boot.js';
// import UIScene from './Scenes/UI';

class Game extends Phaser.Game {
  constructor () {
    super(config);
    this.scene.add('Boot', BootScene);
    this.scene.add('Game', GameScene);
    //this.scene.add('UI', UIScene);
    this.scene.start('Boot');
  }
}

window.game = new Game();
// window.addEventListener('resize', (event) => {
//   window.game.resize(window.innerWidth, window.innerHeight);
// });