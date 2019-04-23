/// <reference path="../../defs/phaser.d.ts" />

export default class Box extends Phaser.Physics.Arcade.Sprite {
    static State = {
        None: 0,
        Sitting: 1,
        Player: 2,
        Tile: 3
    }
    note = '';

    lastContactLine;
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
    _hits = -1;

    debug = false;
    get hits() {
        return this._hits;
    }
    set hits(value) {
        this._hits = value;
        if (this._hits === 0) {
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
            
            this.lastContactLine = this.scene.add.line(0, 0, 0, 0, 0, 0, 0xFFFFFF);
            this.lastContactLine.depth = 1000;
            
        }

        this.on('destroy', function () {
            if(this.text) this.text.destroy();
        }, this);
        this.init();
    }
    init() { 
        var s = '';
        //console.log(`Box Create: ${this.x}, ${this.y}, ${this.width}, ${this.height}`);
    }
    /**
     * Activate this box. Used to re=activate after its been on the ground or a zone
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
            this.text.x = Math.floor(this.x + this.width / 2);
            this.text.y = Math.floor(this.y + this.height / 2);
            this.text.text = this._hits;
        }
        if (this.lastContactLine && this.lastContact !== null) {
            let isTile = this.lastContact.constructor.name === 'Tile';
            this.lastContactLine.setTo(this.x, this.y, this.lastContact.x * (isTile ? 64 : 1), this.lastContact.y * (isTile ? 64 : 1));
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
        // console.log(`Box reset: ${this.x}, ${this.y}, ${this.width}, ${this.height}`);
        // this.scene.add.rectangle(this.x - 10, this.y -10, this.width + 20 , this.height + 20, 0xff6699, .2)

        //Update other boxes to remove this box from their references
        this.scene.physics.overlapRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20).forEach((o) => {
            let box = o.gameObject;
             if (box.constructor.name === 'Box') {
                 //box.alpha = 0.5;
                 if (box.onTopOf && box.onTopOf.name == this.name) box.onTopOf = null;
                 if (box.underneath && box.underneath.name == this.name) box.underneath = null;
            }
            //
            if (box.constructor.name === 'InteractionZone') {
                if (box.tileType && box.tileType.isBlockActivated) {
                    box.process();
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