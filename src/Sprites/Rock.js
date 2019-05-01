/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="./Boxes.js" />

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
        if (sprite.data != null) {
            if (sprite.data.list['Affects']) {
                this.Affects = sprite.data.list['Affects'];
            };
            if (sprite.data.values.hasOwnProperty('Rock')) {
                //It's a rock which only Bob can move
                this.setTexture('rock');
            }
        }
        if (this.scene.game.renderDebug) {
            this.note = this.scene.add.text(this.x, this.y, '');
            this.note.depth = 1000;
        }

        this.on('destroy', function () {
            if (this.text) this.text.destroy();
        }, this);
    }
    activate() {
        this.body.allowGravity = true;
        this.body.immovable = false;
    }
    deActivate() {
        this.body.allowGravity = false;
        this.body.immovable = true;
        this.body.stop();
    }
}