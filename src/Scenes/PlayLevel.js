/// <reference path="../../defs/phaser.d.ts" />
import Level from '../Levels/Level.js';
//import GameScene from '../Scenes/Game.js';
import Enums from '../Levels/Tilemaps.js';
import HUD from './HUD.js';

export default class PlayLevelScene extends Phaser.Scene {
    constructor(key) {
        super('PlayLevel');
    }
    preload() {
    }
    create() { 
        // create the map in the scene
        this.map = this.make.tilemap({ key: 'map' });
        //create the level 
        this.level = new Level(this);
    }
    update() {
        //Switch characters
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
            this.switchCharacter();
        }
        //only pass keyboard to player if not switching
        if (!this.level._ChangingPlayer) {
            this.level.ActivePlayer.update(this.cursors, this.spaceKey);
        }
        //sync the background to the camera
        Phaser.Actions.Call(this.level.sky.getChildren(), function (layer) {
            layer.x = this.cameras.main.scrollX;
            layer.tilePositionX = this.cameras.main.scrollX;
        }, this);
    }
    switchCharacter() {
        //stop current player activity
        this.level.ActivePlayer.idle();
        this.level.ActivePlayer.body.setVelocityX(0);
        //get the other character
        this.level.ActivePlayer = this.level.ActivePlayer.is('Bob') ? this.flit : this.player;

        this.level._ChangingPlayer = true;
        //pan the camera 
        this.cameras.main.stopFollow();
        this.cameras.main.pan(this.level.ActivePlayer.x, this.level.ActivePlayer.y, 500, 'Sine.easeInOut', true, (cam, complete, x, y) => {
            if (complete === 1) {
                this.cameras.main.startFollow(this.level.ActivePlayer, true, .1, .1);
                this.level._ChangingPlayer = false;
            }
        });
    }
}