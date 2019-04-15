/// <reference path="../../defs/phaser.d.ts" />

export default class Dialog extends Phaser.GameObjects.Container{
    title = '';
    text = '';
    constructor(scene,w, h, title, buttonText, image) {
        super(scene, scene.cameras.main.scrollX + (scene.cameras.main.centerX - w / 2), scene.cameras.main.scrollY + (scene.cameras.main.centerY - h / 2));
        this.title = title;
        this.text = buttonText;


        this.dlg = scene.add.nineslice(0,0,w,h,'ui',16);
        this.add(this.dlg);
        this.close = scene.make.text({
            x: this.dlg.width - 50,
            y:  10,
            text: 'X',
            style: {
                font: '34px HvdComic',
                fill: '#1493F5'
            }
        });
        this.add(this.close);

        this.assetText = scene.make.text({
            x: this.dlg.width / 2,
            y: 50,
            text: this.title,
            style: {
                font: '34px HvdComic',
                fill: '#ffffff'
            }
        });
        this.assetText.setOrigin(.5, .5);
        let button = scene.add.image(this.dlg.width / 2, 120, 'buttons','roundButton');
        button.setOrigin(.5, .5).setScale(.5);
        button.setInteractive();

        let play = scene.add.image(this.dlg.width / 2, 120, 'buttons', 'play');
        play.setOrigin(.5, .5).setScale(.5);
        
        scene.game.cartoonText(this.assetText);
        
        this.add([this.assetText, button, play]);

        this.on('destroy', function () {
            button.off('pointerup');
            scene.input.keyboard.off('keydown');
        });
        button.on('pointerup', function (pointer, gameObject) {
            this.scene.events.emit('dialogclosed');
            this.destroy();
        }, this);
        scene.input.keyboard.on('keydown', function (event) {
            this.scene.events.emit('dialogclosed');
            this.destroy();
        },this);
    }
}