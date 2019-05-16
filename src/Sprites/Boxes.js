/// <reference path="../../defs/phaser.d.ts" />
import Settings from '../settings.js';
import Box from './box.js';
import Rock from './Rock.js';
import DeadWeight from './DeadWeight.js';
//import utils from '../Utils/Debug.js';

export default class Boxes extends Phaser.Physics.Arcade.Group {
    static State = {
        None: 0,
        Sitting: 1,
        Player: 2,
        Tile: 3,
        Zone: 4
    }
    scene;
    static tileWidth = 64;

    constructor(scene, children, spriteArray) {
        super(scene, children);

        //createCallbackHandler errors if this is not set which implies the inheritence is wrong somehow :|
        this.world = scene.physics.world;
        this.scene = scene;
        console.log('boxes.js', this);
        // add boxes to our group
        spriteArray.forEach((box) => {
            let b;
            if (box.data != null && box.data.values.hasOwnProperty('Rock')) {
                //its a rock
                b = new Rock(box);
            } else if (box.data != null && box.data.values.hasOwnProperty('DeadWeight')) {
                b = new DeadWeight(box);
            } else {
                b = new Box(box);
            }
            b.setOrigin(0, 0);
            this.add(b, true);
            this.scene.physics.world.enable(b);
            b.body.immovable = true;

            box.destroy(); //destroy original tile
        }, this);

        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.scene.events.on('preupdate', this.preUpdate, this);
        this.init();
    }
    preUpdate(a, b, c, d) { 
        //TODO: after sccene restart, scene is null
        if (this.scene && this.scene.game && this.scene.game.debugOn) { 
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
        let boxes = this.getBoxes();
        this.scene.physics.add.collider(boxes, boxes, Box.boxOnBoxCollide, null, this);
        this.scene.physics.add.collider(boxes, this.scene.mapLayers.World, Box.tileCollide, null, this);
        
        let rocks = this.getRocks();
        this.scene.physics.add.collider(rocks, this.scene.mapLayers.World, Rock.tileCollide, null, this);
        this.scene.physics.add.collider(rocks, rocks, Rock.separate, null, this);

        let deadWeights = this.getDeadWeights();
        this.scene.physics.add.collider(deadWeights, deadWeights, DeadWeight.deadWeightCollide, null, this);
        this.scene.physics.add.collider(deadWeights, rocks, DeadWeight.deadWeightCollide, null, this);
        this.scene.physics.add.collider(deadWeights, this.scene.mapLayers['World'], DeadWeight.deadWeightCollide, null, this);
        this.scene.physics.add.collider(deadWeights, this.scene.bob);//, this.playerDWCollide, null, this);
        this.scene.physics.add.collider(deadWeights, this.scene.flit);//, this.playerDWCollide, null, this);
        
        //collider for boxes and rocks with the players
        this.scene.physics.add.collider(this.scene.game.Bob, this, this.scene.game.Bob.boxPlayerCollide, this.scene.game.Bob.boxPlayerPreCollide, this);
        this.scene.physics.add.collider(this.scene.game.Flit, this, this.boxPlayerCollide, this.boxPlayerPreCollide, this);
    }

    onBoxDestruct(box) {
        console.log('box destruct', box);
        //check we are not activating anything
        if (box.lastContact !== null && box.lastContact.constructor.name === 'InteractionZone') {
            box.lastContact.process(box.lastContact, this.scene.ActivePlayer);
        }
        this.scene.sound.playAudioSprite('sfx', 'break');
        box.destroy();
    }

    /**
     * When a box is taken by a character
     * @param {Box} box 
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
            if (this.scene.game.debugOn) console.log('event pickup_box', box);
        }
    }

    /**
    * when a box is dropped by a character
    * @param {Box} box
    * @param {Phaser.GameObjects.Sprite} player
    */
    onDropBox(box, player) {
        player.carrying = null;

        //move to tile grid
        box.x = Math.round(box.x / Boxes.tileWidth) * Boxes.tileWidth;

        box.body.enable = true;
        box.body.immovable = false;
        box.body.moves = true;
        box.body.allowGravity = true;
        box.lastContact = null;
        if (this.scene.game.debugOn) console.log('event drop_box', box);
    }
    /**
     * Process when a box is about to contact the player
     * @param {Phaser.GameObjects.Sprite} player 
     * @param {Phaser.GameObjects.Sprite} box
     */
    boxPlayerPreCollide(player, box) {
        //if box is falling don't collide with player
        if (box.body.velocity.y > 1)
            return false;
        return true;
    }
    /**
     * Handle player colliding with box and pick up
     * @param {Phaser.GameObjects.Sprite} player The active player
     * @param {Box} box The box they are colliding with
     */
    boxPlayerCollide(player, box) {
        if (!box.isRock && !box.isDeadWeight && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (box.Affects === null || player.is(box.Affects)) {
                box.deActivate();
                this.scene.ActivePlayer.overBox(box);
            }
        }
        // if (box.isRock && player.is('flit'))
        // {
        //     box.body.immovable = true;
        //     box.body.stop();
        // }
        // if (box.isDeadWeight) {
        //     box.body.immovable = true;
        //     box.body.stop();
        // }
    }

 
    getBoxes() {
        return this.children.entries.filter((b) => b.isBox);
    }
    getRocks() {
        return this.children.entries.filter((b) => b.isRock);
    }
    getDeadWeights() {
        return this.children.entries.filter((b) => b.isDeadWeight);
    }
}