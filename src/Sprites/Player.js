/// <reference path="../../defs/phaser.d.ts" />
//TODO
//Impliment jump height of one block
//Implement strength of three
//Implement lift
//Implement push

export default class Player extends Phaser.Physics.Arcade.Sprite {
  get activeSpeed() {
    if (this.isSlow) return this.speed / 2;
    if (this.isFast) return this.speed * 1.5;
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
    this.health = 100;
    this.lastInjure = 0;
    this.collected = 0;
    // enable physics
    this.scene.physics.world.enable(this);
    this.setScale(.7);
    //this.body.setSize(this.body.width - 10, this.body.height - 20).setOffset(0, 20);

    this.debugText = ''; 

    // add our player to the scene
    this.scene.add.existing(this);

    // create the player sprite    
    this.setBounce(0.2); // our player will bounce from items
    this.setCollideWorldBounds(true); // don't go out of the map        
    this.setGravityY(800); //set gravity to control jump height to 1 block

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
  idle() {
    //this.body.setVelocityX(0);
    this.anims.play('idle', true);
  }
  injure(amount) {
    if (this.lastInjure + 500 < this.scene.game.loop.lastTime) {
      this.lastInjure = this.scene.game.loop.lastTime;
      this.health -= amount;
      this.scene.events.emit('loseHealth', this);
      this.scene.events.emit('updateHUD', this);
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
      if (this.health <= 0) {
        console.log('Bob died');
        this.scene.events.emit('died', this);
      }
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
    return name == 'Bob';
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
        this.carrying.x = this.body.left - (this.carrying.width + 5);
      }else if(this.direction.right > 0){
        this.carrying.x = this.body.right + 5;//(this.carrying.width);
      }
      this.carrying.y = (this.body.top) - 16;
    }
    if (cursors.left.isDown) {
      this.body.setVelocityX(cursors.up.isDown ? - 100 : 0 - this.activeSpeed);
      this.anims.play('walk', true); // walk left
      this.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown) {
      this.body.setVelocityX(cursors.up.isDown ? 100 : this.activeSpeed);
      this.anims.play('walk', true);
      this.flipX = false; // use the original sprite looking to the right
    } else {
      this.idle();
    }
    // jump 
    if (cursors.up.isDown){
      if(this.body.touching.down || this.body.onFloor()) {
        this.body.setVelocityY(-500);
      }
    }
    //reset speed after update
    this.isSlow = false;
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