/// <reference path="../../defs/phaser.d.ts" />

export default class Box extends Phaser.Physics.Arcade.Sprite {
    static State = {
        None: 0,
        Sitting: 1,
        Player: 2,
        Tile: 3
    }
    constructor(sprite) {
        super(sprite.scene, sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
        this.scene = sprite.scene;
        this.setOrigin(0, 0);
        this.note = '';
        this.underneath = null;
        this.onTopOf = null;
        this.debug = false;
        this.flipX = Math.random() > 0.5;
        this.init();
    }
    init() { 
        var s = '';
        console.log(`Box Create: ${this.x}, ${this.y}, ${this.width}, ${this.height}`);
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
    // preUpdate(a, b) {
    //     if (this.debug) {
    //         //Debug notes
    //         this.note.x = this.x + 10;
    //         this.note.y = this.y + 10;

    //         let n = this.name;
    //         if (this.onTopOf) n += `\nA${this.onTopOf.name}`;
    //         if (this.underneath) n += `\nB${this.underneath.name}`;

    //         this.note.setText(n);
    //     }
    // }
    /**
     * Reset this box and update any boxes under or over it
     */
    reset() { 
        // console.log(`Box reset: ${this.x}, ${this.y}, ${this.width}, ${this.height}`);
        // this.scene.add.rectangle(this.x - 10, this.y -10, this.width + 20 , this.height + 20, 0xff6699, .2)

        //Update other boxes to remove this box from there references
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