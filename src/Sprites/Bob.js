/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="../index.js" />
import { Utils } from '../Utils/Utils.js'
export class Bob extends Phaser.Physics.Arcade.Sprite {
  get activeSpeed() {
    if (this.isSlow) return this.speed / 2;
    if (this.isFast) return this.speed * 1.5;
    if (this.effectSpeed) return this.effectSpeed;
    return this.speed;
  }
  get direction() {
    //get the direction from the velocity
    return {
      left: this.body.velocity.x < -2 ? Phaser.Physics.Arcade.FACING_LEFT : 0,
      right: this.body.velocity.x > 2 ? Phaser.Physics.Arcade.FACING_RIGHT : 0,
      up: this.body.velocity.y < -2 ? Phaser.Physics.Arcade.FACING_UP : 0,
      down: this.body.velocity.y > 2 ? Phaser.Physics.Arcade.FACING_DOWN : 0,
      stationary: this.body.velocity.x === 0 && this.body.velocity.y === 0
    };
  }
  get health() {
    return this.scene.registry.get('bobHealth');
  }
  set health(value) {
    this.scene.registry.set('bobHealth', value);
  }
  get collected() {
    return this.scene.registry.get('bobCollected');
  }
  set collected(value) {
    this.scene.registry.set('bobCollected', value);
  }

  constructor(scene, x, y) {
    super(scene, x, y, 'bob');

    this.scene = scene;
    this.health = 3;
    this.hitDelay = false;
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
    this.zoneInControl = false;
    this.zoneValue = 0;
    // enable physics
    this.scene.physics.world.enable(this);
    this.setScale(.7);
    this.body.setSize(this.body.width * this.scaleX, this.body.height).setOffset(0, 0);
    this.body.setMaxVelocity(500, 1000);
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

    this.scene.levelEvents.on('sceneUpdate', this.sceneUpdate, this);
    this.on('destroy', function () {
      if (this.text) this.text.destroy();
      this.scene.levelEvents.off('sceneUpdate');
    }, this);
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
        targets[0].scene.levelEvents.emit('died', this);
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
      this.scene.levelEvents.emit('loseHealth', this);
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
  // overBox(item) {
  //   // if (this.carrying == null) {
  //   //   this.scene.levelEvents.emit('pickup_box', item, this);
  //   //   console.log('pickup box');
  //   // }
  // }
  drop(item) {
    this.scene.levelEvents.emit('drop_box', item, this);
    console.log('drop box');
  }
  is(name) {
    return name.toLowerCase() == 'bob';
  }
  sceneUpdate() {
    //if we are carrying a box move it to match our position
    if (this.carrying) {
      this.carrying.deActivate();
      if (this.flipX) {
        this.carrying.body.reset(this.body.left - (this.carrying.width + 15), (this.body.top) - 24);
      } else {
        this.carrying.body.reset(this.body.right + 15, (this.body.top) - 24);
      }
    }
    if (this.scene.ActivePlayer.is('Bob')) {
      if (this.scene.input.keyboard.checkDown(this.scene.spaceKey, 500)) {
        if (this.carrying == null) {
          //get the closest box
          let b = Utils.closestOfType(this.body, 'Box', 74);
          if (b !== null && b.gameObject !== this.scene.game.Flit.carrying) {
            this.scene.levelEvents.emit('pickup_box', b.gameObject, this);
          }
        } else {
          this.drop(this.carrying);
        }
      }
    }
  }
  update(cursors, space) {

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
        let agrid = Utils.getBodiesAround(this.body, [], null, {bottom:true, right:true, left:true});
        Object.values(agrid).forEach((o) => {
          if (o && o.length > 0) {
            for (let i = 0; i < o.length; i++) {
              let go = o[i].gameObject;
              if (o[i].enable && (go.constructor.name === 'Box' || go.constructor.name === 'Rock' || (go.constructor.name === 'InteractionZone' && go.Blocks != null))) {
                //stop jump if dead weight above
                if (go.constructor.name !== 'DeadWeight') {
                  this.scene.sound.playAudioSprite('sfx', 'jump', { volume: .1 });
                  this.body.setVelocityY(-500);
                }
              }
            }
          }
        });
      }
    }
    if (this.zoneInControl) {
      if (this.zoneValue && typeof this.zoneValue === 'object') {
        if(this.zoneValue.x)
          this.body.setVelocityX(this.zoneValue.x);
        if (this.zoneValue.y)
          this.body.setVelocityY(this.zoneValue.y);
      }
    }

    //reset Effects after update
    this.isSlow = false;
    this.isFast = false;
    this.zoneInControl = false;
    this.zoneValue = 0;
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
      let around = Utils.getBodiesAround(box.body, [], null, { up: true, down: true, left: true, right: true });
      let blockedRight = around.right.some((o) => {return o.gameObject.Blocks !== null && o.gameObject.isActive;});
      let blockedLeft = around.left.some((o) => {return o.gameObject.Blocks !== null && o.gameObject.isActive;});

      //bobs on top so treat as normal collision
      if(around.up.some((o) => { return o.gameObject.constructor.name === 'Bob';})) return true;
    }
    return true;
  }
  /**
   * Handle player colliding with box and pick up
   * @param {Phaser.GameObjects.Sprite} player The active player
   * @param {Box} box The box they are colliding with
   */
  boxPlayerCollide(player, box) {
    //if it's bob and a rock move it
    if (box.isRock) {
      let v = 0;
      let around = Utils.getBodiesAround(box.body);
      let bobOnTop = around.up.some((o) => { return o.gameObject.constructor.name === 'Bob'; });
      let blockedRight = around.right.some((o) => { return o.gameObject.Blocks !== null && o.gameObject.isActive; });
      let blockedLeft = around.left.some((o) => { return o.gameObject.Blocks !== null && o.gameObject.isActive; });

      if (!bobOnTop && !blockedLeft && !blockedRight) {
        if (player.body.touching.right || player.body.touching.left) {
          box.body.immovable = false;
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
        } else {
          box.body.immovable = true;
        }
      }
    }
  }
}