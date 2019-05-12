/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="./Boxes.js" />
/**
 * DeadWeights fall once then cannot be moved
 */
export default class DeadWeight extends Phaser.Physics.Arcade.Sprite {
    isDeadWeight = true;
    isRock = false;
    scene;
    originalX;
    constructor(sprite) {
        //BUG: If there is no texture in the map, the y coord is incorrect :/
        super(sprite.scene, sprite.x, sprite.y);
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
        this.x = this.originalX;
        //this.body.setImmovable(true);
        if (this.body.touching.down || this.body.blocked.down || this.scene.game.getUnder(this.body).length > 0) {
            this.body.moves = false;
            // this.y--;
        } else {
            this.body.moves = true;
        }
    }
    update() {

    }
    deActivate() { }
    activate() { };

}