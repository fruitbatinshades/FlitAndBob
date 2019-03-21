/// <reference path="../../defs/phaser.d.ts" />
import Settings from '../settings.js';

export default class Boxes extends Phaser.Physics.Arcade.Group {
    static State = {
        None: 0,
        Sitting: 1,
        Player: 2,
        Tile: 3
    }
    constructor(scene, children, spriteArray) {
        super(scene, children);

        this._Settings = new Settings(); //shared settings objects
        this.scene = scene;
        //this.scene.physics.world.enable(this);
        // add boxes to our group
        spriteArray.forEach((box) => {
            box.setOrigin(0, 0);
            this.scene.physics.world.enable(box);
            this.add(box);
            box.note = this.scene.add.text(box.x, box.y, 'X', this._Settings.debugFont);
        }, this);

        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.init();
    }
    preUpdate(a, b) { 
        this.children.each((b) => {
            b.note.x = b.x + 10;
            b.note.y = b.y + 10;

            let n = b.name;
            if (b.below) n += `\n${b.below.name}`;
            if (b.above) n += `\n${b.above.name}`;

            b.note.setText(n);

            // if (box.player) {
                
            // }
        });
    }
    init() { 
        let i = 0;
        //NOTE: This is interesting, when you add a group to a scene it wipes out the child properties
        //Set the child properties after they've been added to the scene :/
        this.scene.add.existing(this);
        this.getChildren().forEach((box) => {
            box.body.setCollideWorldBounds(true);
            //box.body.immovable = true; //if box is immovable collision is a bit strange, boxes go through each other :|
            //box.body.setVelocityX(0);
            box.name = 'b_' + i++;
            //state to monitor collision states
            box.status = Boxes.State.None;
        });
        //bind when a box is picked up
        this.scene.events.on('pickup_box', this.onPickupBox, this);
        this.scene.events.on('drop_box', this.onDropBox, this);
    }
    //ensure map and players exist
    addCollisions() { 
        //collider for when boxes hit each other
        this.scene.physics.add.collider(this, this, this.boxCollide, null, this);
        this.scene.physics.add.collider(this, this.scene.groundLayer, this.tileCollide, null, this);
        this.scene.physics.add.collider(this.scene.game.Bob, this, this.playerCollide, null, this);
        this.scene.physics.add.collider(this.scene.game.Flit, this, this.playerCollide, null, this);
    }
    //fix the box in place, turn of physics
    tileCollide(box, tile) {
        //if (a.boxstatus === Boxes.State.None) {
        if (box.lastContact !== tile) {
            box.body.immovable = true;
            box.lastContact = tile;
            box.status = Boxes.State.Tile;
        }
            // box.body.immovable = true;
            // box.body.moves = false;
            // box.body.enable = false;
        //     a.status = Boxes.State.Sitting;
        //     console.log('decative' + a.name);
        // }
    }
    activate(box) {
        box.body.immovable = false;
        //box.body.enable = true;
        box.body.moves = true;
        box.body.setGravityY(1);
    }
    deActivate(box) {
        // box.body.immovable = true;
        // //box.body.enable = false;
        // box.body.moves = true;
        // box.body.setGravityY(0);
    }
    //When a box has been dropped restore its physics to static state
    settle(box) {
        
    }
    //When a box is taken by a character
    onPickupBox(box, player) {
        if (!box.above) { //only pick up box if there is nothing above it
            player.carrying = box;
            box.player = player;
            box.body.enable = false;
            box.body.allowGravity = false;
            console.log('event pickup_box', box);
        }
    }
    //when a box is dropped by a character
    onDropBox(box, player) {
        player.carrying = null;
        box.body.enable = true;
        box.body.immovable = false;
        box.body.moves = true;
        box.body.allowGravity = true;
        console.log('event drop_box', box);
    }
    playerCollide(player, box) {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.deActivate(box);
            player.overBox(box, player);
        }
    }
    //Collide when boxes collide with other
    boxCollide(a, b) {

        let top = a.body.top < b.body.top ? a : b;
        let bottom = top === a ? b : a;

        top.tint = 0xFF0000;
        bottom.tint = 0x00FF00;

        if (bottom.sittingOn != null) {
            console.log(bottom.name + ' sitting on ' + bottom.sittingOn.name);
            bottom.body.immovable = true;
            bottom.body.moves = false;
            bottom.body.enable = true;
            bottom.body.checkCollision.none = true;

            top.body.immovable = true;
            top.body.moves = false;
            top.body.enable = true;
            top.body.checkCollision.none = true;
            console.log('box colliding');
        }

        //top.y = (bottom.body.top - 10) + top.height;
        bottom.above = top;
        top.below = bottom;


        console.log(`${top.name} is on ${top.below.name}`);
        console.log(`${bottom.name} is below ${bottom.above.name}`);
        //target
        if ((a.status === Boxes.State.None || a.status === Boxes.State.Tile) && a.status !== Boxes.State.Sitting) {
            a.body.immovable = true;
            a.body.moves = false;
            a.body.enable = true;
            a.status = Boxes.State.Sitting;
            console.log('box colliding ' + a.name + ' > ' + b.name);
        }
        if ((b.status === Boxes.State.None || b.status === Boxes.State.Tile) && b.status !== Boxes.State.Sitting) {
            b.body.immovable = true;
            b.body.moves = false;
            // box.body.enable = false;
            b.status = Boxes.State.Sitting;
            console.log('box colliding' + b.name);
        }
    }
}