/// <reference path="../../defs/phaser.d.ts" />

import Settings from '../settings.js';

export default class Workout extends Phaser.Scene {
    constructor(key) {
        super(key);
        //this.physics.world.setBounds(0, 0, 800, 6004);
        this.set1 = [];
    }

    init(data) {
        
    }
    create() {
        for (let i = 11; i > 1; i--) {
            let a = this.physics.add.sprite(20, i * 50, 'blob');//.setVelocityY(50);
            a.setCollideWorldBounds(true);
            //a.body.allowGravity = true;
            a.body.onCollide = true;
            a.tint = 0xFF0000;
            a.setOrigin(0, 0);
            a.setInteractive();
            //a.body.customSeparateX = false;

            //a.body.moves = false;
            this.set1.push(a);
        }
        for (let i = 10; i > 1; i--) {
            let a = this.physics.add.sprite(120, i * 50, 'blob').setVelocityY(150);
            a.body.onCollide = true;

            a.setCollideWorldBounds(true);
        }
        //this.physics.world.on('collide', this.listener, this.process);
        this.physics.add.collider(this.set1, this.set1, this.listener, this.process,  this);
        
        this.input.on('pointerdown', function (pointer, object) {
            //Get the object under the pointer
            let z = this.input.hitTestPointer(pointer);
            console.log(z);
            if (z.length === 1) {
                z[0].body.onCollide = !z[0].body.onCollide;
                z[0].tint = z[0].body.onCollide ? 0x00FF00 : 0xFFFFFF;
            }
        }, this);
    }
    update() {

    }
    listener(a, b, aBody, bBody) { 
        // console.log(aBody.prev, aBody.x, aBody.y);
        // a.y = Math.round(aBody.prev.y);
        // console.log(aBody.prev.y, a.y);
        // aBody.moves = false;
        // bBody.moves = false;
        // aBody.onCollide = false;
        // bBody.onCollide = false;
        // console.log('collide');
    }
    process(a, b) {
        console.log(new Date().getTime());
        //a.y = Math.round(a.body.prev.y);
        //a.y = a.body.prev.y;
        console.log(a.body.prev.y, a.y);
        a.body.moves = false;
        b.body.moves = false;
        // a.body.onCollide = false;
        // b.body.onCollide = false;
        this.sidesOnly(a);
        this.sidesOnly(b);
        
        console.log('collide');
        return true;
    }
    sidesOnly(a) {
        a.body.checkCollision.top = false;
        a.body.checkCollision.bottom = false;
    }
}