//import Phaser from './phaser.js';

export default {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: true
        }
    }//,
    // scene: {
    //     key: 'main',
    //     preload: preload,
    //     create: create,
    //     update: update
    // }
};