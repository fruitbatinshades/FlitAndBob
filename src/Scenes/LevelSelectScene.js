/// <reference path="../../defs/phaser.d.ts" />
import config from '../config.js';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super("LevelSelectScene");

    }

    create() {
        this.cameras.main.setBackgroundColor(0xaaaaaa);

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        this.tiles = this.add.group();
        //this.registry.set('currentLevel', this.game.levels[this.game.levelIndex]);

        //add and resize splash to best fit
        let splash = this.add.image(0, 0, 'SplashBackground');
        let size = new Phaser.Structs.Size(this.width, this.height);
        let splashSize = new Phaser.Structs.Size(splash.width, splash.height, Phaser.Structs.Size.ENVELOP, size)
        splashSize.setSize(size.width, size.height);
        splash.setDisplaySize(splashSize.width, splashSize.height);
        splash.x = this.width / 2;
        splash.y = this.height / 2;

        let lvls = this.registry.get('levels');
        let select = this.add.container(0, 0);
        let b = this.add.rectangle(0, 0, 320, 300, 0xFFFFFF, .95);
        select.add(b);
        let title = this.add.text(0, -120, 'Select level', {
            font: '30px HvdComic',
            fill: '#fffdff'
        });
        this.game.cartoonText(title);
        title.setOrigin(.5, .5);
        select.add(title);
        // select.width = this.width;
        // select.height = this.height;

        for (let i = 0; i < lvls.length; i++) {
            let c = this.add.container();
            let s = this.add.image(0, 0, 'UI', 'modal');
            s.name = lvls[i];
            s.setScale(.5).setOrigin(0).setInteractive();
            c.add(s);
            s.on('pointerup', (p) => {
                this.game.levelIndex = i;//this.startLevel(s)
                this.scene.pause();
                this.scene.start('LevelLoader');
            });
            let t = this.add.text(32, 32, i + 1, {
                font: '30px HvdComic',
                fill: '#ffffff'
            });
            t.setOrigin(.5, .5);
            this.game.cartoonText(t);
            c.add(t);
            this.tiles.add(c);
        }

        Phaser.Actions.GridAlign(this.tiles.getChildren(), {
            width: 4,
            height: 4,
            cellWidth: 64,
            cellHeight: 64,
            position: Phaser.Display.Align.CENTER,
            x: -130, y: -90
        });

        select.add(this.tiles.getChildren());
        //Phaser.Display.Align.In.Center(select, splash, 0, 0);
        select.x = (this.width / 2) ;
        select.y = (this.height / 2) ;
    }
    startLevel(pointer) {
        alert(this.name);
    }
    update() {
        let s = '';
    }
}