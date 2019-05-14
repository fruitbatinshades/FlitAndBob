/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="../index.js" />
export default class Bob extends Phaser.Physics.Arcade.Sprite {
  get activeSpeed() {
    if (this.isSlow) return this.speed / 2;
    if (this.isFast) return this.speed * 1.5;
    if (this.effectSpeed) return this.effectSpeed;
    return this.speed;
  }

  constructor(scene, x, y) {
    super(scene, x, y, 'bob');
    this.scene = scene;
    this.health = 3;
    this.hitDelay = false;
    this.direction = 'up';
    this.carrying = null;
    this.currently = null;
    this.speed = 200;
    this.effectSpeed = 0;
    this.health = 100;
    this.lastInjure = 0;
    this.collected = 0;
    this.isSlow = false;
    this.isFast = false;
    this.name = 'bob';
    // enable physics
    this.scene.physics.world.enable(this);
    this.setScale(.7);
    this.body.setSize(this.body.width * this.scaleX, this.body.height).setOffset(0, 0);

    this.debugText = '';

    // add our player to the scene
    this.scene.add.existing(this);

    // create the player sprite    
    //this.setBounce(0.2); // our player will bounce from items
    this.setCollideWorldBounds(true); // don't go out of the map        
    this.setGravityY(800); //set gravity to control jump height to 1 block
    this.splat = this.scene.add.image(0, 0, 'splat');
    this.splat.setDepth(100).visible = false;
    this.splat.setOrigin(0.5);
    // player walk animation
    this.anims.animationManager.create({
      key: 'walk',
      frames: this.anims.animationManager.generateFrameNames('bob', { prefix: 'Bob', start: 1, end: 3, zeroPad: 2, suffix: '.png', yoyo: true }),
      frameRate: 6,
      repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.animationManager.create({
      key: 'idle',
      frames: this.anims.animationManager.generateFrameNames('bob', { prefix: 'Bob', start: 1, end: 1, zeroPad: 2, suffix: '.png' }),
      frameRate: 6,
    });
    this.idle();
  }
  kill() {
    console.log('Flit died');
    this.splat.x = this.body.center.x;
    this.splat.y = this.body.center.y;
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
    this.anims.play('idle', true);
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
  overBox(item) {
    if (this.carrying == null) {
      this.scene.events.emit('pickup_box', item, this);
      console.log('pickup box');
    }
  }
  drop(item) {
    this.scene.events.emit('drop_box', item, this);
    console.log('drop box');
  }
  is(name) {
    return name.toLowerCase() == 'bob';
  }
  update(cursors, space) {
    //get the direction from the velocity
    this.direction = {
      left: this.body.velocity.x < -2 ? Phaser.Physics.Arcade.FACING_LEFT : 0,
      right: this.body.velocity.x > 2 ? Phaser.Physics.Arcade.FACING_RIGHT : 0,
      up: this.body.velocity.y < -2 ? Phaser.Physics.Arcade.FACING_UP : 0,
      down: this.body.velocity.y > 2 ? Phaser.Physics.Arcade.FACING_DOWN : 0
    };
    //drop a box
    if (this.carrying != null && Phaser.Input.Keyboard.JustDown(space)) {
      this.drop(this.carrying);
    }

    //if we are carrying a box move it to match our position
    if (this.carrying) {
      if (this.direction.left > 0) {
        this.carrying.x = this.body.left - (this.carrying.width + 15);
      } else if (this.direction.right > 0) {
        this.carrying.x = this.body.right + 15;//(this.carrying.width);
      }
      this.carrying.y = (this.body.top) - 24;
    }

    //if a speed effect is active ignore keys
    if (this.effectSpeed !== 0) {
      this.body.setVelocityX(this.direction.left ? -this.effectSpeed : this.effectSpeed);
    } else {
      //process keys
      if (cursors.left.isDown) {
        this.body.setVelocityX(cursors.up.isDown ? - 150 : 0 - this.activeSpeed);
        this.anims.play('walk', true); // walk left
        this.flipX = true; // flip the sprite to the left
        this.body.setOffset(40, 0); //flip the collision
      }
      else if (cursors.right.isDown) {
        this.body.setVelocityX(cursors.up.isDown ? 150 : this.activeSpeed);
        this.anims.play('walk', true);
        this.flipX = false; // use the original sprite looking to the right
        this.body.setOffset(0, 0);
      } else {
        if (this.effectSpeed === 0)
          this.body.setVelocityX(0);
        this.idle();
      }
    }

    // jump 
    if (cursors.up.isDown) {
      //on floor, just jump
      if (this.body.onFloor() && !this.body.touching.up && !this.body.blocked.up) {
        this.scene.sound.playAudioSprite('sfx', 'jump', {volume:.1});
        this.body.setVelocityY(-500);
      }
      if (this.body.touching.down || this.body.blocked.down) {
        //Check if Bob is on a box and allow jump
        let agrid = this.scene.game.getBodiesAround(this.body, [], {bottom:true, right:true, left:true});
        Object.values(agrid).forEach((o) => {
          if (o && o !== null && o.gameObject) {
            let go = o.gameObject;
            if (go.constructor.name === 'Box' || go.constructor.name === 'Rock' || (go.constructor.name === 'InteractionZone' && go.Blocks != null)) {
              //stop jump if dead weight above
              if (go.constructor.name !== 'DeadWeight') {
                this.scene.sound.playAudioSprite('sfx', 'jump', { volume: .1 });
                this.body.setVelocityY(-500);
              }
            }
          }
        });
      }
    }

    //reset Effects after update
    this.isSlow = false;
    this.isFast = false;
    this.effectSpeed = 0;
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

    //If it's bob and a rock check the rock can be pushed
    if (box.isRock) {
      let around = this.scene.game.getBodiesAround(box.body, [], { up:true, down:true, left:true, right:true});
      let blockedRight = around.right !== null && around.right.gameObject.Blocks !== null && around.right.gameObject.isActive;
      let blockedLeft = around.left !== null && around.left.gameObject.Blocks !== null && around.left.gameObject.isActive;
      //bobs on top so treat as normal collision
      if (around.up !== null && around.up.gameObject.constructor.name === 'Bob')
        return true;

      if (box.body.blocked.right || (around.left !== null && around.left.gameObject.constructor.name === 'Bob' && blockedRight)) {
        return false;
      }
      else if (box.body.blocked.left || (around.right !== null && around.right.gameObject.constructor.name === 'Bob' && blockedLeft)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Handle player colliding with box and pick up
   * @param {Phaser.GameObjects.Sprite} player The active player
   * @param {Box} box The box they are colliding with
   */
  boxPlayerCollide(player, box) {
    if (!box.isRock && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (box.Affects === null || player.is(box.Affects)) {
        box.deActivate();
        this.scene.ActivePlayer.overBox(box);
      }
    }
    //if it's bob and a rock move it
    if (box.isRock) {
      let v = 0;
      if (player.body.touching.right || player.body.touching.left) {
        //console.log(box.body.blocked);
        if (player.body.touching.left) {
          v = -player.speed;
        }
        else if (player.body.touching.right) {
          v = player.speed;
        }
        if (v === 0) {
          box.body.stop();
          player.body.stop();
        }
        else {
          box.body.setVelocityX(v);
        }
      }
      let around = this.scene.physics.overlapRect(box.body.x + 2, box.body.top - 2, box.body.width - 4, box.body.height + 4);
      //There is only the rock it's got nothing underneath so reactivate
      if (around.length === 1) {
        box.activate();
      }
    } 
  }
}