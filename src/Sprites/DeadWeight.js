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

        this.activate();
        this.originalX = this.x;
        
        this.body.setImmovable(true);

        this.scene.events.on('sceneUpdate', this.checkOn, this);
        
        this.on('destroy', function () {
            this.scene.events.off('sceneUpdate');
        }, this);
    }

    checkOn() {
        if (this.scene.game.nothingUnder(this)) this.activate();
    }
    preUpdate() {
        //Do not allow x movement
        this.x = this.originalX;
        //if there is nothing underneath allow movement
        if (this.body.touching.down || this.body.blocked.down || this.scene.game.getUnder(this.body).length !== 0) {
            this.body.moves = false;
        } else {
            this.body.moves = true;
        }
    }
    deActivate() { 
        this.body.allowGravity = false;
        this.body.moves = false;
    }
    activate() { 
        this.body.allowGravity = true;
        this.body.enable = true;
        this.body.moves = true;
    };

    /**
     * Handle dead weights colliding with multiple object types
     * @param {object} s1 
     * @param {object} s2 
     */
    static deadWeightCollide(s1, s2) {
        switch (s2.constructor.name) {
            case 'Tile':
                //hits tile so it stays there
                s1.body.stop();
                s1.deActivate();
                break;
            case 'Rock':
                break;
            case 'DeadWeight':
                DeadWeight.separateDw(s1, s2);
                break;
            default:
                break;
        }
    }
    static separateDw(s1, s2) {
        //keep it vertically separated
        var b1 = s1.body;
        var b2 = s2.body;
        if (b1.y > b2.y) {
            b2.y += (b1.top - b2.bottom);
            b2.stop();
        }
        else {
            b1.y += (b2.top - b1.bottom);
            b1.stop();
        }
    }
}