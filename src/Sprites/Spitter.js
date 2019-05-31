export class Spitter extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        // add to the scene
        this.scene.add.existing(this);
        this.setScale(.7);

        // player walk animation
        this.anims.animationManager.create({
            key: 'shoot',
            frames: this.anims.animationManager.generateFrameNames('spitter', { prefix: 'A_', start: 0, end: 11, zeroPad: 2, suffix: '.png' }),
            frameRate: 24,
            yoyo:true
        });
        this.setTexture('spitter', 0);
        this.setOrigin(0, .9);
        let timedEvent = this.scene.time.addEvent({ delay: 1500, callback: this.Shoot, callbackScope: this, loop: true });
    }
    Shoot() {
        this.anims.play('shoot', true);
    }
}