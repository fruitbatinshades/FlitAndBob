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
  urlParams;
  rects = [];
  objs = [];
  _debugOn = false;
  get debugOn() {
    return this._debugOn;
  }
  set debugOn(value) {
    this._debugOn = value;
    this.config.physics.arcade.debug = this._debugOn;
  }

  constructor() {
    super(config);
    this.urlParams = new URLSearchParams(window.location.search.toLowerCase());
    this.debugOn = this.urlParams.has('debug');
    //this.game.device.desktop
    //Create global variables for access across all scene instances
    this.Bob = null; //Bob Character
    this.Flit = null; //Flit Character
    //scene.DebugG = null; //Debug graphics object create in active scene as assigned here
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
        //stop following else the pan X/Y is incorrect
        scene.cameras.main.stopFollow();
        scene.cameras.main.once('camerapancomplete', () => {
          //pan 2 - will be called once when pan 1 completes
          scene.cameras.main.pan(scene.ActivePlayer.x, scene.ActivePlayer.y, 1000, 'Sine.easeInOut', false, (camera, progress, scrollX, scrollY) => {
            if (progress === 1) {
              //restore follow
              scene.cameras.main.startFollow(scene.ActivePlayer);
            }
          });
        });
        //pan 1 - pan to target
        scene.cameras.main.pan(rect.x + rect.width / 2, rect.y + rect.height / 2, 1000, 'Sine.easeInOut');
    }
  }
  /**
   * Draws Touching, Blocked, CheckCollsion and origin on a sprite/sprite[]
   * @param {Phaser.GameObjects.Sprite} a Sprite or Sprite Array to draw debug on
   */
  drawCollision(scene) {
    if (!scene.DebugG) {
      scene.DebugG = scene.add.graphics();
      scene.DebugG.depth = 1000;
      scene.DebugG.blendMode = 4;
    }
    scene.DebugG.clear();
    if (this.debugOn) {
      let items = [];
      if (Array.isArray(this.objs)) {
        items = this.objs.flat();
      } else {
        items = [this.objs];
      }
      //width of collision check line
      let collisionW = 3;
      //shorten collision check line by this amount * 2, just to keep the display a bit cleaner
      let collisionTrim = 10;

      //color of collision check lines
      let collisionC = 0xFFFFFF;
      // colour of onFloor
      let onFloorC = 0xFF0000;
      //colour of touching triangle
      let touchingC = 0xFF00FF;
      //colour of blocked triangle
      let blockedC = 0xFFFF00;
      scene.DebugG.alpha = .75;

      for (let i = 0; i < items.length; i++) {
        var b = items[i].body;
        let midW = b.left + (b.width / 2); // center of body
        let midH = b.top + (b.height / 2); // center of body
      
        if (b) {
          //Show lines for collision checks
          if (b.checkCollision.none === false) {
            if (b.checkCollision.left) {
              scene.DebugG.lineStyle(collisionW, collisionC, 1);
              scene.DebugG.lineBetween(b.left - collisionW, b.top + collisionTrim, b.left - collisionW, b.bottom - collisionTrim);
            }
            if (b.checkCollision.right) {
              scene.DebugG.lineStyle(collisionW, collisionC, 1);
              scene.DebugG.lineBetween(b.right + collisionW, b.top + collisionTrim, b.right + collisionW, b.bottom - collisionTrim);
            }
            if (b.checkCollision.up) {
              scene.DebugG.lineStyle(collisionW, collisionC, 1);
              scene.DebugG.lineBetween(b.left + collisionTrim, b.top - collisionW, (b.left + b.width) - collisionTrim, b.top - collisionW);
            }
            if (b.checkCollision.down) {
              scene.DebugG.lineStyle(collisionW, collisionC, 1);
              scene.DebugG.lineBetween(b.left + collisionTrim, b.bottom + collisionW, (b.left + b.width) - collisionTrim, b.bottom + collisionW);
            }
            if (b.onFloor()) {
              scene.DebugG.lineStyle(collisionW, onFloorC, 1);
              scene.DebugG.lineBetween(b.left + collisionTrim, b.bottom + collisionW, (b.left + b.width) - collisionTrim, b.bottom + collisionW);
            }
          }
          //Show a large arrow for touching
          if (b.touching.none === false) {
            scene.DebugG.lineStyle(3, touchingC);
            if (b.touching.down) {
              scene.DebugG.strokeTriangle(midW - 15, b.bottom - 15, midW + 15, b.bottom - 15, midW, b.bottom)
            }
            if (b.touching.up) {
              scene.DebugG.strokeTriangle(midW - 15, b.top + 15, midW + 15, b.top + 15, midW, b.top)
            }
            if (b.touching.left) {
              scene.DebugG.strokeTriangle(b.left, midH - 15, b.left + 15, midH, b.left, midH + 15);
            }
            if (b.touching.right) {
              scene.DebugG.strokeTriangle(b.right, midH - 15, b.right - 15, midH, b.right, midH + 15);
            }
          }

          //Show a small arrow for blocked
          if (b.blocked.none === false) {
            scene.DebugG.lineStyle(3, blockedC);
            if (b.blocked.up) {
              scene.DebugG.strokeTriangle(midW - 10, b.top + 10, midW + 10, b.top + 10, midW, b.top)
            }
            if (b.blocked.down) {
              scene.DebugG.strokeTriangle(midW - 10, b.bottom - 10, midW + 10, b.bottom - 10, midW, b.bottom)
            }
            if (b.blocked.left) {
              scene.DebugG.strokeTriangle(b.left, midH - 10, b.left + 10, midH, b.left, midH + 10);
            }
            if (b.blocked.right) {
              scene.DebugG.strokeTriangle(b.right, midH - 10, b.right - 10, midH, b.right, midH + 10);
            }
          }
          //Show the origin point
          scene.DebugG.fillStyle(0xFF0000);
          scene.DebugG.fillCircle(b.left + (b.width * b.originX), b.top + (b.height * b.originY), 4);
        }
      
        if (this.rects.length !== 0) {
          for (let i = 0; i < this.rects.length; i++) {
            scene.DebugG.lineStyle(2, this.rects[i].color || 0x00FF00, 1);
            scene.DebugG.strokeRect(this.rects[i].x, this.rects[i].y, this.rects[i].width, this.rects[i].height);
          }
        }
      }
    }
    //empty array
    this.rects.length = 0;
    this.objs.length = 0;
  }
  /**
   * Get the bodies surrounding the body passed in (Phaser 3.17.*)
   * N.B. The last item found will be the one set as earlier ones are overwritten
   * @param {Phaser.Physics.Arcade.Body} body The body to look around
   * @param {Array} ignore Items to ignore when checking
   * @param {number} margin The distance to look
   * @param {gridsize} gridSize divides position by gridSize pixels so small differences in height/Y/X don't push into wrong section of the grid
   */
  getBodiesAround(body, ignore, margin = 5, gridSize = 16) {
    ignore = ignore || [];
    let around = body.gameObject.scene.physics.overlapRect(body.x - margin, body.y - margin, body.width + (margin * 2), body.height + (margin * 2));
    let range = new Phaser.Geom.Rectangle(body.x - margin, body.y - margin, body.width + (margin * 2), body.height + (margin * 2));
    let mm = margin - 1;
    let mp = margin + 1;
    
    let tl = new Phaser.Geom.Rectangle(Math.floor(body.left) - mp, Math.floor(body.top) - mp, margin, margin);
    let tc = new Phaser.Geom.Rectangle(Math.floor(body.left) + 2, Math.floor(body.top) - mp, Math.floor(body.width) - 4, margin);
    let tr = new Phaser.Geom.Rectangle(Math.floor(body.right) + 1, Math.floor(body.top) - mp, margin, margin);
    
    let cl = new Phaser.Geom.Rectangle(Math.floor(body.left) - mp, Math.floor(body.top) + 2, margin, Math.floor(body.height) - 6);
    //let cc = new Phaser.Geom.Rectangle(Math.floor(body.left), body.top, body.width, body.height);
    let cr = new Phaser.Geom.Rectangle(Math.floor(body.right) + 1, Math.floor(body.top) + 2, margin, Math.floor(body.height) - 6);

    let bl = new Phaser.Geom.Rectangle(Math.floor(body.left) - mp, Math.floor(body.bottom), margin, margin);
    let bc = new Phaser.Geom.Rectangle(Math.floor(body.left) + 2, Math.floor(body.bottom), Math.floor(body.width) - 4, margin);
    let br = new Phaser.Geom.Rectangle(Math.floor(body.right) + 1, Math.floor(body.bottom), margin, margin);

    let grid = new aroundGrid();

    around.forEach((o) => {
      if (o !== body && !ignore.includes(o)) {
        let oRect = new Phaser.Geom.Rectangle(o.x + 1, o.y + 1, o.width -2, o.height -2);
        
        if (!Phaser.Geom.Rectangle.ContainsRect(range, oRect)) { //ignore anything we are overlapping
          if (Phaser.Geom.Intersects.RectangleToRectangle(tl, oRect)) { grid.aboveLeft = o; tl.color = 0xFF0000; }
          if (Phaser.Geom.Intersects.RectangleToRectangle(tc, oRect)) { grid.above = o; tc.color = 0xFF0000; }
          if (Phaser.Geom.Intersects.RectangleToRectangle(tr, oRect)) { grid.aboveRight = o; tr.color = 0xFF0000; }
          if (Phaser.Geom.Intersects.RectangleToRectangle(cl, oRect)) { grid.left = o; cl.color = 0xFF0000; }
          if (Phaser.Geom.Intersects.RectangleToRectangle(cr, oRect)) { grid.right = o; cr.color = 0xFF0000; }
          if (Phaser.Geom.Intersects.RectangleToRectangle(bl, oRect)) { grid.belowLeft = o; bl.color = 0xFF0000; }
          if (Phaser.Geom.Intersects.RectangleToRectangle(bc, oRect)) { grid.below = o; bc.color = 0xFF0000; }
          if (Phaser.Geom.Intersects.RectangleToRectangle(br, oRect)) { grid.belowLeft = o; br.color = 0xFF0000; }
        }
      }
      
      if (this.debugOn) {
        this.rects.push(new Phaser.Geom.Rectangle(o.x , o.top , o.width , o.height ));
        this.rects.push(tl);
        this.rects.push(tc);
        this.rects.push(tr);
        this.rects.push(cl);
        //this.rects.push(cc);
        this.rects.push(cr);
        this.rects.push(bl);
        this.rects.push(bc);
        this.rects.push(br);
      }
    });
    return grid;
  }

  getUnder(body, margin = 5) {
    return body.gameObject.scene.physics.overlapRect(body.x + margin, body.y, body.width - margin, body.height + margin);
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
/** Grid of objects - returned from getBodiesAround() */
class aroundGrid{
  _last = '';
  aboveLeft = null;
  above = null;
  aboveRight = null;
  left = null;
  center = null;
  right = null;
  belowLeft = null;
  below = null;
  belowRight = null;
  debug() {
    let output = '';
    Object.entries(this).forEach(([key, value]) => {
      if (value && value !== null)
        output += `${key}: ${value.gameObject.name}\n`;
    });
    if (output !== this._last) {
      this._last = output;
      console.log(this._last)
    }
  }
}

window.game = new Game();
