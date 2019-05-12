/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="./Boxes.js" />
/**
 * DeadWeights fall once then cannot be moved
 */
export default class DeadWeight extends Phaser.Physics.Arcade.Sprite {
    constructor(sprite) {
        super(sprite.scene, sprite.x, sprite.y);

        this.isDeadWeight = true;
        this.isRock = false;

        this.scene = sprite.scene;
        this.setOrigin(0, 0);
        this.setTexture('deadWeight');

        this.scene.physics.world.enable(this);

        this.body.allowGravity = true;
        this.body.enable = true;
        this.body.moves = true;
        this.originalX = this.x;
        //this.body.setFriction(0, 0);
        this.body.setImmovable(true);
    }

    preUpdate() {
        //Do not allow x movement
        this.x = this.originalX;
        //if there is noting underneath allow movement
        if (this.body.touching.down || this.body.blocked.down || this.scene.game.getUnder(this.body).length !== 0) {
            this.body.moves = false;
        } else {
            this.body.moves = true;
        }
    }
    deActivate() { }
    activate() { };
}