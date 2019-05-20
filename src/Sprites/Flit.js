/// <reference path="../../defs/phaser.d.ts" />

export default class Flit extends Phaser.Physics.Arcade.Sprite {
  get activeSpeed() {
    if (this.isSlow) return this.speed / 2;
    if (this.isFast) return this.speed * 1.5;
    return this.speed;
  }

  constructor(scene, x, y) {
    super(scene, x, y, 'flit');
    this.scene = scene;
    this.health = 3;
    this.hitDelay = false;
    this.direction = 'up';
    this.speed = 300;
    this.IsSlow = false;
    this.IsFast = false;
    this.health = 50;
    this.lastInjure = 0;
    this.collected = 0;
    this.name = 'flit';

    // enable physics
    this.scene.physics.world.enable(this);
    // add our player to the scene
    this.scene.add.existing(this);
    // create the player sprite    
    //this.setOrigin(0.5);

    this.setScale(.5);
    this.setCircle((this.width * this.scaleX) - 20);
    this.setBounce(0.1, 0.1); // our player will bounce from items
    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(true); // don't go out of the map 
    this.body.setOffset((this.body.width * this.scaleX) / 2, (this.body.height * this.scaleY) / 2);
    this.body.setMaxVelocity(500, 1000);

    this.splat = this.scene.add.image(0, 0, 'splat');
    this.splat.setDepth(100).visible = false;
    this.splat.setOrigin(0.5);

    // player walk animation
    this.anims.animationManager.create({
      key: 'flit_fly',
      frames: this.anims.animationManager.generateFrameNames('flit', { prefix: 'Fly', start: 1, end: 3, zeroPad: 2, suffix: '.png', yoyo: true }),
      frameRate: 12,
      repeat: -1
    });
    this.anims.animationManager.create({
      key: 'flit_rush',
      frames: this.anims.animationManager.generateFrameNames('flit', { prefix: 'Fly', start: 1, end: 3, zeroPad: 2, suffix: '.png', yoyo: true }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.animationManager.create({
      key: 'flit_idle',
      frames: this.anims.animationManager.generateFrameNames('flit', { prefix: 'Fly', start: 1, end: 3, zeroPad: 2, suffix: '.png', yoyo: true }),
      frameRate: 6,
      repeat: -1
    });
    this.idle();
  }
  injure(amount) {
    if (this.lastInjure + 500 < this.scene.game.loop.lastTime) {
      this.lastInjure = this.scene.game.loop.lastTime;
      this.health -= amount;
      this.scene.events.emit('loseHealth', this);
      this.scene.events.emit('updateHUD', this);
      this.scene.sound.playAudioSprite('sfx', 'squeak');
      //tint for a brief period
      if (!this.hitDelay) {
        this.hitDelay = true;
        this.tint = 0xFF6666;
        this.scene.time.addEvent({
          delay: 300,
          callback: () => {
            this.hitDelay = false;
            this.tint = 0xffffff;
          },
          callbackScope: this
        });
      }
      if (this.health <= 0) this.kill();
    }
  }
  kill() {
    console.log('Flit died');
    this.splat.x = this.body.center.x;// - this.body.width / 2;
    this.splat.y = this.body.center.y;// - this.body.height /2;
    this.splat.depth = this.depth - 1;
    this.splat.visible = true;
    this.body.destroy();
    this.scene.sound.playAudioSprite('sfx', 'squelch');
    //this.setOrigin(.5);
    this.scene.tweens.add({
      targets: [this, this.splat],
      angle: 359,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      ease: 'Power1',
      duration: 1000,
      onComplete: function (tween, targets, items) {
        targets[0].scene.events.emit('died', this);
      },
      onCompleteParams: [this]
    });
  }
  idle() {
    this.body.setVelocityX(0);
    this.body.setVelocityY(0);
    this.anims.play('flit_idle', true);
  }
  is(name) {
    return name.toLowerCase() == 'flit';
  }
  overBox(item, player) {
    if (this.carrying == null) {
      this.scene.events.emit('pickup_box', item, this);
    }
  }
  drop(item) {
    this.scene.events.emit('drop_box', item, this);
  }

  update(cursors, space) {
    if (this.carrying != null && Phaser.Input.Keyboard.JustDown(space)) {
      this.drop(this.carrying);
    }
    //if we are carrying a box move it to match our position
    if (this.carrying) {
      this.carrying.body.reset(this.body.x, this.body.bottom + 5);
    }

    if (cursors.left.isDown) {
      this.body.setVelocityX(0 - this.activeSpeed);
      this.anims.play('flit_fly', true); // walk left
      this.flipX = true; // flip the sprite to the left
    }
    if (cursors.right.isDown) {
      this.body.setVelocityX(this.activeSpeed);
      this.anims.play('flit_fly', true);
      this.flipX = false; // use the original sprite looking to the right
    }
    if (cursors.up.isDown) {
      this.body.setVelocityY(-200);
    }
    if (cursors.down.isDown) {
      this.body.setVelocityY(200);
    }
    //no keys so stop
    if (!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
      this.idle();
    }

    if (this.zoneInControl) {
      if (this.zoneValue && typeof this.zoneValue === 'object') {
        if (this.zoneValue.x)
          this.body.setVelocityX(this.zoneValue.x + this.body.velocity.x);
        if (this.zoneValue.y)
          this.body.setVelocityY(this.zoneValue.y + this.body.velocity.y);
      }
    }
    this.zoneInControl = false;
    this.zoneValue = 0;
    this.isSlow = false;
    this.isFast = false;
  }
}