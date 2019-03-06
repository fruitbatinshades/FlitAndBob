/// <reference path="../../defs/phaser.d.ts" />


export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bob');
    this.scene = scene;
    this.health = 3;
    this.hitDelay = false;
    this.direction = 'up';
    this.carrying = null;
    // enable physics
    this.scene.physics.world.enable(this);
    this.setScale(.5);
    // this.body.allowGravity = false;
    // this.body.immovable = true;
    // this.body.acceleration = 0;

    // add our player to the scene
    this.scene.add.existing(this);

    // create the player sprite    
    this.setBounce(0.2); // our player will bounce from items
    this.setCollideWorldBounds(true); // don't go out of the map        

    // player walk animation
    this.anims.animationManager.create({
      key: 'walk',
      frames: this.anims.animationManager.generateFrameNames('bob', { prefix: 'w', start: 1, end: 6, zeroPad: 2, suffix: '.png' }),
      frameRate: 10,
      repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.animationManager.create({
      key: 'idle',
      frames: this.anims.animationManager.generateFrameNames('bob', { prefix: 's', start: 1, end: 6, zeroPad: 2, suffix: '.png' }),
      frameRate: 10,
    });
    this.idle();
    console.log(this.willRender(this.scene.cameras.main));
  }
  idle() {
    //this.body.setVelocityX(0);
    this.anims.play('idle', true);
  }
  update(cursors, space) {
    this.body.setVelocityX(0);

    //pick up drop a box
    if (space.isDown) {
      if (this.carrying) {
        //drop the box
        this.carrying.body.checkCollision = true;
        this.carrying = null;
      }
    }
    //if we are carrying a box move it to match our position
    if (this.carrying) {
      this.carrying.x = this.body.x + 64;
      this.carrying.y = this.body.y - 16;
    }
    if (cursors.left.isDown) {
      this.body.setVelocityX(-200);
      this.anims.play('walk', true); // walk left
      this.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown) {
      this.body.setVelocityX(200);
      this.anims.play('walk', true);
      this.flipX = false; // use the original sprite looking to the right
    } else {
      this.idle();
    }
    // jump 
    if (cursors.up.isDown && this.body.onFloor()) {
      this.body.setVelocityY(-500);
    }
  }

  //   loseHealth () {
  //     this.health--;
  //     this.scene.events.emit('loseHealth', this.health);
  //     if (this.health === 0) {
  //       this.scene.loadNextLevel(true);
  //     }
  //   }

  //   enemyCollision (player, enemy) {
  //     if (!this.hitDelay) {
  //       this.loseHealth();
  //       this.hitDelay = true;
  //       this.tint = 0xff0000;
  //       this.scene.time.addEvent({
  //         delay: 1200,
  //         callback: () => {
  //           this.hitDelay = false;
  //           this.tint = 0xffffff;
  //         },
  //         callbackScope: this
  //       });
  //     }
  //   }
}