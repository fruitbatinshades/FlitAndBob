/// <reference path="../../defs/phaser.d.ts" />

export class Dialog extends Phaser.GameObjects.Container{
    constructor(scene,w, h, title, buttonText, image) {
        super(scene, scene.cameras.main.scrollX + (scene.cameras.main.centerX - w / 2), scene.cameras.main.scrollY + (scene.cameras.main.centerY - h / 2));
        this.title = title || '';
        this.text = buttonText || '';

        this.dlg = scene.game.cartoonBox(scene, 0, 0, w, h);

        this.assetText = scene.make.text({
            x: w / 2,
            y: 50,
            text: this.title,
            style: {
                font: '34px HvdComic',
                fill: '#ffffff'
            }
        });
        this.assetText.setOrigin(.5, .5).setDepth(2);
        let button = scene.add.image(w / 2, 120, 'UI','roundButton');
        button.setOrigin(.5, .5).setScale(.5);
        button.setInteractive();

        let play = scene.add.image(w / 2, 120, 'UI', 'play');
        play.setOrigin(.5, .5).setScale(.5);
        
        scene.game.cartoonText(this.assetText);
        
        this.add([this.dlg,this.assetText, button, play]);

        this.once('destroy', function () {
            button.off('pointerup');
            scene.input.keyboard.off('keydown');
            //delete this;
        },this);
        button.once('pointerup', function (pointer, gameObject) {
            this.scene.levelEvents.emit('dialogclosed');
            this.destroy();
        }, this);
        scene.input.keyboard.once('keydown', function (event) {
            this.scene.levelEvents.emit('dialogclosed');
            this.destroy();
        },this);
    }
}