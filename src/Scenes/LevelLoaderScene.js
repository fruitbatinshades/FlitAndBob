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
    
    startScene = 'LevelLoader';
    startLevel = 'Example';

    constructor(key, level) {
        super(key);
    }
    preload() {
        let splash = this.add.image(0, 0, 'SplashBackground').setOrigin(0, .15);
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var scale = splash.width / width;
        splash.setScale(scale , scale);

        var left = width / 2 - 200;
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(left, 270, 400, 50);

        //this.add.image(width / 2, 100, 'Logo');
        this.PlayButton = this.add.image(width / 2, 460, 'WoodButton');
        this.PlayButton.alpha = .5;
        this.PlayButton.setInteractive();

        this.playtext = this.make.text({
            x: this.PlayButton.x,
            y: this.PlayButton.y,
            text: 'Play',
            style: {
                font: '30px monospace',
                fill: '#ffffff'
            }
        }).setOrigin(.5, .5);
        this.playtext.alpha = .5
        this.setStroke(this.playtext);

        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '30px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '28px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '28px monospace',
                fill: '#ffffff'
            }
        });

        assetText.setOrigin(0.5, 0.5);

        this.setStroke(loadingText);
        this.setStroke(percentText);
        this.setStroke(assetText);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x00AA00, 1);
            progressBar.fillRect(left, 280, 400 * value, 30);
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
            console.log(file.key);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
        this.load.once('filecomplete', this.mapLoaded, this);

        this.events.on('died', function (a) {
            // this.scene.remove('HUD');
            // this.scene.stop();
            // this.scene.restart();
        }, this);

        //get the name of the scene to start from the querystring
        let s = getQueryStringValue('scene');
        let l = getQueryStringValue('level');
        if (s !== '') this.startScene = s;
        if (l !== '') this.startLevel = l;

        this.load.tilemapTiledJSON('map', `assets/Levels/${this.startLevel}.json`);
        this.load.audioSprite('sfx', 'assets/Sound/FlitBob.json', [
            'assets/Sound/FlitBob.ogg',
            'assets/Sound/FlitBob.mp3'
        ]);
    }
    create() { 
        console.log('create');
        this.PlayButton.alpha = 1;
        this.playtext.alpha = 1;
        this.PlayButton.on('pointerdown', function () {
            let l = new Level('Level', this.map);
            this.scene.add('Level', l, true);
        }, this);
    }
    mapLoaded() { 
        console.log('map loaded');
        // create the map in the scene
        this.map = this.make.tilemap({ key: 'map' });
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
        txt.setShadow(3, 3, '#333333', 2, true, false)
            .setStroke('#0066AA', 4)
            .setFontStyle('bold');
    }
}