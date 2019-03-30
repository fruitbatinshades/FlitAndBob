/// <reference path="../../defs/phaser.d.ts" />

export default class Flit extends Phaser.Physics.Arcade.Sprite {
  constructor (scene, x, y) {
    super(scene, x, y, 'flit');
    this.scene = scene;
    this.health = 3;
    this.hitDelay = false;
    this.direction = 'up';

    // enable physics
    this.scene.physics.world.enable(this);
    // add our player to the scene
    this.scene.add.existing(this);
   // create the player sprite    
   this.setScale(.5);
   this.setCircle(this.width * this.scaleX);
    this.setBounce(0.1,0.1); // our player will bounce from items
    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(true); // don't go out of the map 

    // player walk animation
    this.anims.animationManager.create({
        key: 'flit_fly',
      frames: this.anims.animationManager.generateFrameNames('flit', { prefix: 'Fly', start: 1, end: 3, zeroPad: 2, suffix: '.png', yoyo: true}),
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
      frames: this.anims.animationManager.generateFrameNames('flit', { prefix: 'Fly', start: 1, end: 3, zeroPad: 2, suffix: '.png', yoyo: true}),
        frameRate: 6,
        repeat: -1
    });
    this.idle();
  }

  idle(){
    this.body.setVelocityX(0);
    this.body.setVelocityY(0);
    this.anims.play('flit_idle', true);
  }

  overBox(item, player) {
    if (this.carrying == null) {
      console.log('before pickup', item.body);
      //this.carrying = item;
       //item.body.enable = false;
       //item.body.checkCollision.none = true;
      this.scene.events.emit('pickup_box', item, this);
    }
  }
  drop(item) {
    this.scene.events.emit('drop_box', item, this);
  }

  update (cursors, space) {
    if (this.carrying != null && Phaser.Input.Keyboard.JustDown(space)) {
      this.drop(this.carrying);
    }
    //if we are carrying a box move it to match our position
    if (this.carrying) {
      this.carrying.x = this.body.x;
      this.carrying.y = this.body.bottom + 5;
    }

    if (cursors.left.isDown)
    {
        this.body.setVelocityX(-200);
        this.anims.play('flit_fly', true); // walk left
        this.flipX = true; // flip the sprite to the left
    }
    if (cursors.right.isDown)
    {
        this.body.setVelocityX(200);
        this.anims.play('flit_fly', true);
        this.flipX = false; // use the original sprite looking to the right
      }
      if (cursors.up.isDown)
      {
        this.body.setVelocityY(-200);
      }
      if (cursors.down.isDown)
      {
        this.body.setVelocityY(200);
    } 
    //no keys so stop
    if(!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
        this.idle();
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