/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="./Boxes.js" />
/**
 * DeadWeights fall once then cannot be moved
 */
export default class DeadWeight extends Phaser.Physics.Arcade.Sprite {
    isDeadWeight = true;
    scene;
    constructor(sprite) {
        super(sprite.scene, sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
        this.scene = sprite.scene;
        this.setOrigin(0, 0);
        this.setTexture('deadWeight');
        this.height = this.texture.height;
        this.width = this.texture.width;
    }
    create() {
        this.sprite.scene.addExisting(this);
        this.scene.physics.world.enable(this);        
        z.body.allowGravity = true;
        z.body.enable = true;
        z.body.moves = true;        
    }
}