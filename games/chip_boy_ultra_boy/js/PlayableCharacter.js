const ANIMATION_HERO_IDLE = 'animationHeroIdle'; 

class PlayableCharacter extends Phaser.Sprite {
  constructor(game, x, y, spriteName) {
        super(game, x + 40, y, spriteName);

          // physics properties
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;
    
        this.animations.play('animationHeroIdle');
  }
  
  //#region Animations
  addAnimation(name, frames, fps, looped) {
      this.animations.add(name, frames, fps, looped);
  }
  addAnimations(arrayOfAnimations) {
      arrayOfAnimations.forEach(function (currentAnimation) {
          this.addAnimation(
              currentAnimation.name, 
              currentAnimation.frames, 
              currentAnimation.fps, 
              currentAnimation.looped);
      }, this);
  }

  _getAnimationNameAndCallback() {
      let name = ANIMATION_HERO_IDLE; // default animation
      let func = null;

      let deltaX = this.body.position.x - this.body.prev.x;
      /*
      // dying
      if (!this.isAlive) {
          name = ANIMATION_HERO_DYING;
          func = "_heroKill";
      }
      // frozen & not dying
      else if (this.isFrozen) {
          name = ANIMATION_HERO_IDLE;
          this.extraJumpsCurrent = 0;
      }
      else if (this.isLedgeGrabbing) {
          name = ANIMATION_HERO_LEDGE_GRAB;
      }
      else if (this.isWallJumpPauseL || this.isWallJumpPauseR) {
          name = ANIMATION_HERO_WALL_JUMP_PAUSE;
      }
      // falling
      else if (this.body.velocity.y >= 0 && this.touchingDownCount == 0) {
          name = ANIMATION_HERO_FALL;
      }
      // jumping
      else if (this.isJumpingSingle) {
          name = ANIMATION_HERO_JUMP;
      }
      else if (this.isJumpingExtra) {
          name = ANIMATION_HERO_JUMP_EXTRA;
      }
      else if (deltaX != 0 && this.touchingDownCount > 0 && !this.isSliding) {
          name = (this.swordAttackSequence >= 0) ? 
              ANIMATION_HERO_RUN_SWORD :
              ANIMATION_HERO_RUN;
      }
      else if (this.isCrouching) {
          name = ANIMATION_HERO_CROUCH;
      }
      else if (this.isSliding) {
          name = ANIMATION_HERO_SLIDING;
      }
      else if (this.swordAttackSequence === -1) {
          name = ANIMATION_HERO_SWORD_DRAW;
          func = "_heroSwordDrawComplete";
      }
      else if (this.swordAttackSequence === 0) {
          name = ANIMATION_HERO_SWORD_IDLE;
      }
      else if (this.swordAttackSequence === 1) {
          name = ANIMATION_HERO_SWORD_ATTACK_1;
          func = "_heroSwordDrawComplete";
      }
      */
      let updateAnimation = {};
      updateAnimation.AnimationName = name;
      updateAnimation.OnComplete = func;
      return updateAnimation;
  }

  //#endregion Animations

  update() {
      // update sprite animation, if it needs changing
      let nextAnimation = this._getAnimationNameAndCallback();
      let animationName = nextAnimation.AnimationName;
      if (this.animations.name !== animationName) {
          this.animations.play(animationName);
          if (nextAnimation.OnComplete !== null) {
              this.animations.currentAnim.onComplete.add(
                  function () {
                      this[nextAnimation.OnComplete]();
                  }, this
              );
          }
          if (animationName in heroAnimationDimensions) {
              let nonStandard = heroAnimationDimensions[animationName];
              this.body.setSize(
                  nonStandard.w, 
                  nonStandard.h,
                  nonStandard.offsetX + 0.0, 
                  nonStandard.offsetY + 0.0);
          }
          else {
              this.body.setSize(
                  HERO_DEFAULT_SIZE_WIDTH, 
                  HERO_DEFAULT_SIZE_HEIGHT,
                  HERO_DEFAULT_SIZE_OFFSET_X, 
                  HERO_DEFAULT_SIZE_OFFSET_Y
              );
          }
      }
  }

  //#region Player Input
  move(direction) {
      // guard
      if (this.isFrozen) { return; }
  
      const SPEED = 200;
      this.body.velocity.x = direction * SPEED;
  
      if (!this.isAlive) { return; }

      // To turn the player, flip the image with scaling;
      // flipping (or mirroring) an image is achieved by 
      // applying a negative scale to the image:
      if (this.body.velocity.x < 0) {
          this.scale.x = -1;
      }
      else if (this.body.velocity.x > 0) {
          this.scale.x = 1;
      }
  }
  //#endregion Player Input

}
