/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="./Boxes.js" />

export default class Box extends Phaser.GameObjects.Sprite {
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
    _lastContact = null;
    //Player that can interact with the box
    Affects = null;
    /** Number of hits before the box self destructs */
    _hits = -2;
    isBox = true;
    
    get hits() {
        return this._hits;
    }
    set hits(value) {
        this._hits = value;
        if (this._hits === -1) {
            this.scene.events.emit('boxdestruct', this);
        }
    }
    /** The last item the box collided with (getter) */
    get lastContact(){ 
        return this._lastContact;
    }
    /** The last item the box collided with (setter), turns gravity back on if not touching anything */
    set lastContact(value) {
        this._lastContact = value;
        this.body.allowGravity = this.body.touching.down === false && this.body.blocked.down === false && this.body.onFloor() === false;
    }
    constructor(sprite) {
        super(sprite.scene, sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
        this.scene = sprite.scene;
        this.setOrigin(0, 0);
        //this.flipX = Math.random() > 0.5;
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
        }

        this.scene.events.on('sceneUpdate', this.checkOn, this);

        if (this.scene.game.debugOn) {
            this.note = this.scene.add.text(this.x, this.y, '');
            this.note.depth = 1000;
        }

        this.on('destroy', function () {
            if (this.text) this.text.destroy();
            this.scene.events.off('sceneUpdate');
        }, this);
    }
    checkOn() {
        if (this.scene && this.scene.game.nothingUnder(this))
            this.activate();
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
    deActivate() {
        this.body.immovable = true;
        this.body.allowGravity = false;
        this.body.setGravityY(0);
        this.body.setVelocity(0, 0);
        this.body.stop();
       // box.body.y--;
    }
    preUpdate() {
        if (this.text) {
            this.text.x = this.x + this.width / 2;
            this.text.y = this.y + this.height / 2;
            this.text.text = this._hits !== 0 ? this._hits : '!';
        }
        if (this.scene.game.debugOn) {
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
    /**
     * fix the box in place, turn off physics
     * @param {Box} box 
     * @param {Phaser.Tilemaps.Tile} tile 
     */
    static tileCollide(box, tile) {
        //Handle box collision
        if (tile !== null && !box.isRock && box.lastContact !== tile) {
            box.deActivate();
            box.lastContact = tile;
            box.hits--;
            box.scene.events.emit('boxTileCollide', box, tile);
            return true;
        }
        if (box.isRock) box.deActivate();
    }
    /**
  * Change the physics so boxes become static when they collide
  * @param {Box} a First Box
  * @param {Box} b Second Box
  */
    static boxOnBoxCollide(a, b) {
        if (!a.isRock && !b.isRock) {
            a.body.setVelocityX(0);
            b.body.setVelocityX(0);
            //workout uppermost box
            let top = a.body.top < b.body.top ? a : b;
            let bottom = top === a ? b : a;

            bottom.underneath = top;
            top.onTopOf = bottom;

            //subtract hits
            if (top.lastContact !== bottom) {
                top.hits--;
            }
            top.lastContact = bottom;

            top.body.stop();
            bottom.body.stop();

            //bottom.tint = 0x00FF00;
            bottom.body.immovable = true;
            bottom.body.moves = false;
            bottom.body.enable = true;
            bottom.body.allowGravity = false;

            //top.tint = 0xFF0000;
            top.body.immovable = true;
            top.body.moves = false;
            top.body.enable = true;
            top.body.allowGravity = false;

            //force gap else it is irregular
            top.y = (bottom.body.top - top.body.height) - 1;
            if (a.scene.game.debugOn) console.log('box colliding');

            return true;
        }
    }
}