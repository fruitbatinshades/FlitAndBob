/// <reference path="../../defs/phaser.d.ts" />
import Level from '../Levels/Level.js';
//import GameScene from '../Scenes/Game.js';
import Enums from '../Levels/Tilemaps.js';

/**
 * Scene that loads a level with a progress bar.
 */
export default class LevelLoaderScene extends Phaser.Scene {

    switchIds;
    
    startScene = 'LevelLoader';
    startLevel;

    constructor(key, level) {
        super(key);
    }
    preload() {
        this.startLevel = this.game.levels[this.game.levelIndex];
        //get the name of the scene to start from the querystring if there
        let l = getQueryStringValue('level');
        if (l !== '') this.startLevel = l;

        let splash = this.add.image(0, 0, 'SplashBackground').setOrigin(0, .15);
        this.progressBar = this.add.graphics();
        this.progressBar.depth = 11;
        this.progressBox = this.add.graphics();
        this.progressBox.depth = 10;
        
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.scale = splash.width / this.width;
        splash.setScale(this.scale, this.scale);

        this.left = this.width / 2 - 200;
        this.progressBox.lineStyle(6, 0x333333,1);
        this.progressBox.strokeRoundedRect(this.left - 3, 267, 411, 56, 7);
        this.progressBox.fillStyle(0x36B5F5, 1);
        this.progressBox.fillRoundedRect(this.left, 270, 406, 50, 6);
        

        //this.add.image(width / 2, 100, 'Logo');
        this.PlayButton = this.add.image(this.width / 2, 460, 'WoodButton');
        this.PlayButton.alpha = .5;
        this.PlayButton.setInteractive();

        this.playtext = this.make.text({
            x: this.PlayButton.x,
            y: this.PlayButton.y,
            text: this.startLevel,
            style: {
                font: '28px HvdComic',
                fill: '#ffffff'
            }
        }).setOrigin(.5, .5);
        this.playtext.alpha = .5
        this.playtext.depth = 12;
        this.setStroke(this.playtext);

        this.loadingText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 - 60,
            text: 'Loading...',
            style: {
                font: '30px HvdComic',
                fill: '#ffffff'
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        this.percentText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 - 5,
            text: '0%',
            style: {
                font: '28px HvdComic',
                fill: '#ffffff'
            }
        });
        this.percentText.setOrigin(0.5, 0.5).depth = 13;

        this.assetText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 + 50,
            text: '',
            style: {
                font: '28px HvdComic',
                fill: '#ffffff'
            }
        });

        this.assetText.setOrigin(0.5, 0.5);

        this.setStroke(this.loadingText);
        this.setStroke(this.percentText);
        this.setStroke(this.assetText);

        this.load.on('progress', function (value) {
            this.percentText.setText(parseInt(value * 100) + '%');
            this.progressBar.clear();
            this.progressBar.fillStyle(0xC6E5FA, 1);
            this.progressBar.fillRoundedRect(this.left + 6, 278, 394 * value, 36, 7);
        },this);

        this.load.on('fileprogress', function (file) {
            this.assetText.setText('Loading : ' + file.key);
            console.log(file.key);
        },this);

        this.load.on('complete', function () {
            this.progressBar.destroy();
            this.progressBox.destroy();
            this.loadingText.destroy();
            this.percentText.destroy();
            this.assetText.destroy();
        },this);
        this.load.once('filecomplete', this.mapLoaded, this);

           this.load.tilemapTiledJSON(this.startLevel, `assets/Levels/${this.startLevel}.json`);
    }
    create() { 
        console.log('create');
        this.PlayButton.alpha = 1;
        this.playtext.alpha = 1;
        this.PlayButton.on('pointerdown', function () {
            let l = new Level('Level', this.startLevel);
            this.scene.add('Level', l, true);
        }, this);
    }
    levelFinished() {
        this.scene.remove('HUD');
        this.scene.remove('Level');
        if(this.game.levels.length > this.game.levelIndex + 1 ) this.game.levelIndex++;
        this.scene.bringToTop(this);
        this.scene.restart();
    }
    mapLoaded() { 
        this.load.audioSprite('sfx', 'assets/Sound/FlitBob.json', [
            'assets/Sound/FlitBob.ogg',
            'assets/Sound/FlitBob.mp3'
        ]);
        console.log('map loaded');
        // create the map in the scene
        this.map = this.make.tilemap({ key: this.startLevel });
        //load backgrounds from map.properties.Backgrounds (Pipe delimeted filename from tiled)
        this.load.setPath('assets/Levels/Backgrounds/');
        this.map.properties["Backgrounds"].split('|').forEach((b) => {
            let name = b.substr(0, b.lastIndexOf('.'));
            b.endsWith('.svg') ? this.load.svg(name, b) : this.load.image(name, b);
        });

        //load tilesets
        this.load.setPath('assets/Levels/');
        this.map.tilesets.forEach((b) => {
            this.load.image(b.name);
            console.log(b.name);
        });
    }

    setStroke(txt) {
        txt.setShadow(3, 3, '#000000', 6, true, false)
            .setStroke('#1493F5', 6)
            .setFontStyle('bold');
    }
}