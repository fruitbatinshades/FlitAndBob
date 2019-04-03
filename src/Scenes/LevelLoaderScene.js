/// <reference path="../../defs/phaser.d.ts" />
import Level from '../Levels/Level.js';
//import GameScene from '../Scenes/Game.js';
import Enums from '../Levels/Tilemaps.js';
import HUD from './HUD.js';
/**
 * Scene that loads a level with a progress bar.
 */
export default class LevelLoaderScene extends Phaser.Scene {

    switchIds;
    
    constructor(key) {
        super(key);
    }
    preload() {
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });

        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
        this.load.once('filecomplete', this.mapLoaded, this);

        //Load the selected level
        this.load.tilemapTiledJSON('map', 'assets/Levels/L1.json');
    }
    create() { 
        this.level.buildLevel(this);
        this.scene.add('HUD', HUD, true, { x: 400, y: 300 });
    }
    mapLoaded() { 
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
            layer.tilePositionX = this.cameras.main.scrollX ;
            ////Scroll background
            //layer.tilePositionX += Math.round(this.game.ActivePlayer.body.velocity.x / 100);
        }, this);
        //this.game.DebugG.clear();
    }
    switchCharacter() {
        //stop current player activity
        this.level.ActivePlayer.idle();
        this.level.ActivePlayer.body.setVelocityX(0);
        //get the other character
        //this.level.ActivePlayer = this.level.ActivePlayer.constructor.name === 'Player' ? this.flit : this.player;
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