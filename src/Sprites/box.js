/// <reference path="../../defs/phaser.d.ts" />

export default class Box extends Phaser.Physics.Arcade.Sprite {
    static State = {
        None: 0,
        Sitting: 1,
        Player: 2,
        Tile: 3
    }
    note;

    //box underneath this one
    underneath = null;
    //bon on top of this one
    onTopOf = null;
    //ref to the last object we hit
    lastContact = null;
    //Player that can interact with the box
    Affects = null;
    //Is this a Bob only rock
    isRock = false;
    //Number of hits before the box self destructs
    _hits = 1000;

    debug = false;
    get hits() {
        return this._hits;
    }
    set hits(value) {
        this._hits = value;
        if (this._hits < 0) {
            this.scene.events.emit('boxdestruct', this);
        }
    }
    constructor(sprite) {
        super(sprite.scene, sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
        this.scene = sprite.scene;
        this.setOrigin(0, 0);
        this.flipX = Math.random() > 0.5;
        if (sprite.data != null) {
            if (sprite.data.list['Counter']) {
                this._hits = parseInt(sprite.data.list['Counter']) + 1;
                //add counter
                this.text = this.scene.make.text({
                    x: 0,
                    y: 0,
                    text: this._hits,
                    style: {
                        font: '32px HvdComic',
                        fill: '#ffffff'
                    }
                });
                this.text.depth = 20;
                this.text.setOrigin(.5, .5);
                this.scene.game.shadowText(this.text);
            } else if (sprite.data.list['Affects']) {
                this.Affects = sprite.data.list['Affects'];
            };
            if (sprite.data.values.hasOwnProperty('Rock')) {
                //It's a rock which only Bob can move
                this.setTexture('rock');
                this.isRock = true;
            }
        }
        if (this.debug) {
            this.note = this.scene.add.text(this.x, this.y, '');
            this.note.depth = 1000;
        }

        this.on('destroy', function () {
            if(this.text) this.text.destroy();
        }, this);
    }
    /**
     * Activate this box. Used to re-activate after its been on the ground or a zone
     */
    activate() {
            this.body.enable = true;
            this.body.immovable = false;
            this.body.moves = true;
            this.body.allowGravity = true;
            this.lastContact = null;
            this.body.setGravityY(1);
    }
    preUpdate() {
        if (this.text) {
            this.text.x = this.x + this.width / 2;
            this.text.y = this.y + this.height / 2;
            this.text.text = this._hits !== 0 ? this._hits : '!';
        }
        if (this.debug) {
            //Debug notes
            this.note.x = this.x + 10;
            this.note.y = this.y + 10;
            let n = this.name;
            if (this.onTopOf) n += `\nA${this.onTopOf.name}`;
            if (this.underneath) n += `\nB${this.underneath.name}`;
            this.note.setText(n);
        }
    }
    /**
     * Reset this box and update any boxes under or over it
     */
    reset() {
        //Update other boxes to remove this box from their references
        this.scene.physics.overlapRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20).forEach((o) => {
            let go = o.gameObject;
            if (go.constructor.name === 'Box') {
                //box.alpha = 0.5;
                if (go.onTopOf && go.onTopOf.name == this.name) go.onTopOf = null;
                if (go.underneath && go.underneath.name == this.name) go.underneath = null;
            }
            //if its a block activated zone process it
            if (go.constructor.name === 'InteractionZone') {
                if (go.tileType && go.tileType.isBlockActivated) {
                    go.process();
                }
            }
        });

        if (this.underneath != null) {
            console.log(Phaser.Math.Distance.DistanceSquared(this.underneath, this.onTopOf));
        }
        this.underneath = null;
        this.onTopOf = null;
    }
}