/// <reference path="../../defs/phaser.d.ts" />
import Player from '../Sprites/Player.js';

export default class PlayerContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, p) {
        super(scene, x, y, p);
        this.setSize(p.width, p.height);

        this.scene.physics.world.enable(this);
        this.player = p;
        this.setScale(.5);
        // this.add(this.scene.add.image(0, 0, 'coin'));
        this.idle();
        console.log(this.willRender(this.scene.cameras.main));
    }

    idle() {
        this.body.setVelocityX(0);
        this.player.idle();
    }
    update(cursors) {
        if (cursors.left.isDown) {
            this.body.setVelocityX(-200);
            this.player.anims.play('walk', true); // walk left
            this.flipX = true; // flip the sprite to the left
        }
        else if (cursors.right.isDown) {
            this.body.setVelocityX(200);
            this.player.anims.play('walk', true);
            this.flipX = false; // use the original sprite looking to the right
        } else {
            this.idle();
        }
        // jump 
        if (cursors.up.isDown && this.body.onFloor()) {
            this.body.setVelocityY(-500);
        }
    }
}