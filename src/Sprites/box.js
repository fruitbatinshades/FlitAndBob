/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="./Boxes.js" />
import Utils from '../Utils/Utils.js'

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
            this.scene.levelEvents.emit('boxdestruct', this);
        }
    }
    /** The last item the box collided with (getter) */
    get lastContact() {
        return this._lastContact;
    }
    /** The last item the box collided with (setter), turns gravity back on if not touching anything */
    set lastContact(value) {
        this._lastContact = value;
        if (this.body) {
            this.body.allowGravity = this.body.touching.down === false && this.body.blocked.down === false && this.body.onFloor() === false;
        }
    }
    constructor(sprite) {
        super(sprite.scene, sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
        this.scene = sprite.scene;
        console.log(`o:${this.constructor.name} s:${this.scene.constructor.name}`);
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

        this.scene.levelEvents.on('sceneUpdate', this.checkOn, this);

        if (this.scene.game.debugOn) {
            this.note = this.scene.add.text(this.x, this.y, '');
            this.note.depth = 1000;
        }

        this.on('destroy', function () {
            if (this.text) this.text.destroy();
            //this.scene.levelEvents.off('sceneUpdate');
        }, this);
    }
    checkOn() {
        if (this.scene && Utils.nothingUnder(this))
            this.activate();
    }
    gridX() {
        //move to tile grid
        return Math.round(box.x / 64) * 64;
    }
    /**
     * Activate this box. Used to re-activate after its been on the ground or a zone
     */
    activate() {
        //this.body.enable = true;
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
     * Get boxes above and below
     */
    getRelatives() {
        return Utils.getBodiesAround(this.body, [this], 'Box', {top:true,bottom:true }, 10);
    }
    /**
     * Reset this box and update any boxes under or over it
     */
    reset() {
        let boxes = this.getRelatives();
        if (boxes.down.length !== 0) {
            boxes.down[0].gameObject.underneath = null;
        }

        //check for block activated zones and process
        let under = Utils.getUnder(this.body, 'InteractionZone', 5);
        if (under.length !== 0) {
            for (let i = 0; i < under.length; i++) {
                let go = under[i].gameObject;
                if (go.tileType && go.tileType.isBlockActivated) {
                    go.process();
                }
            }
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
            box.scene.levelEvents.emit('boxTileCollide', box, tile);
            box.hits--;
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

            bottom.tint = 0x00FF00;
            bottom.deActivate();

            top.tint = 0xFF0000;
            top.deActivate();

            //force gap else it is irregular
            top.y = (bottom.body.top - top.body.height) - 1;
            if (a.scene.game.debugOn) console.log('box colliding');

            return true;
        }
    }
}