/// <reference path="../defs/phaser.d.ts" />

import config from './config.js';
//import GameScene from './Scenes/Game.js';
import BootScene from './Scenes/Boot.js';
import LevelLoaderScene from './Scenes/LevelLoaderScene.js';
// import UIScene from './Scenes/UI';

class Game extends Phaser.Game {
  levels = [
    'Example', 'L1', 'L2'
  ];
  levelIndex = 0;

  constructor() {
    super(config);
    //this.game.device.desktop
    //Create global variables for access across all scene instances
    this.Bob = null; //Bob Character
    this.Flit = null; //Flit Character
    this.DebugG = null; //Debug graphics object create in active scene as assigned here
    this._ChangingPlayer = false; //Whether we are currenty changing between players
    this.scene.add('Boot', BootScene);
    this.scene.add('LevelLoader', LevelLoaderScene);
    this.scene.start('Boot');
  }
  /**
   * Pan the camera and then return to player
   * @param {Phaser.Scene} scene
   * @param {Phaser.Geom.Rectangle} rect 
   */
  panAndReturn(scene, rect) { 
    if (!Phaser.Geom.Rectangle.ContainsRect(scene.cameras.main.worldView, rect)) {
      try {
        scene.cameras.main.once('camerapancomplete', () => {
          //pan 2 - will be called once when pan 1 completes
          scene.cameras.main.pan(scene.ActivePlayer.x, scene.ActivePlayer.y, 1000, 'Sine.easeInOut');
        });
        //pan 1 - pan to target
        scene.cameras.main.pan(rect.x + rect.width / 2, rect.y + rect.height / 2, 1000, 'Sine.easeInOut');
      } catch (e) { }
    }
  }
  /**
   * Draws Touching, Blocked, CheckCollsion and origin on a sprite/sprite[]
   * @param {Phaser.GameObjects.Sprite} a Sprite or Sprite Array to draw debug on
   */
  drawCollision(a) {
    let items = [];
    if (Array.isArray(a)) {
      items = a;
    } else {
      items = [a];
    }
    for (let i = 0; i < items.length; i++) {
      var b = items[i].body;
      let midW = b.left + (b.width / 2); // center of body
      let midH = b.top + (b.height / 2); // center of body
      this.DebugG.depth = 100;
      this.DebugG.blendMode = 4;
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
          this.DebugG.lineStyle(collisionW, collisionC, 1);
          this.DebugG.lineBetween(b.left - collisionW, b.top + collisionTrim, b.left - collisionW, b.bottom - collisionTrim);
        }
        if (b.checkCollision.right) {
          this.DebugG.lineStyle(collisionW, collisionC, 1);
          this.DebugG.lineBetween(b.right + collisionW, b.top + collisionTrim, b.right + collisionW, b.bottom - collisionTrim);
        }
        if (b.checkCollision.up) {
          this.DebugG.lineStyle(collisionW, collisionC, 1);
          this.DebugG.lineBetween(b.left + collisionTrim, b.top - collisionW, (b.left + b.width) - collisionTrim, b.top - collisionW);
        }
        if (b.checkCollision.down) {
          this.DebugG.lineStyle(collisionW, collisionC, 1);
          this.DebugG.lineBetween(b.left + collisionTrim, b.bottom + collisionW, (b.left + b.width) - collisionTrim, b.bottom + collisionW);
        }
      }
      //Show a large arrow for touching
      if (b.touching.none === false) {
        this.DebugG.lineStyle(3, touchingC);
        if (b.touching.down) {
          this.DebugG.strokeTriangle(midW - 15, b.bottom - 15, midW + 15, b.bottom - 15, midW, b.bottom)
        }
        if (b.touching.up) {
          this.DebugG.strokeTriangle(midW - 15, b.top + 15, midW + 15, b.top + 15, midW, b.top)
        }
        if (b.touching.left) {
          this.DebugG.strokeTriangle(b.left, midH - 15, b.left + 15, midH, b.left, midH + 15);
        }
        if (b.touching.right) {
          this.DebugG.strokeTriangle(b.right, midH - 15, b.right - 15, midH, b.right, midH + 15);
        }
      }

      //Show a small arrow for blocked
      if (b.blocked.none === false) {
        this.DebugG.lineStyle(3, blockedC);
        if (b.blocked.up) {
          this.DebugG.strokeTriangle(midW - 10, b.top + 10, midW + 10, b.top + 10, midW, b.top)
        }
        if (b.blocked.down) {
          this.DebugG.strokeTriangle(midW - 10, b.bottom - 10, midW + 10, b.bottom - 10, midW, b.bottom)
        }
        if (b.blocked.left) {
          this.DebugG.strokeTriangle(b.left, midH - 10, b.left + 10, midH, b.left, midH + 10);
        }
        if (b.blocked.right) {
          this.DebugG.strokeTriangle(b.right, midH - 10, b.right - 10, midH, b.right, midH + 10);
        }
      }
      //Show the origin point
      this.DebugG.fillStyle(0xFF0000);
      this.DebugG.fillCircle(b.left + (b.width * a.originX), b.top + (b.height * a.originY), 4);
    }
  }
  cartoonText(txt) {
    txt.setShadow(3, 3, '#000000', 6, true, false)
      .setStroke('#1493F5', 6);
  }
  shadowText(txt) {
    txt.setShadow(3, 3, '#000000', 6, true, false)
      .setStroke('#000000', 2);
  }
}

window.game = new Game();
// window.addEventListener('resize', (event) => {
//   window.game.resize(window.innerWidth, window.innerHeight);
// });