/// <reference path="../../defs/phaser.d.ts" />
/**
 * thE hEADS UP DISPLAY FOR HEALTH AND SCORE
 */
export class HUD extends Phaser.Scene {
    constructor() {
        super({ key: 'HUD', active: true });
    }
    resume() {
        
    }
    create() {
        //  Grab a reference to the Game Scene
        this.lvl = this.scene.get('Level');

        this.add.rectangle(130, 50, 240, 90, 0xaaccFF).alpha = .8;
        this.add.rectangle(130, 50, 244, 94).setStrokeStyle(3, 0xFFFFFF);
        //flit
        this.add.image(32, 28, 'UI', 'flit').setScale(.5).tint = 0x000000;
        this.flitImage = this.add.image(30, 26, 'UI', 'flit').setScale(.5);
        this.flitHealth = this.add.text(60, 10, '100 %', { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.flitHealth);
        //flies
        this.add.image(155, 28, 'UI', 'fly').setScale(.5).tint = 0x000000;
        this.add.image(153, 26, 'UI', 'fly').setScale(.5);
        this.fliesCollected = this.add.text(180, 10, '0 / ' + this.lvl.totalFlies, { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.fliesCollected);

        //Bob
        this.add.image(32, 72, 'UI', 'bob').setScale(.5).tint = 0x000000;
        this.bobImage = this.add.image(30, 70, 'UI', 'bob').setScale(.5);
        this.bobHealth = this.add.text(60, 56, '100 %', { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.bobHealth);
        //shrooms
        this.add.image(155, 70, 'UI', 'shroom').setScale(.5).tint = 0x000000;
        this.add.image(153, 68, 'UI', 'shroom').setScale(.5);
        this.shroomsCollected = this.add.text(180, 56, '0 / ' + this.lvl.totalShrooms, { font: '20px Arial', fill: '#FFFFFF' });
        this.setStroke(this.shroomsCollected);

        //menu icon
        this.restartIcon = this.add.image(990, 30, 'UI', 'restart').setScale(.5);
        this.restartIcon.setInteractive();
        this.restartIcon.on('pointerdown', function (pointer) {
            if (this.lvl) this.lvl.restartLevel();
        },this);
        this.menuIcon = this.add.image(930, 30, 'UI', 'levels').setScale(.5);
        this.menuIcon.setInteractive();
        this.menuIcon.on('pointerdown', (p) => {
            this.scene.stop();
            this.scene.stop('Level');
            this.scene.bringToTop('LevelSelectScene');
            this.scene.start('LevelSelectScene');
        });
        this.registry.events.on('changedata', this.updateHUD, this);        
        this.events.on('start', this.attachRegistry, this);
        this.events.on('resume', this.attachRegistry, this);
        this.events.on('wake', this.attachRegistry, this);
        this.events.on('sleep', this.detachRegistry,this);
        this.events.on('shutdown', this.detachRegistry,this);
    }
    attachRegistry() {
        this.registry.events.on('changedata', this.updateHUD, this);        
    }
    detachRegistry() {
        this.registry.events.off('changedata');
    }

    updateHUD() {
            this.flitImage.clearTint();
            this.bobImage.clearTint();
            if (this.lvl.registry.get('ActivePlayer').is('Bob')) {
                this.bobImage.setTint(0xaaccff);
            } else {
                this.flitImage.setTint(0xaaccff);
            }
            this.flitHealth.text = parseInt((this.lvl.registry.get('flitHealth') / 50) * 100) + ' %';
            this.fliesCollected.text = this.lvl.registry.get('flitCollected') + ' / ' + this.lvl.totalFlies;
            this.bobHealth.text = parseInt((this.lvl.registry.get('bobHealth') / 100) * 100) + ' %';
            this.shroomsCollected.text = this.lvl.registry.get('bobCollected') + ' / ' + this.lvl.totalShrooms;
    }
    setStroke(txt) {
        txt.setShadow(2, 2, '#333333', 2, true, false)
            .setStroke('#0066AA', 3)
            .setFontStyle('bold');
    }
}