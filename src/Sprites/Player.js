/// <reference path="../../defs/phaser.d.ts" />
//TODO
//Impliment jump height of one block
//Implement strength of three
//Implement lift
//Implement push

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bob');
    this.scene = scene;
    this.health = 3;
    this.hitDelay = false;
    this.direction = 'up';
    this.carrying = null;
    this.currently = null;
    // enable physics
    this.scene.physics.world.enable(this);
    this.setScale(.5);
    this.debugText = ''; 

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
  overBox(item) {
    if (this.carrying == null) {
      this.carrying = item;
      try {
        item.body.allowGravity = false;
        //item.body.checkCollision.none = true;
      } catch (e) {

      }
    }
  }
  drop(item) {
    //item.body.checkCollision.none = false;
    item.body.allowGravity = true;
    this.carrying = null;
    //item.body.checkCollision.top = true;
  }
  update(cursors, space) {
    //get the direction from the velocity
    this.direction = {
      left: this.body.velocity.x < -2 ? Phaser.Physics.Arcade.FACING_LEFT : 0,
      right: this.body.velocity.x > 2 ? Phaser.Physics.Arcade.FACING_RIGHT : 0,
      up: this.body.velocity.y < -2 ? Phaser.Physics.Arcade.FACING_UP : 0,
      down: this.body.velocity.y > 2 ? Phaser.Physics.Arcade.FACING_DOWN : 0
     }; 

   this.body.setVelocityX(0);
    //drop a box
    if (this.carrying != null && Phaser.Input.Keyboard.JustDown(space)) {
      this.drop(this.carrying);
    }
    //if we are carrying a box move it to match our position
    if (this.carrying) {
      if(this.direction.left > 0){
        this.carrying.x = this.body.x - (this.carrying.width);
      }else if(this.direction.right > 0){
        this.carrying.x = this.body.x + (this.carrying.width);
      }
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