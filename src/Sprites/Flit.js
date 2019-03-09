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
        frames: this.anims.animationManager.generateFrameNames('flit', {prefix: 'fly', start: 1, end: 2, zeroPad: 2, suffix:'.png'}),
        frameRate: 12,
        repeat: -1
    });
    this.anims.animationManager.create({
        key: 'flit_idle',
        frames: this.anims.animationManager.generateFrameNames('flit', {prefix: 'fly', start: 1, end: 2, zeroPad: 2, suffix:'.png'}),
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

  overBox(item) {
    if (this.carrying == null) {
      this.carrying = item;
       item.body.allowGravity = false;
       console.log('pickup box');
    }
  }
  drop(item) {
    //item.body.checkCollision.none = false;
    item.body.allowGravity = true;
    this.carrying = null;
    console.log('drop box');
  }

  update (cursors, space) {

    if (this.carrying != null && Phaser.Input.Keyboard.JustDown(space)) {
      this.drop(this.carrying);
    }
    //if we are carrying a box move it to match our position
    if (this.carrying) {
      this.carrying.x = this.body.x;
      this.carrying.y = this.body.bottom + 3;
    }

    if (cursors.left.isDown)
    {
        this.body.setVelocityX(-200);
        this.anims.play('flit_fly', true); // walk left
        this.flipX = false; // flip the sprite to the left
    }
    if (cursors.right.isDown)
    {
        this.body.setVelocityX(200);
        this.anims.play('flit_fly', true);
        this.flipX = true; // use the original sprite looking to the right
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
        // this.body.setVelocityX(0);
        // this.body.setVelocityY(0);
        // this.anims.play('flit_idle', true);
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