/// <reference path="../../defs/phaser.d.ts" />

// this.tip = new Tip(this, this.game.Flit, 'Hi, I am Flit, I can carry pots quickly');
// this.tip = new Tip(this, this.game.Bob, 'Hi, I am Bob, I can move heavy stones');

/**
 * Create a cartoon speech bubble by the target
 */
export class Tip extends Phaser.GameObjects.Container{
    constructor(scene,target, text, width) {
        super(scene, target.x + target.displayWidth, target.y );
        
        let w = width || 220;
        let graphics = scene.add.graphics();

        let txt = scene.make.text({
            x: target.x + target.displayWidth + 15,
            y: target.y + 15,
            text: text,
            style: {
                font: '20px HvdComic',
                fill: '#000000',
                wordWrap: { width: 190, useAdvancedWrap: true }
            },
            depth: 1001
        });

        let h = txt.height + 20;
        graphics.fillStyle(0x000000, .5);
        graphics.fillRoundedRect(10, 10, 210, h, 8);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.fillStyle(0xffffff, 2);
        graphics.fillRoundedRect(5, 5, 210, h, 8);
        graphics.strokeRoundedRect(5, 5, 210, h, 8);
        graphics.strokeTriangle(0, 20, 5, 15, 5, 30);
        graphics.fillTriangle(0, 20, 6, 15, 6, 30);
        this.add(graphics, txt);

        scene.add.existing(this);
        this.depth = 1000;
    }
}