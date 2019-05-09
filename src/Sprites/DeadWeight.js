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
        this.scene.physics.world.enable(this);

        this.body.allowGravity = true;
        this.body.enable = true;
        this.body.moves = true;      
        this.body.setFriction(0,0);
    }
    create() {
        
        
    }
    deActivate() { }
    activate() { };
}