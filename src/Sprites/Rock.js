/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="./Boxes.js" />
/**
 * Rocks can only be moved by Bob and break the normal physics rules so are more complicated to handle
 */
export default class Rock extends Phaser.Physics.Arcade.Sprite {
    debug = false;
    //ref to the last object we hit
    _lastContact = null;
    //Player that can interact with the box
    Affects = null;
    isRock = true;
    get lastContact() {
        return this._lastContact;
    }
    set lastContact(value) {
        this._lastContact = value;
        this.body.allowGravity = this.body.touching.down === false && this.body.blocked.down === false && this.body.onFloor() === false;
    }

    constructor(sprite) {
        super(sprite.scene, sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
        
        this.scene = sprite.scene;
        this.setOrigin(0, 0);
        this.setTexture('rock');
        if (sprite.data != null) {
            if (sprite.data.list['Affects']) {
                this.Affects = sprite.data.list['Affects'];
            };
        }

        this.scene.events.on('update', this.checkOn, this);
    }
    checkOn() {
        let b = this.body;
        if (b) {
            let reallyTouching = b.touching.down || b.blocked.down || b.onFloor() || this.scene.game.getUnder(this.body).length !== 0;
            if (!reallyTouching)
                b.allowGravity = true;
        }
    }
    activate() {
        this.body.enable = true;
        this.body.immovable = false;
        this.body.moves = true;
        this.body.allowGravity = true;
        this.lastContact = null;
        this.body.setGravityY(1);
    }
    deActivate() {
        this.body.immovable = true;
        this.body.allowGravity = false;
        this.body.setGravityY(0);
        this.body.setVelocity(0, 0);
        this.body.stop();
       // box.body.y--;
    }
    static separate(a, b) {
        var b1 = b.body;
        var b2 = a.body;

        // Positive values indicate an overlap
        var dx1 = b1.right - b2.left; // at left edge of b2
        var dx2 = b2.right - b1.left; // at right edge of b2
        var dy1 = b1.bottom - b2.top; // at top edge of b2
        var dy2 = b2.bottom - b1.top; // at bottom edge of b2

        // Ignore negative values
        if (dx1 < 0) dx1 = Infinity;
        if (dx2 < 0) dx2 = Infinity;
        if (dy1 < 0) dy1 = Infinity;
        if (dy2 < 0) dy2 = Infinity;

        // Find smallest overlap
        var minY = Math.min(dy1, dy2);
        var minX = Math.min(dx1, dx2);

        let under = b.scene.game.getUnder(b1, 'Rock')[0];
        let right = b.scene.game.getRight(b1, 'Rock')[0];

        if (under === b2) {
            if (dy1 === minY) {
                b1.y -= minY;
            } else {
                b1.y += minY;
            }
        } else if(right === b2){
            if (dx1 === minX) {
                b1.x -= minX;
            } else if (dx2 === minX) {
                b1.x += minX;
            } 
        }

        // if (b1.top < b2.top) b1.y--;
        // if (b2.top < b1.top) b2.y--;
        
        b1.stop();
        b1.allowGravity = false;
    }
}