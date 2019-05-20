//import Phaser from './phaser.js';

export default {
    type: Phaser.AUTO,
    width: 1024,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false,
            overlapBias: 8,
            tileBias:16,
            debug: true
        }
    }
};