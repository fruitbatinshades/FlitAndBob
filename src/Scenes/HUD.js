/// <reference path="../../defs/phaser.d.ts" />
/**
 * thE hEADS UP DISPLAY FOR HEALTH AND SCORE
 */
export default class HUD extends Phaser.Scene {
    containingScene = null;
    constructor() {
        super({ key: 'HUD', active: true });
    }

    create() {
        //  Grab a reference to the Game Scene
        let lvl = this.scene.get('Level');

        this.add.rectangle(130, 50, 240, 90, 0xaaccFF).alpha = .8;
        this.add.rectangle(126, 48, 244, 94).setStrokeStyle(3, 0xFFFFFF);;
        //flit
        this.add.image(32, 28, 'UI', 'flit').setScale(.5).tint = 0x000000;
        this.add.image(30, 26, 'UI', 'flit').setScale(.5);
        this.flitHealth = this.add.text(60, 10, '100 %', { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.flitHealth);
        //flies
        this.add.image(155, 28, 'UI', 'fly').setScale(.5).tint = 0x000000;
        this.add.image(153, 26, 'UI', 'fly').setScale(.5);
        this.fliesCollected = this.add.text(180, 10, '0 / ' + lvl.totalFlies, { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.fliesCollected);

        //Bob
        this.add.image(32, 72, 'UI', 'bob').setScale(.5).tint = 0x000000;
        this.add.image(30, 70, 'UI', 'bob').setScale(.5);
        this.bobHealth = this.add.text(60, 56, '100 %', { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.bobHealth);
        //shrooms
        this.add.image(155, 70, 'UI', 'shroom').setScale(.5).tint = 0x000000;
        this.add.image(153, 68, 'UI', 'shroom').setScale(.5);
        this.shroomsCollected = this.add.text(180, 56, '0 / ' + lvl.totalShrooms, { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.shroomsCollected);

        //menu icon
        this.restartIcon = this.add.image(990, 30, 'UI', 'restart').setScale(.5);
        this.restartIcon.setInteractive();
        this.restartIcon.on('pointerdown', function (pointer) {
            if (lvl) lvl.restartLevel();
        });
        //  Listen for events from it
        lvl.events.on('updateHUD', function (player) {
            if (player.is('Bob')) {
                this.bobHealth.text = parseInt((player.health / 100) * 100) + ' %';
                this.shroomsCollected.text = player.collected + ' / ' + lvl.totalShrooms;
            }
            else if (player.is('Flit')) {
                this.flitHealth.text = parseInt((player.health / 50) * 100) + ' %';
                this.fliesCollected.text = player.collected + ' / ' + lvl.totalFlies;
            }
        }, this);
    }
    setStroke(txt) {
        txt.setShadow(2, 2, '#333333', 2, true, false)
            .setStroke('#0066AA', 3)
            .setFontStyle('bold');
    }
}