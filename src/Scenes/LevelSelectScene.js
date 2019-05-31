/// <reference path="../../defs/phaser.d.ts" />
//import { config } from '../config.js';

export class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super("LevelSelectScene");
        this.firstStart = true;
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

        let logo = this.add.image(290, 290, 'Logo');
        //logo.setScale(.75);

        let lvls = this.registry.get('levels');
        let select = this.add.container(0, 0);
        // let b = this.add.rectangle(0, 0, 320, 300, 0xFFFFFF, .95);
        select.add(this.game.cartoonBox(this, 50, -180, 320, 300));
        let title = this.add.text(110, -170, 'Select level', {
            font: '30px HvdComic',
            fill: '#fffdff'
        });
        this.game.cartoonText(title);
        title.setOrigin(0);
        select.add(title);

        for (let i = 0; i < lvls.length; i++) {
            let c = this.add.container();
            let s = this.add.image(0, 0, 'UI', 'modal');
            s.name = lvls[i];
            s.setScale(.5).setOrigin(0).setInteractive();
            c.add(s);
            s.on('pointerup', (p) => {
                this.game.levelIndex = i;
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
            cellWidth: 70,
            cellHeight: 70,
            position: Phaser.Display.Align.CENTER,
            x: 70, y: -110
        });

        select.add(this.tiles.getChildren());
        //Phaser.Display.Align.In.Center(select, splash, 0, 0);
        select.x = (this.width / 2) ;
        select.y = (this.height / 2);

        //if level is passed skip this scene
        if (this.registry.has('urlLevel') && this.registry.get('urlLevel') !== null) {
            this.firstStart = false;
            this.scene.pause();
            this.scene.start('LevelLoader');
        }
    }
}