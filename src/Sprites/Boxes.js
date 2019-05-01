/// <reference path="../../defs/phaser.d.ts" />
import Settings from '../settings.js';
import Box from './box.js';
import Rock from './Rock.js';
//import utils from '../Utils/Debug.js';

export default class Boxes extends Phaser.Physics.Arcade.Group {
    static State = {
        None: 0,
        Sitting: 1,
        Player: 2,
        Tile: 3,
        Zone: 4
    }
    static tileWidth = 64;
    constructor(scene, children, spriteArray) {
        super(scene, children);

        //createCallbackHandler errors if this is not set which implies the inheritence is wrong somehow :|
        this.world = scene.physics.world;
        this.scene = scene;

        // add boxes to our group
        spriteArray.forEach((box) => {
            let b;
            if (box.data != null && box.data.values.hasOwnProperty('Rock')) {
                //its a rock
                b = new Rock(box);
            } else {
                b = new Box(box);
            }
            b.setOrigin(0, 0);
            this.add(b, true);
            this.scene.physics.world.enable(b);
            box.destroy(); //destroy original tile
        }, this);

        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.scene.events.on('preupdate', this.preUpdate, this);
        this.init();
    }
    preUpdate(a, b) { 
        if (this.scene.game.renderDebug && this.scene && this.scene.game) { 
            this.scene.game.objs.push(this.children.entries);
        }
    }
    init() {
        let i = 0;
        //NOTE: This is interesting, when you add a group to a scene it wipes out the child properties
        //Set the child properties after they've been added to the scene :/
        this.scene.add.existing(this);
        this.getChildren().forEach((box) => {
            box.body.setCollideWorldBounds(true);
            box.name = (box.isRock ? 'rock_' : 'box_') + i++;
            box.body.setDrag(5000, 0);//.setMass(5000);
            //state to monitor collision states
            box.status = Boxes.State.None;
        });
        //bind when a box is picked up
        this.scene.events.on('pickup_box', this.onPickupBox, this);
        this.scene.events.on('drop_box', this.onDropBox, this);
        this.scene.events.on('boxdestruct', this.onBoxDestruct, this);

        this.addCollisions();
    }
    //ensure map and players exist
    addCollisions() {
        //collider for when boxes hit each other
        let boxes = this.children.entries.filter((x) => !x.hasOwnProperty('isRock'));
        this.scene.physics.add.collider(boxes, boxes, this.boxCollide, null, this);
        this.scene.physics.add.collider(boxes, this.scene.mapLayers.World, this.tileCollide, null, this);
        
        let rocks = this.children.entries.filter((x) => x.hasOwnProperty('isRock'));
        this.scene.physics.add.collider(rocks, this.scene.mapLayers.World, this.tileCollide, null, this);
        
        //collider for boxes and rocks with the players
        this.scene.physics.add.collider(this.scene.game.Bob, this, this.playerCollide, null, this);
        this.scene.physics.add.collider(this.scene.game.Flit, this, this.playerCollide, null, this);
    }
    //fix the box in place, turn off physics
    tileCollide(box, tile) {
        //TODO: Objects are passed back to front from zone/box collider, This is probably because I'm using unreleased 3.17 but check after release
        if (box.constructor.name == 'InteractionZone') {
            let tmp = box;
            let tmp2 = tile;
            box = tmp2;
            tile = tmp;
        }
        //Handle box collision
        if (tile !== null && !box.isRock && box.lastContact !== tile) {
            box.deActivate();
            box.status = Boxes.State.Tile;
            box.lastContact = tile;
            box.hits--;
            this.scene.events.emit('boxTileCollide', box, tile);
            return true;
        }
    }
    onBoxDestruct(box) {
        console.log('box destruct', box);
        this.scene.sound.playAudioSprite('sfx', 'break');
        box.destroy();
    }

    //When a box is taken by a character
    /**
     * 
     * @param {Phaser.GameObjects.Sprite} box 
     * @param {Phaser.GameObjects.Sprite} player
     */
    onPickupBox(box, player) {
        if (!box.underneath && !box.isRock) { //only pick up box if there is nothing underneath it
            box.reset();
            player.carrying = box;
            box.player = player;
            box.body.enable = false;
            box.body.allowGravity = false;
            box.body.onOverlap = true;
            box.lastContact = null;
            if (this.scene.game.renderDebug) console.log('event pickup_box', box);
        }
    }
    tileOverlap(a, b, c){
        console.log(a, b, c);
    }
    //when a box is dropped by a character
    onDropBox(box, player) {
        player.carrying = null;

        //move to tile grid
        box.x = Math.round(box.x / Boxes.tileWidth) * Boxes.tileWidth;

        box.body.enable = true;
        box.body.immovable = false;
        box.body.moves = true;
        box.body.allowGravity = true;
        box.lastContact = null;
        if (this.scene.game.renderDebug) console.log('event drop_box', box);
    }
    /**
     * Handle player colliding with box and pick up
     * @param {Phaser.GameObjects.Sprite} player The active player
     * @param {Box} box The box they are colliding with
     */
    playerCollide(player, box) {
        if (!box.isRock && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (box.Affects === null || player.is(box.Affects)) {
                box.deActivate();
                this.scene.ActivePlayer.overBox(box);
            }
        }
        //if it's bob and a rock move it
        if (box.isRock && player.is('bob')) {
            let v = 0;
            if (box.body.touching.right) v = -player.speed;
            if (box.body.touching.left) v = player.speed;
            box.body.setVelocityX(v);
            
            let around = this.scene.physics.overlapRect(box.body.x + 2, box.body.top -2, box.body.width - 4,  box.body.height + 4);
            //There is only the rock it's got nothing underneath so reactivate
            if (around.length === 1) {
                box.activate();
            } 
        }
    }

    /**
     * Change the physics so boxes become static when they collide
     * @param {Box} a First Box
     * @param {Box} b Second Box
     */
    boxCollide(a, b) {
        if (!a.isRock && !b.isRock) {
            a.setVelocityX(0);
            b.setVelocityX(0);
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
            if (this.scene.game.renderDebug) console.log('box colliding');

            return true;
        }
    }
}