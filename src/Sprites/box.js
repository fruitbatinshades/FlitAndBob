/// <reference path="../../defs/phaser.d.ts" />

export default class Box extends Phaser.Physics.Arcade.Sprite {
    static State = {
        None: 0,
        Sitting: 1,
        Player: 2,
        Tile: 3
    }
    constructor(sprite) {
        super(sprite);
        this.scene = scene;
        this.init();
    }
    Banana() { 
        var s = '';
    }
    // //fix the box in place, turn of physics
    // tileCollide(box, tile) {
    //     //if (a.boxstatus === Boxes.State.None) {
    //     if (box.lastContact !== tile) {
    //         box.body.immovable = true;
    //         box.lastContact = tile;
    //         box.status = Boxes.State.Tile;
    //     }
    //         // box.body.immovable = true;
    //         // box.body.moves = false;
    //         // box.body.enable = false;
    //     //     a.status = Boxes.State.Sitting;
    //     //     console.log('decative' + a.name);
    //     // }
    // }
    // activate(box) {
    //     // box.body.immovable = false;
    //     // //box.body.enable = true;
    //     // box.body.moves = true;
    //     // box.body.setGravityY(1);
    // }
    // deActivate(box) {
    //     // box.body.immovable = true;
    //     // //box.body.enable = false;
    //     // box.body.moves = true;
    //     // box.body.setGravityY(0);
    // }
    // //When a box has been dropped restore its physics to static state
    // settle(box) {
        
    // }
    // //When a box is taken by a character
    // onPickupBox(box, player) {
    //     console.log('event pickup_box', box);
    // }
    // //when a box is dropped by a character
    // onDropBox(box) {
    //     console.log('event drop_box', box);
    // }
    // playerCollide(player, box) {
    //     if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
    //         this.deActivate(box);
    //         player.overBox(box, player);
    //     }
    // }
    // //Collide when boxes collide with other
    // boxCollide(a, b) {
    //     if ((a.status === Boxes.State.None || a.status === Boxes.State.Tile) && a.status !== Boxes.State.Sitting) {
    //         a.tint = 0xFF0000;
    //         b.tint = 0x00FF00;
            
    //         a.body.immovable = true;
    //         a.body.moves = false;
    //         // box.body.enable = false;
    //         a.status = Boxes.State.Sitting;
    //         console.log('decative' + a.name);
    //     }
    //     if ((b.status === Boxes.State.None || b.status === Boxes.State.Tile) && b.status !== Boxes.State.Sitting) {
    //         // a.tint = 0xFF0000;
    //         // b.tint = 0x00FF00;
    //         b.body.immovable = true;
    //         b.body.moves = false;
    //         // box.body.enable = false;
    //         b.status = Boxes.State.Sitting;
    //         console.log('decative' + a.name);
    //     }
    // }
}