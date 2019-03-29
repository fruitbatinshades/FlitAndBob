/// <reference path="../../defs/phaser.d.ts" />
//TODO
//Impliment jump height of one block
//Implement strength of three
//Implement lift
//Implement push

export default class Switch extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
    }
}