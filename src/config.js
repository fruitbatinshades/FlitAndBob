//import Phaser from './phaser.js';

export default {
    type: Phaser.AUTO,
    width: 1024,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: true
        }
    },
    plugins: {
        global: [NineSlice.Plugin.DefaultCfg]
    }
};