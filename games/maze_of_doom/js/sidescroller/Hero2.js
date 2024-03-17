//#region constants
// ToDo ES6: what's a better ES6 way of setting these externally, rather than having them be constants?
const ANIMATION_HERO_IDLE = 'animationHeroIdle'; 
const ANIMATION_HERO_SLIDING = 'animationHeroSliding';
const ANIMATION_HERO_CROUCH = 'animationHeroCrouch';
const ANIMATION_HERO_RUN = 'animationHeroRun';
const ANIMATION_HERO_RUN_SWORD = 'animationHeroRunSword';
const ANIMATION_HERO_JUMP = 'animationHeroJump';
const ANIMATION_HERO_JUMP_EXTRA = 'animationHeroJumpExtra';
const ANIMATION_HERO_WALL_JUMP_PAUSE = 'animationHeroWallJumpPause';
const ANIMATION_HERO_FALL = "animationHeroFall"
const ANIMATION_HERO_LEDGE_GRAB = 'animationHeroLedgeGrab';
const ANIMATION_HERO_LEDGE_PULLUP = 'animationHeroLedgePullup';
const ANIMATION_HERO_SWORD_DRAW = 'animationHeroSwordDraw';
const ANIMATION_HERO_SWORD_IDLE = 'animationHeroSwordIdle';
const ANIMATION_HERO_SWORD_ATTACK_1 = 'animationHeroSwordAttack1';
const ANIMATION_HERO_DYING = 'animationHeroDying';

// Note: offsetY needs to be the sprite's default height 
// (ex. 72) - h! Like 30 & 42 or 72 & 0.
var heroAnimationDimensions = {}; 
heroAnimationDimensions[ANIMATION_HERO_SLIDING] = { "w": 40, "h": 30, "offsetX": 35, "offsetY": 42 };

const HERO_DEFAULT_SIZE_WIDTH = 40;
const HERO_DEFAULT_SIZE_HEIGHT = 72;
const HERO_DEFAULT_SIZE_OFFSET_X = 32;
const HERO_DEFAULT_SIZE_OFFSET_Y = 0;

//#endregion constants

class Hero2 extends Phaser.Sprite {
    constructor(game, x, y, spriteName) {
        super(game, x + 40, y, spriteName);
        
        this.anchor.set(0.5, 0.5);

        // physics properties
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;

        // player settings:
        this.jumpSpeed = 400;
        this.extraJumpsCurrent = 0;
        this.extraJumpsMax = 3; // ToDo: used to be 1 but for demo make 3;
        this.slidingFramesCurrent = 0;
        this.slidingFramesMax = 32;
        this.wallJumpPauseDurationLimit = 100; // ToDo: used to be 30 but for demo make this longer;
        this.ledgeGrabProximity = 5;

        // allowed actions:
        this.canSlide = false; // Disable for now. See ToDo below explaining why.
        this.canLedgeGrab = true;
        this.canWallJumpL = true;
        this.canWallJumpR = true;

        // player state:
        this.isAlive = true;
        this.isCrouching = false;
        this.isJumpingSingle = false;
        this.isJumpingExtra = false;
        this.isSliding = false;
        this.isLedgeGrabbing = false;
        this.touchingDownCount = 0;
        this.touchingLeftCount = 0;
        this.touchingRightCount = 0;
        this.isWallJumpPauseR = false;
        this.isWallJumpPauseRDuration = 0;
        this.wallJumpPauseRHeight = 0;
        this.isWallJumpPauseL = false;
        this.isWallJumpPauseLDuration = 0;
        this.wallJumpPauseLHeight = 0;
        this.swordAttackSequence = -2;

        // Make starting animation separate funcion:
        this.animations.play('animationHeroIdle');
        //alert("Hero2 constructor end")
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
    //#endregion Animations

    //#region Player State

    canSingleJump() {
        return (
            this.isAlive 
            && !this.isFrozen && (
                this.touchingDownCount > 0 || 
                this.isLedgeGrabbing || 
                this.isWallJumpPauseL || 
                this.isWallJumpPauseR 
            )
        );
    }
    canExtraJump() {
        return (
            this.isAlive 
            && !this.isFrozen 
            && (this.extraJumpsCurrent < this.extraJumpsMax) 
            && !this.isBoosting 
            && (
                this.isJumpingSingle 
                // 2018-12-17: now you can walk off a ledge and jump while free-falling.
                || (this.touchingDownCount == 0 && this.body.velocity.y >= 0) 
            )
        );
    }
    doJumpSingle() {
        this.body.velocity.y = -this.jumpSpeed;
        this.isJumpingSingle = true;
        this.isBoosting = true;
        this.isLedgeGrabbing = false;
        if (this.isWallJumpPauseL) {
            this.canWallJumpL = false;
            this.canWallJumpR = true;
        }
        else if (this.isWallJumpPauseR) {
            this.canWallJumpL = true;
            this.canWallJumpR = false;
        }
        this.isWallJumpPauseL = false;
        this.isWallJumpPauseR = false;
    }
    doJumpExtra() {
        this.body.velocity.y = -this.jumpSpeed;
        this.extraJumpsCurrent++;
        this.isJumpingExtra = true;
        this.isJumpingSingle = false;
        this.isBoosting = true;
    }
    continueJumpBoost() {
        this.body.velocity.y = -this.jumpSpeed;
        this.isBoosting = true;
    }
    stopJumpBoost() {
        this.isBoosting = false;
    }
    resetCollisionStates() {    
        this.touchingDownCount = 0;
    }
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
    _getAnimationNameAndCallback() {
        let name = ANIMATION_HERO_IDLE; // default animation
        let func = null;

        let deltaX = this.body.position.x - this.body.prev.x;
    
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
    
        let updateAnimation = {};
        updateAnimation.AnimationName = name;
        updateAnimation.OnComplete = func;
        return updateAnimation;
    }

    _heroSwordDrawComplete() {
        this.swordAttackSequence = 0;
    }

    _heroKill() {
        this.isDead = true;
    }

    freeze() {
        this.body.enable = false;
        this.isFrozen = true;
    }

    takeDamage() {
        // ToDo: Don't die during demo, but bring this back later.
        //this.isAlive = false;
    }

    //#endregion Player State

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

//export default Hero2;