
var touchButtonA;
var touchButtonB;
var buttonUp;
var buttonDown;
var buttonLeft;
var buttonRight;

let keyPressToggleDebug = true;

let maxDebugLevel = 5; // 0=none;1=keys;2=bodies;3=camera;4=touch;
let debugLevel = 0;

const controlsAlpha = 0.5;
const controlsAlphaDown = 0.8;
//const controlsAlphaCardinal = 0.5;
const controlWidthUD = 62;
const controlHeightUD = 76;
const controlWidthLR = 76;
const controlHeightLR = 62;
const screenPad = 20;
const controlsPad = 10;

var directionButtonsSpacingX = 20;
var buttonScale = 2;

var lastLoop = new Date();

var FRAME_TOP_LEFT = 0;
var FRAME_TOP_RIGHT = 2;

var graphics;
var graphicsDebug;
//var graphicsDebugEnemy;

class PlayState {
    constructor(game, isMobile) {
        this.game = game;
        this.isMobile = isMobile;

        this.keyUpDurationDown = null;

        this.mapBounds = null;

        this.enemyWalls = null;

        this.boundingBoxes = null;

        this.wall = 0;
        this.tileWidth = 32;

        this.fps = 60;

        this.mapBoundsTiles = null;
    }

    unpauseGame(){
        this.game.paused = false;
        if (this.isMobile === true) {
            touchButtonA.alpha = controlsAlpha;
            touchButtonB.alpha = controlsAlpha;
            buttonLeft.alpha = controlsAlpha;
            buttonRight.alpha = controlsAlpha;
        }
    }

    validateData(data) {
        if (typeof data === 'undefined') {
            return this.buildDefaultData();
        }
    }

    buildDefaultData() {
        return {
            level: 0,
            gravity: 1200,
            maze: undefined,

            decoration: [

            ],
            platforms: [

            ],
        };
    }
    
    // Game State 1: Init
    init(data) {
        
        // ToDo: make this configurable. The player should be able to choose which keys map to which actions.
        // Translate keyboard keys to input:
        this.keys = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.LEFT,
            right: Phaser.KeyCode.RIGHT,
            up: Phaser.KeyCode.UP,
            down: Phaser.KeyCode.DOWN,
            A: Phaser.KeyCode.A,
            B: Phaser.KeyCode.B,
            D: Phaser.KeyCode.D,
            F: Phaser.KeyCode.F,
            S: Phaser.KeyCode.S,
            T: Phaser.KeyCode.T,
            W: Phaser.KeyCode.W
        });
    
        this.coinPickupCount = 0;
        this.hasKey = false;
    
        this.hasCheese = false;

        data = this.validateData(data);
        
        this.level = (typeof data !== 'undefined' && typeof data.level !== 'undefined') 
            ? data.level : 0;
    }

    getFps(thisLoop, lastLoop) {
        return (1000 / (thisLoop - lastLoop))|0;
    }    

    touchButtonAPress (thisButton) {
        thisButton.alpha = controlsAlphaDown;
        this.keys.up.isDown = true;
        this.keyUpDurationDown = new Date();
    }
    touchButtonARelease (thisButton) {
        thisButton.alpha = controlsAlpha;
        this.keys.up.isDown = false;
        this.keyUpDurationDown = null;
    }
    touchButtonBPress (thisButton) {
        thisButton.alpha = controlsAlphaDown;
        this.keys.F.isDown = true;
    }
    touchButtonBRelease (thisButton) {
        thisButton.alpha = controlsAlpha;
        this.keys.F.isDown = false;
    }
    touchButtonSettingsPress(thisButton) {
        //thisButton.alpha = controlsAlphaDown;
        //controlsSettings
    
        this.game.paused = true;
    
        // Hide the existing A button and draw a temp one:
        touchButtonA.alpha = 0;
        touchButtonB.alpha = 0;
        buttonLeft.alpha = 0;
        buttonRight.alpha = 0;
        
        let touchButtonACustom = this.game.add.sprite(
            this.game.width - (60 + 60*buttonScale), // x + 2y = 180; x + 1y = 120;     x + 2y = x + 1y + 60
            this.game.height - (60 + 60*buttonScale),
            'touchButtonA'
        );
        touchButtonACustom.scale.setTo(buttonScale, buttonScale);
        //touchButtonACustom.events.onInputDown.add(touchButtonAPress, this);
        //touchButtonACustom.events.onInputUp.add(touchButtonARelease, this);
    
    
        // Then add the menu
        //menu = game.add.sprite(w/2, h/2, 'menu');
        //menu.anchor.setTo(0.5, 0.5);
    
        // And a label to illustrate which menu item was chosen. (This is not necessary)
        //choiseLabel = game.add.text(w/2, h-150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
        //choiseLabel.anchor.setTo(0.5, 0.5);
    }
    
    touchButtonUpPress (thisButton) {
        thisButton.alpha = controlsAlphaDown;
        this.keys.up.isDown = true;
    }
    touchButtonUpRelease (thisButton) {
        thisButton.alpha = controlsAlpha;
        this.keys.up.isDown = false;
    }
    
    touchButtonDownPress (thisButton) {
        thisButton.alpha = controlsAlphaDown;
        this.keys.down.isDown = true;
    }
    touchButtonDownRelease (thisButton) {
        thisButton.alpha = controlsAlpha;
        this.keys.down.isDown = false;
    }
    
    touchButtonLeftPress (thisButton) {
        thisButton.alpha = controlsAlphaDown;
        this.keys.left.isDown = true;
    }
    touchButtonLeftRelease (thisButton) {
        thisButton.alpha = controlsAlpha;
        this.keys.left.isDown = false;
    }
    
    touchButtonRightPress (thisButton) {
        thisButton.alpha = controlsAlphaDown;
        this.keys.right.isDown = true;
    }
    touchButtonRightRelease (thisButton) {
        thisButton.alpha = controlsAlpha;
        this.keys.right.isDown = false;
    }
    
    // Game State 3: Create (create game entities and set up world here):
    create() {
        // fade in (from black)
        this.game.camera.flash('#000000');
    
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        /*
        // create sound entities
        this.sfx = {
            jump: this.game.add.audio('sfx:jump'),
            coin: this.game.add.audio('sfx:coin'),
            key: this.game.add.audio('sfx:key'),
            stomp: this.game.add.audio('sfx:stomp'),
            door: this.game.add.audio('sfx:door')
        };
        this.bgm = this.game.add.audio('bgm');
        this.bgm.loopFull();
        */
        // ToDo: there needs to be some initial json load that says 
        // what json should be loaded next.
        let jsonData = this.game.cache.getJSON(`level:${this.level}`);
        this._loadLevel(jsonData);
    
        this.game.input.onDown.add(this.unpauseGame, this);
    
        // create UI score boards
        this._createHud();
    }
    
    // Game State 4: Update
    update() {
        this._updateFps();
        this._renderTiles(this.boundingBoxes, this.mapBoundsTiles);
        this._handleCollisions();
        this._handleEnemyAI(this.hero);
        this._handleInput();
        this._setDebugLevels();
    }
    
    _updateFps() {
        var thisLoop = new Date();
        this.fps = this.getFps(thisLoop, lastLoop);
        lastLoop = thisLoop;
    }

    _setDebugLevels() {
        // Debug text:
        debugLabel1.text = debugText1;
        debugLabel2.text = debugTextKeyD;
        debugLabelFps.text = (this.fps < 40) ? "FPS: " + this.fps : "";

        if (debugLevel === 0) {
            graphicsDebug.clear();
            this.game.debug.reset();
        }
        else if (debugLevel === 1) {
            //this.game.debug.reset();
        }
        else if (debugLevel === 2) {
            debugText1 = "";
            this.game.debug.bodyInfo(this.hero, this.tileWidth*2, this.tileWidth*2);
        }
        else if (debugLevel === 3) {
            this.game.debug.cameraInfo(this.game.camera, this.tileWidth*2, this.tileWidth*2);
        }
        else if (debugLevel === 4) {
            this.game.debug.inputInfo(this.tileWidth*2, this.tileWidth*2);
            //this.game.debug.spriteInputInfo(controlsDPadCircle, this.tileWidth*2, this.tileWidth*5);
            this.game.debug.pointer(this.game.input.activePointer);
        }
        else if (debugLevel === 5) {
            this.game.debug.reset();

            // draw a line from each of the enemy's AI View at (aiViewX, aiViewY)
            // to the hero's view at (this.hero.viewX, this.hero.viewY).
            
            graphicsDebug.clear();
            graphicsDebug.lineStyle(4, 0xFF00FF, 1);
            this.enemies.forEach(function (anEnemy) {
                //aiViewX
                graphicsDebug.moveTo(
                    anEnemy.x + anEnemy.aiViewX, 
                    anEnemy.y + anEnemy.aiViewY
                );
                graphicsDebug.lineTo(this.hero.x, this.hero.y);
                graphicsDebug.endFill();
            }, this);
        }
        
        // let line1 = new Phaser.Line(10, 10, 500, 500);
        // this.game.debug.geom(line1);
        // this.game.debug.lineInfo(line1, 32, 32);

        
    }
    
    // Handle collisions and overlaps;
    //   Collision:    Keep 2 non-reactive bodies separate;
    //   Overlap:      Handle with corresponding events;
    _handleCollisions() {    
        // Reset hero's collision-based state:
        this.hero.resetCollisionStates();

        this.game.physics.arcade.collide(
            this.enemyWalls, this.enemies);
    
        this.landscapeBounds.forEach(function (land) {
            this.game.physics.arcade.collide(this.hero, land
                , this._onHeroCollisionWithLand, null, null
            );
        }, this);
        
        // Is the hero standing or in the air?
        // ToDo: move this to landscape-specific event handler function.
        if (this.hero.touchingDownCount > 0) {
            // Standing:
            this.hero.isJumpingSingle = false;
            this.hero.isJumpingExtra = false;
            this.hero.extraJumpsCurrent = 0;
            this.hero.canWallJumpL = true;
            this.hero.canWallJumpR = true;
            this.hero.isWallJumpPauseL = false;
            this.hero.isWallJumpPauseR = false;
        }
        else {
            //isWallJumpPauseLHeight, now wallJumpPauseLHeight
            if (this.hero.y > this.hero.wallJumpPauseLHeight + 128) {
                this.hero.canWallJumpL = true;
            }
            if (this.hero.y > this.hero.wallJumpPauseRHeight + 128) {
                this.hero.canWallJumpR = true;
            }
        }
    
        // hero vs coins (pick up)
        if (this.coinPickupCount < this.coinTotalAvailable) {
            this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this);
        }

        // hero vs key (pick up)
        if (!this.hasKey) {
            this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey, null, this);
        }
    
        // hero vs door (end level)
        if (this.hasKey && this.hero.touchingDownCount > 0) {
            this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
                // ignore if there is no key or the player is on air
                // TRY: Add an "Enter" button requirement.
                //   Must be standing to insert/turn key. Maybe doors with keys require
                //   standing and an "Enter", but something like a portal would not 
                //   and you could just fall into that (so the only req is `hasKey`).
                function (hero, door) {
                    return this.hasKey && hero.touchingDownCount > 0;
                }, this
            );
        }
        
        //graphicsDebugEnemy.clear();
        this.enemies.forEach(function (enemy) {
            if (!enemy.isAttacking || enemy.causedDamageThisCycle) {
                return;
            }
            
            let currentAttackFrame = enemy.animations.currentAnim.frame;
            let bbox = enemy.damageBounds[currentAttackFrame];
            
            // graphicsDebugEnemy.lineStyle(4, 0xFF00FF, 1);
            // graphicsDebugEnemy.drawRect(
            //     bbox.x*enemy.scale.x + enemy.body.x, 
            //     bbox.y*enemy.scale.y + enemy.body.y, 
            //     bbox.w*enemy.scale.x, 
            //     bbox.h*enemy.scale.y);
        
            // graphicsDebugEnemy.lineStyle(4, 0xFF7700, 1);
            // graphicsDebugEnemy.drawRect(
            //     this.hero.body.x, this.hero.body.y, 
            //     this.hero.body.width, this.hero.body.height);

            if (this._intersectRect(
                bbox.x*enemy.scale.x + enemy.body.x, 
                bbox.y*enemy.scale.y + enemy.body.y, 
                bbox.w*enemy.scale.x, 
                bbox.h*enemy.scale.y, 
                this.hero.body.x, this.hero.body.y, 
                this.hero.body.width, this.hero.body.height)
                ) {
                // Damage!
                
                enemy.causedDamageThisCycle = true;
                
                this.hero.takeDamage();

            }
                
        }, this);
    
        // this.itemsFood.forEach(function (food) {
        //     this.game.physics.arcade.collide(this.hero, food
        //         , this._onHeroCollisionWithFood, null, null
        //     );
        // }, this);
    
        // collision: hero vs enemies (kill or die)
        // this.game.physics.arcade.overlap(this.hero, this.spiders,
        //     this._onHeroVsEnemy, null, this);

    
        // Post-collision handling:
        if (this.hero.isLedgeGrabbing || this.hero.isWallJumpPauseL || this.hero.isWallJumpPauseR) {
            this.hero.body.velocity.y = 0;
            this.hero.body.allowGravity = false;
            if (this.hero.isWallJumpPauseL) {
                this.hero.isWallJumpPauseLDuration++;
                this.hero.wallJumpPauseLHeight = this.hero.y;
            }
            if (this.hero.isWallJumpPauseR) {
                this.hero.isWallJumpPauseRDuration++;
                this.hero.wallJumpPauseRHeight = this.hero.y;
            }
        }
        else if (this.hero.isDead) {
            this._RestartLevel();
        }
        else {
            this.hero.body.allowGravity = true;
            this.hero.isWallJumpPauseLDuration = 0;
            this.hero.isWallJumpPauseRDuration = 0;
        }
    }
    
    shutdown() {
        this.bgm.stop();
    }

    _handleEnemyAI(somePlayer) {
        this.enemies.forEach(function (anEnemy) {
            anEnemy.handleAI(somePlayer);
        }, this);
    }

    _handleInput() {
        let xDir = 0;
        let heroCanMove = !this.hero.isLedgeGrabbing && !this.hero.isWallJumpPauseL && !this.hero.isWallJumpPauseR;
        if (this.keys.right.isDown) {
            if (this.hero.isWallJumpPauseR && this.hero.isWallJumpPauseRDuration > this.hero.wallJumpPauseDurationLimit) {
                this.hero.isWallJumpPauseR = false;
                this.hero.scale.x *= -1;
                this.hero.canWallJumpL = false;
                this.hero.canWallJumpR = false;
            }
            else if (heroCanMove && !this.hero.body.touching.right) {
                xDir += 1;        
            }
        }
        else {
            if (this.hero.isWallJumpPauseR) {
                this.hero.isWallJumpPauseR = false;
                this.hero.scale.x *= -1;
                this.hero.canWallJumpL = false;
                this.hero.canWallJumpR = false;
            }
        }
        if (this.keys.left.isDown) {
            if (this.hero.isWallJumpPauseL && this.hero.isWallJumpPauseLDuration > this.hero.wallJumpPauseDurationLimit) {
                this.hero.isWallJumpPauseL = false;
                this.hero.scale.x *= -1;
                this.hero.canWallJumpL = false;
                this.hero.canWallJumpR = false;
            }
            else if (heroCanMove && !this.hero.body.touching.left) {
                xDir -= 1;
            }
        }
        else {
            if (this.hero.isWallJumpPauseL) {
                this.hero.isWallJumpPauseL = false;
                this.hero.scale.x *= -1;
                this.hero.canWallJumpL = false;
                this.hero.canWallJumpR = false;
            }
        }
        if (!this.hero.isAlive || (!this.keys.left.isDown && !this.keys.right.isDown)) { // stop
            xDir = 0;
        }
        this.hero.move(xDir);

        if (this.keys.F.isDown) {
            if (this.hero.swordAttackSequence === -2) {
                this.hero.swordAttackSequence = -1;
            }
            else {
                this.hero.swordAttackSequence = 1;
            }
        }
        
        if (this.keys.T.isDown) {
            if (keyPressToggleDebug) {
                keyPressToggleDebug = false;
                
                if (debugLevel === maxDebugLevel) {
                    debugLevel = 0;
                    debugTextKeyD = "";
                }
                else {
                    debugLevel++;
                }
            }
        }
        else {
            keyPressToggleDebug = true;
        }
    
        // handle jump
        const JUMP_HOLD = 200; // ms
        if (
            (this.keyUpDurationDown && (new Date() - this.keyUpDurationDown) < JUMP_HOLD) || 
            (this.keys.up.downDuration(JUMP_HOLD))
        ) {
            if (this.hero.canSingleJump()) {
                this.hero.isLedgeGrabbing = false;
                this.hero.doJumpSingle();
                this.sfx.jump.play();
            }
            else if (this.hero.canExtraJump()) {
                this.hero.doJumpExtra();
                this.sfx.jump.play();
            }
            if (this.hero.isBoosting) {
                this.hero.continueJumpBoost();
            }
        }
        else {
            this.hero.stopJumpBoost();
        }
    
        this.hero.isCrouching = false;
        this.hero.isSliding = false;
        if (this.keys.down.isDown) {
            this.hero.isLedgeGrabbing = false;
            if (this.hero.touchingDownCount > 0) {
                if (this.hero.body.velocity.x === 0) {
                    this.hero.isCrouching = true;
                }
                else if (this.hero.canSlide && this.hero.slidingFramesCurrent < this.hero.slidingFramesMax) {
                    this.hero.isSliding = true;
                    this.hero.slidingFramesCurrent++;
                }
                else {
                    this.hero.canSlide = false;
                }
            }
        }
        else {
            // ToDo: disable the ability to slide for now.
            // Sliding should happen if the user presses the down key
            // after either just releasing left/right or sliding 
            // (not releasing their left thumb) from L/R to down.
            //this.hero.canSlide = true;
        }
    
        if (!this.hero.isSliding) {
            this.hero.slidingFramesCurrent = 0;
        }
    }
    
    _onHeroCollisionWithFood(hero, food) {
        this.sfx.key.play(); // ToDo: get a "chomp" chewing sound;
        food.kill();
        // ToDo: increment health;
        //   Does each food item have its own health increment value?
    }
    
    _onHeroCollisionWithLand(hero, land) {
        // ToDo: add properties for land to be wall-jumpable or ledge-grabbable!
        // boundary walls (like in a room) could then be made up of tiles that are not
        // ledge-grabbable, and that prevents false-positives of edge-grabbing the middle of 
        // a wall on a certain tile.
        // It could also make this function return quicker.
        let touchingUp = (hero.body.touching.up),
            touchingDown = false,
            touchingLeft = (hero.body.touching.left || hero.body.x == land.x + land.width),
            touchingRight = (hero.body.touching.right || (hero.body.x + hero.body.width == land.x));
    
        if (touchingLeft) {
            hero.touchingLeftCount++;
        }
        else if (touchingRight) {
            hero.touchingRightCount++;
        }
    
        if (hero.body.touching.down === true) {
            if ((hero.body.x + hero.body.width) === land.x) {
                touchingDown = false;
            }
            else if (hero.body.x === (land.x + land.width)) {
                touchingDown = false;
            }
            else {
                hero.touchingDownCount++;
                touchingDown = true;
    
                if (debugLevel === 1) {
                    // ToDo: land is no longer valid in this context.
                    //this.game.debug.body(land);
                }
            }
        }
    
        if (hero.touchingDownCount > 0) {
            touchingDown = true;
        }
        
        let heroCanLedgeGrab = hero.canLedgeGrab === true && land.grab === true;
        
        let heroCanWallJump = 
            (hero.canWallJumpL && hero.scale.x === -1) || 
            (hero.canWallJumpR && hero.scale.x === 1);
        
        // If there's been a mid-air collision with a verticle wall, check if 
        // we should ledge grab or do a wall-pause so we can do a wall jump.
        let midAirCollision = !touchingUp && !touchingDown && (touchingRight || touchingLeft);
        if (midAirCollision) {
            if (abs(hero.body.y - land.y) < hero.ledgeGrabProximity)  {
                if (heroCanLedgeGrab) {
                    // Ledge-Grab:
                    hero.body.velocity.y = 0;
                    hero.isLedgeGrabbing = true;
                    hero.extraJumpsCurrent = 0;
                    hero.touchingDownCount = 0;
                    hero.body.y = land.y;
                }
            }
            else if ((hero.body.y - land.y) > hero.ledgeGrabProximity)  {
                if (land.wallJump && heroCanWallJump) {
                    // Wall-Jump:
                    hero.body.velocity.y = 0;
                    hero.extraJumpsCurrent = 0;
                    hero.touchingDownCount = 0;
    
                    // ToDo: 2018-12-17 also set current wall jump height.
                    if (hero.scale.x === 1) {
                        hero.isWallJumpPauseR = true;
                    }
                    else if (hero.scale.x === -1) {
                        hero.isWallJumpPauseL = true;
                    }
                }
            }
        }
    }
    
    _onHeroVsKey(hero, key) {
        this.sfx.key.play();
        key.kill();
        this.hasKey = true;
        this.keyIcon.frame = 1;
    }
    
    _updateCoinText() {
        let coinTotalsLength = this.coinTotalAvailable / 10;
        this.coinFont.text = 
            padLeft(this.coinPickupCount, coinTotalsLength, '0') + 
            "/" + 
            padLeft(this.coinTotalAvailable, coinTotalsLength, '0');
    }

    _onHeroVsCoin(hero, coin) {
        this.sfx.coin.play();
        coin.kill();
        this.coinPickupCount++;
        this._updateCoinText(this.coinPickupCount, 20);
    }
    
    _onHeroInsideLandscape(hero, landBox) {
    
        // Get the midpoint coordinates:
        var midXBox = landBox.x + (landBox.width / 2);
        var midYBox = landBox.y + (landBox.height / 2);
        var midXPlayer = hero.x + (hero.width / 2);
        var midYPlayer = hero.y + (hero.height / 2);
        var midXVP = hero.x + (landBox.width / 2);
        var midYVP = hero.y + (landBox.height / 2);
    
        // Get the vectors to check against:
        var vXBoxPlayer = (midXPlayer - midXBox);
        var vYBoxPlayer = (midYPlayer - midYBox);
        var vXBoxVP = (midXVP - midXBox);
        var vYBoxVP = (midYVP - midYBox);
    
        // Add the half widths and half heights of the objects
        var hWidths = (hero.width / 2) + (landBox.width / 2);
        var hHeights = (hero.height / 2) + (landBox.height / 2);
    
        // If the x and y vector are less than the half width or half height,
        // they we must be inside the object, causing a collision
        //if (Math.abs(vX) <= hWidths && Math.abs(vY) <= hHeights) {
        if (abs(vXBoxPlayer) <= hWidths && abs(vYBoxPlayer) <= hHeights) {
            var oX = hWidths - abs(vXBoxPlayer),
                oY = hHeights - abs(vYBoxPlayer);
            if (oX > oY && hero.body.velocity.y != 0) {
                if (vYBoxPlayer > 0) {
                    //playerSidesColliding += "t";
                    hero.body.y += oY;
                } else {
                    //playerSidesColliding += "b";
                    hero.body.y -= oY;
                }
            }
            if (oX < oY && hero.body.velocity.x != 0) {
                if (vXBoxPlayer > 0) {
                    //playerSidesColliding += "l";
                    hero.body.x += oX;
                } else {
                    //playerSidesColliding += "r";
                    hero.body.x -= oX;
                }
            }
            if (oX == oY) {
                //parseFloat("123.456").toFixed(2);
                let diffY = ((hero.body.y + hero.body.height) - landBox.y);
                hero.body.y -= diffY + 200;
            }
        }
    }
    
    _onHeroVsDoor(hero, door) {
        nextLevelIncrement = (typeof door.nextLevelIncrement !== 'undefined') ? door.nextLevelIncrement : 1;
    
        // 'open' the door by changing its graphic and playing a sfx
        door.frame = 1;
        this.sfx.door.play();
    
        // play 'enter door' animation and change to the next level when it ends
        hero.freeze();
        this.game.add.tween(hero)
            .to({x: this.door.x, alpha: 0}, 500, null, true)
            .onComplete.addOnce(this._goToNextLevel, this);
    }

    _RestartLevel() {
        nextLevelIncrement = 0;
        
        //this.game.state.start(this.game.state.current);
        
        //this.game.state.start('loading');
        
        this._goToNextLevel();
    }
    
    _goToNextLevel() {
        this.camera.fade('#000000');
        this.camera.onFadeComplete.addOnce(function () {
            // change to next level
            // TRY: get the "+ 1" as a param from the door.
            //   Ex: Secret exits could take you two levels ahead and would be "+ 2".
            this.game.state.restart(true, false, {
                level: this.level + nextLevelIncrement
            });
        }, this);
    }
    
    _setMazeDataFromJson(data) {
        let pathWidth = (data.maze.pathWidth) ? data.maze.pathWidth : 128; // Width of the maze path;
        let width = (data.maze.width) ? data.maze.width : 3; // Game width;
        let height = (data.maze.height) ? data.maze.height : 2; // Game height;
        let boundW = (pathWidth * width * 2) + (pathWidth * 3);
        let boundH = (pathWidth * height * 2) + (pathWidth * 3);
        this.game.world.setBounds(0, 0, boundW, boundH);
        this.wall = pathWidth; // Width of the walls between paths;    
        
        graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0x171c23); // ToDo: this color should come from JSON based on the tileset.

        // 2D array where values correspond to free-space or wall:
        this.mapBounds = MAZE.buildMap(width, height, true);
        
        // Collection of bounding box rectangles, 
        // consolidated off the original 2D array maze:  
        this.boundingBoxes = MAZE.buildBoundingBoxes(this.mapBounds, this.wall);

        this.mapBoundsTiles = this._buildMazeTileGroups(this.boundingBoxes);
        
        this.boundingBoxes.forEach(function (bbox) {
            var landItemBound = this.game.add.sprite(bbox.x, bbox.y);
            landItemBound.width = bbox.w;
            landItemBound.height = bbox.h;
            this.game.physics.enable(landItemBound);
            landItemBound.body.allowGravity = false;
            landItemBound.body.immovable = true;
    
            // ToDo: determine these dynamically:
            landItemBound.grab = false;
            landItemBound.wallJump = true;
            
            //this.game.debug.body(landItemBound);
            //landItemBound.tint = Math.random() * 0xffffff;
            landItemBound.tint = 0x171c23;
            graphics.lineStyle(4, 0x171c23, 1);
            graphics.drawRect(
                bbox.x + this.tileWidth, 
                bbox.y + this.tileWidth, 
                bbox.w - (2*this.tileWidth), 
                bbox.h - 64);
            this.landscapeBounds.add(landItemBound);
        }, this);
    
        //this.itemsFood = this.game.add.group();
        this["itemsFood"] = this.game.add.group();
        // data.itemsFood.forEach(function (food) {
        //     this.itemsFood.add(
        //         this.game.add.image(food.x, food.y, 'food', food.frame)
        //     );
        // }, this);
    
        //#region Door

        let initialDoorX = 0;
        let initialDoorY = 0;
        let mapPosDoorX = 0;
        let mapPosDoorY = 0;
        let nodesWithWallUnderneath = null;
    
        if (
            (data.door.pos && data.door.pos === "fixed") ||
            (data.door.x || data.door.y || data.door.x32 || data.door.y32)
        ) {
            initialDoorX = data.door.x;
            initialDoorY = data.door.y;
        }
        else if (data.door.pos && data.door.pos === "random") {
            nodesWithWallUnderneath = MAZE.getNodesWithWallUnderneath(this.mapBounds);
    
            // The space 1 below (move 0 x spaces, move down 1 y space) needs to be a wall:
            let requireBorderUnderneath = [ { "x": 0, "y": 1, "spaceValue": MAZE.MAP_SPACE_WALL } ];
            let freeSpace = MAZE.getRandomSpaceByValue(this.mapBounds, MAZE.MAP_SPACE_FREE, requireBorderUnderneath);
            mapPosDoorX = freeSpace.columnIndex;
            mapPosDoorY = freeSpace.rowIndex;
            initialDoorX = mapPosDoorX*pathWidth + (pathWidth/2);
            initialDoorY = mapPosDoorY*pathWidth + (pathWidth);
        }
        
        this.mapBounds[mapPosDoorY][mapPosDoorX] = MAZE.MAP_SPACE_DOOR;

        this._spawnDoor(initialDoorX, initialDoorY, data.door);

        //#endregion Door
        
        //#region Key

        let initialKeyX = 0;
        let initialKeyY = 0;
        let mapPosKeyX = 0;
        let mapPosKeyY = 0;
        if (
            (data.key.pos && data.key.pos === "fixed") ||
            (data.key.x || data.key.y || data.key.x32 || data.key.y32)
        ) {
            initialKeyX = data.key.x;
            initialKeyY = data.key.y;
        }
        else if (data.key.pos && data.key.pos === "random") {
            let freeSpace = MAZE.getRandomSpaceByValue(this.mapBounds, MAZE.MAP_SPACE_FREE);
            initialKeyX = freeSpace.columnIndex*pathWidth + (pathWidth/2);
            initialKeyY = freeSpace.rowIndex*pathWidth + (pathWidth/2);
        }
        else if (data.key.pos && data.key.pos === "farthest") {
            let aStarResult = MAZE.getFarthestFreeSpace(
                this.mapBounds, 
                new GridNode(mapPosDoorX, mapPosDoorY, MAZE.MAP_SPACE_FREE)
            );
            // The astar lib off of github swaps the x and y on the nodes;
            // this corrects that by assigning x to the key's y and y to the key's x:
            mapPosKeyX = aStarResult.y;
            mapPosKeyY = aStarResult.x;
            
            initialKeyX = mapPosKeyX*pathWidth + (pathWidth/2);
            initialKeyY = mapPosKeyY*pathWidth + (pathWidth/2);
        }
        
        this.mapBounds[mapPosKeyY][mapPosKeyX] = MAZE.MAP_SPACE_KEY;

        this._spawnKey(initialKeyX, initialKeyY);

        //#endregion Key
        
        //#region Hero

        let initialHeroX = 0;
        let initialHeroY = 0;
        if (
            (data.hero.pos && data.hero.pos === "fixed") ||
            (data.hero.x || data.hero.y || data.hero.x32 || data.hero.y32)
        ) {
            initialHeroX = (data.hero.x32 >= 0 ? data.hero.x32 * this.tileWidth : data.hero.x);
            initialHeroY = (data.hero.y32 >= 0 ? data.hero.y32 * this.tileWidth : data.hero.y);
        }
        else if (data.hero.pos && data.hero.pos === "random") {
            let requireBorderUnderneath = [ { "x": 0, "y": 1, "spaceValue": MAZE.MAP_SPACE_WALL } ];
            let freeSpace = MAZE.getRandomSpaceByValue(this.mapBounds, MAZE.MAP_SPACE_FREE, requireBorderUnderneath);
            initialHeroX = freeSpace.columnIndex*pathWidth + (pathWidth/2);
            initialHeroY = freeSpace.rowIndex*pathWidth + (pathWidth/4);
        }
        else if (data.hero.pos && data.hero.pos === "farthest") {
            if (nodesWithWallUnderneath === null) {
                nodesWithWallUnderneath = MAZE.getNodesWithWallUnderneath(this.mapBounds);
            }
            let heroNode = MAZE.getFarthestFreeSpaceTriangle(
                this.mapBounds,
                new GridNode(mapPosDoorX, mapPosDoorY, MAZE.MAP_SPACE_FREE),
                new GridNode(mapPosKeyX, mapPosKeyY, MAZE.MAP_SPACE_FREE),
                nodesWithWallUnderneath
            );
            initialHeroX = heroNode.y*pathWidth + (pathWidth/2);
            initialHeroY = heroNode.x*pathWidth + (pathWidth/4);
        }
    
        // ToDo ES6: load this from JSON. This should be game-specific data, not hardcoded.
        // animations ('name', [frames], fps, looped?)
        let heroAnimations = [
            new animationData('animationHeroIdle', [0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0, 0], 4, true),
            new animationData('animationHeroCrouch', [4, 4, 4, 4, 4, 5, 6, 7, 4, 4, 4, 4], 4, true),
            new animationData('animationHeroRun', [8, 9, 10, 11, 12, 13], 8, true),
            new animationData('animationHeroRunSword', [96, 97, 98, 99, 100, 101], 8, true),
            new animationData('animationHeroSliding', [24, 25, 26, 27], 8, false), // ToDo: add 28 is initial in-between;
            new animationData('animationHeroLedgeGrab', [29, 30, 31, 30], 2, true),
            new animationData('animationHeroLedgePullup', [33, 34, 35, 36, 37], 8, false),
            new animationData('animationHeroWallJumpPause', [79, 80], 4, true),
            new animationData('animationHeroJump', [14, 15, 16, 17], 12, false),// ToDo: loop last few frames of these 2 and split them so they're the initial action then the loop.
            new animationData('animationHeroJumpExtra', [18, 19, 20, 21], 12, true),
            new animationData('animationHeroFall', [17, 22, 23], 8, false),
            new animationData('animationHeroSwordDraw', [70, 71, 72, 38], 8, false),
            new animationData('animationHeroSwordIdle', [38, 38, 38, 38, 38, 39, 40, 41, 38, 38, 38, 38], 4, true),
            new animationData('animationHeroSwordAttack1', [53,54,55,56,57,58], 8, false),
            new animationData('animationHeroSwordAttack2', [53,54,55,56,57,58], 8, false),
            new animationData('animationHeroDying', [62,63,64,65,66,67,68,68,68], 8, false)
        ];

        let hero2 = new Hero2(this.game, initialHeroX, initialHeroY, 'hero');
        hero2.addAnimations(heroAnimations);
        this.hero = hero2
        this.game.add.existing(this.hero);

        //#endregion Hero
        
        //#region Enemies
        
        let badGuyBuilder = new EnemyFactory(this.game);        
        for (var badGuyEntry in data.enemies) {
            let badGuyData = data.enemies[badGuyEntry];
            let repeatEnemy = (typeof badGuyData.total !== 'undefined' ? badGuyData.total : 1)
            for (var rep = 1; rep <= repeatEnemy; rep++) {
                let enemySpace = this._getEnemyMapPosition(badGuyData);
                this.mapBounds[enemySpace.rowIndex][enemySpace.columnIndex] = MAZE.MAP_SPACE_ENEMY;
                let enemyGameX = enemySpace.columnIndex*pathWidth + (pathWidth/2);
                let enemyGameY = enemySpace.rowIndex*pathWidth + (pathWidth/2) + badGuyData.yOffsetWalk;
                let enemySprite = badGuyBuilder.createEnemySprite(badGuyData, enemyGameX, enemyGameY);
                enemySprite.update = this._EnemyMovementSentry;
                enemySprite.yOffsetWalk = badGuyData.yOffsetWalk;
                enemySprite.yOffsetAttack = badGuyData.yOffsetAttack;
                this.enemies.add(enemySprite);
            }
        };

        //#endregion Enemies
        
        //#region Coins

        if (data.coins) {
            if (typeof data.coins.pos !== 'undefined' && data.coins.pos === "random") {
                this.coinTotalAvailable = (typeof data.coins.count !== 'undefined') ? data.coins.count : 0;
                for (var cc = 0; cc < this.coinTotalAvailable; cc++) {
                    let freeSpace = MAZE.getRandomSpaceByValue(this.mapBounds, MAZE.MAP_SPACE_FREE);
                    if (freeSpace.columnIndex === null) {
                        // There's no more free spaces!
                        break;
                    }
                    mapPosDoorX = freeSpace.columnIndex;
                    mapPosDoorY = freeSpace.rowIndex;
                    this.mapBounds[mapPosDoorY][mapPosDoorX] = MAZE.MAP_SPACE_COIN;
                    let coinGameX = mapPosDoorX*pathWidth + (pathWidth/2);
                    let coinGameY = mapPosDoorY*pathWidth + (pathWidth/2);
                    this._spawnCoin(coinGameX, coinGameY);
                }
            }
        }

        //#endregion Coins
    }

    _EnemyMovementSentry() {
        // check against walls and reverse direction if necessary:
        if (this.body.touching.right || this.body.blocked.right) {
            this.scale.x *= -1;
            this.body.velocity.x = -1 * this.body.speed; // turn left
        }
        else if (this.body.touching.left || this.body.blocked.left) {
            this.scale.x *= -1;
            this.body.velocity.x = this.body.speed; // turn right
        }
    };
    
    _getEnemyMapPosition(badGuyJson) {
        let enemySpace = null;
        if (badGuyJson.pos === "random") {
            let requireBorderUnderneath = [ 
                { "x": 0, "y": 0, "spaceValue": MAZE.MAP_SPACE_FREE },
                { "x": 1, "y": 0, "spaceValue": MAZE.MAP_SPACE_FREE },
                { "x": 2, "y": 0, "spaceValue": MAZE.MAP_SPACE_FREE },
                { "x": 0, "y": 1, "spaceValue": MAZE.MAP_SPACE_WALL },
                { "x": 1, "y": 1, "spaceValue": MAZE.MAP_SPACE_WALL },
                { "x": 2, "y": 1, "spaceValue": MAZE.MAP_SPACE_WALL } 
            ];
            enemySpace = MAZE.getRandomSpaceByValue(
                this.mapBounds, MAZE.MAP_SPACE_FREE, requireBorderUnderneath);
        }
        return enemySpace;
    }

    _buildMazeTileGroups(boundingBoxes) {
        let mazeTileGroups = [];
        boundingBoxes.forEach(function (bbox) {
            let bboxGroup = this.game.add.group();
            for (var bX = 0; bX < bbox.w; bX += this.tileWidth) {
                for (var bY = 0; bY < bbox.h; bY += this.tileWidth) {
                    let tileFrame = this.getMazeTileFrame( 
                        bX, bY, bbox);
                    if (tileFrame !== null) {
                        let gameX = bbox.x + bX;
                        let gameY = bbox.y + bY;
                        if (tileFrame === FRAME_TOP_LEFT) {
                            this._spawnEnemyWall(gameX, gameY, 'left')
                        }
                        else if (tileFrame === FRAME_TOP_RIGHT) {
                            this._spawnEnemyWall(gameX + this.tileWidth, gameY, 'right')
                        }
                        bboxGroup.add(this.game.add.image(
                            gameX, gameY, 'landscape', tileFrame)
                        );
                    }
                }   
            }

            // Default to killed. We will revive when needed.
            bboxGroup.callAll('kill');

            mazeTileGroups[bbox.id] = bboxGroup;
        }, this);
        return mazeTileGroups;
    }

    getMazeTileFrame(bX, bY, bbox) {
        let tileFrame = null;
        
        // ToDo: how do i not hardcode these frame indexes?
        // 012 345      0   1   2
        // 678 9AB      6   7   8
        // CDE FGH      12  13  14
        
        if (bX === 0) {
            // Left column:

            if (bY === 0) {
                // Top row:
                tileFrame = FRAME_TOP_LEFT;
            }
            else if (bY === bbox.h - this.tileWidth) {
                // Bottom row:
                tileFrame = 12;
            }
            else {
                // Middle rows:
                tileFrame = 6;
            }
        }
        else if (bX === bbox.w - this.tileWidth) {
            // Right column:

            if (bY === 0) {
                // Top row:
                tileFrame = FRAME_TOP_RIGHT;
            }
            else if (bY === bbox.h - this.tileWidth) {
                // Bottom row:
                tileFrame = 14;
            }
            else {
                // Middle rows:
                tileFrame = 8;
            }
        }
        else {
            // Middle columns:

            if (bY === 0) {
                // Top row:
                tileFrame = 1;
            }
            else if (bY === bbox.h - this.tileWidth) {
                // Bottom row:
                tileFrame = 13;
            }
            else {
                // ToDo: only draw middle tiles if we're on desktop.
                //tileFrame = 7;
            }
        }
        return tileFrame;
    }

    getWallTileFrame(iMapCol, iMapRow, iTileIndexX, iTileIndexY) {
        // ToDo: default to center on desktop and null on mobile.
        // This will reduce sprites on mobile and improve render speed.
        let result = null;

        let rowTop = false;
        let rowMiddle = false;
        let rowBottom = false;

        let colLeft = false;
        let colMiddle = false;
        let colRight = false;

        //#region determine row position

        if (iTileIndexY === 0) {
            if (typeof this.mapBounds[iMapRow - 1] === 'undefined' || 
                this.mapBounds[iMapRow - 1][iMapCol] === MAZE.MAP_SPACE_FREE) {
                rowTop = true;
            }
            else {
                //rowTop = true;
            }
        }
        else if (iTileIndexY === (this.wall-this.tileWidth) / this.tileWidth) {
            if (typeof this.mapBounds[iMapRow + 1] === 'undefined' || 
                this.mapBounds[iMapRow + 1][iMapCol] === MAZE.MAP_SPACE_FREE) {
                rowBottom = true;
            }
            else {
                //rowBottom = true;
            }
        }
        else {
            rowMiddle = true;
        }
        
        //#endregion determine row position

        //#region determine column position

        if (iTileIndexX === 0) {
            if (typeof this.mapBounds[iMapRow][iMapCol - 1] === 'undefined' || 
                this.mapBounds[iMapRow][iMapCol - 1] === MAZE.MAP_SPACE_FREE) {
                colLeft = true;
            }
            else {
                //colLeft = true;
            }
        }
        else if (iTileIndexX === (this.wall-this.tileWidth) / this.tileWidth) {
            if (typeof this.mapBounds[iMapRow][iMapCol + 1] === 'undefined' || 
                this.mapBounds[iMapRow][iMapCol + 1] === MAZE.MAP_SPACE_FREE) {
                colRight = true;
            }
            else {
                //colRight = true;
            }
        }
        else {
            colMiddle = true;
        }

        //#endregion determine column position

        //#region assign frame index

        // ToDo: how do i not hardcode these frame indexes?
        // 012 345
        // 678 9AB
        // CDE FGH
        
        if (rowTop) {
            if (colLeft) {
                result = 0;
            }
            else if (colRight) {
                result = 2;
            }
            else {
                result = 1;
            }
        }
        else if (rowBottom) {
            if (colLeft) {
                result = 12;
            }
            else if (colRight) {
                result = 14;
            }
            else {
                result = 13;
            }
        } 
        else{
            if (colLeft) {
                result = 6;
            }
            else if (colRight) {
                result = 8;
            }
            else {
                //result = 7;
            }
        }

        //#endregion assign frame index

        return result;
    }

    _renderTiles(allBoxes, groupsToRender) {
        let totalTilesDrawn = 0;

        allBoxes.forEach(function (b) {
            if (b.wasInView === true) {
                // last update it was in view...
                if (this._squareIsInView(b.x, b.y, b.w, b.h)) {
                    // ...and it's still in view, so do nothing.
                }
                else {
                    // ...but now it's not, so kill the group:
                    groupsToRender[b.id].callAll('kill');
                    b.wasInView = false;
                }
            }
            else if (b.wasInView === false) {
                // last update it was not in view...
                if (this._squareIsInView(b.x, b.y, b.w, b.h)) {
                    // ...but now it is, so revive the group:
                    b.wasInView = true;
                    groupsToRender[b.id].callAll('revive');
                }
                else {
                    // ...and it's still not, so do nothing.
                }
            }
        }, this);
        
        if (debugLevel === 1) {
            debugText1 = 
                "Itration tiles drawn: " + totalTilesDrawn + ";" + "\r\n" + 
                //"Total tiles drawn: " + this.mapBoundsTiles.length + ";" + "\r\n" + 
                "Camera [x, y] : [" + this.game.camera.x + ", "+ this.game.camera.y + "]" + "\r\n" + 
                "Camera Dimensions: [" + this.game.camera.width + ", "+ this.game.camera.height + "]";
        }
    }

    _addTilesToGame(tileGroup) {
        if (typeof tileGroup === 'undefined' || 
            tileGroup === null || 
            tileGroup.length === 0
            ) {
            return;
        }
        tileGroup.callAll('kill');
        tileGroup.destroy(true, true);

        // iterate over the map bounds and draw the tiles in each cell:
        for (var iMapCol = 0; iMapCol < this.mapBounds[0].length; iMapCol++) {
            for (var iMapRow = 0; iMapRow < this.mapBounds.length; iMapRow++) {
                if (this.mapBounds[iMapRow][iMapCol] === MAZE.MAP_SPACE_WALL &&
                    this._boxIsInView(iMapCol, iMapRow)) {
                    totalTilesDrawn += this.addWallTiles(iMapCol, iMapRow);
                }
            }
        }
    }

    addWallTiles(iMapCol, iMapRow) {
        let totalTiles = 0;
        // iterate over however large the cell is and draw all the tiles:
        for (var iTileIndexX = 0; iTileIndexX < (this.wall / this.tileWidth); iTileIndexX++) {
            for (var iTileIndexY = 0; iTileIndexY < (this.wall / this.tileWidth); iTileIndexY++) {
                let tileFrame = this.getWallTileFrame( 
                    iMapCol, iMapRow, iTileIndexX, iTileIndexY);
                if (tileFrame !== null) {
                    totalTiles++;
                    this.mapBoundsTiles.add(
                        this.game.add.image(
                            (iMapCol * this.wall) + iTileIndexX * this.tileWidth, 
                            (iMapRow * this.wall) + iTileIndexY * this.tileWidth, 
                            'landscape', 
                            tileFrame
                        )
                    );
                }
            }
        }
        return totalTiles;
    }

    _squareIsInView(x, y, w, h) {
        return this._intersectRect(
            x, y, w, h,
            this.game.camera.x,
            this.game.camera.y,
            this.game.camera.width,
            this.game.camera.height
        );
    }

    _intersectRect(
        x1, y1, w1, h1, 
        x2, y2, w2, h2) {
        return !(
             x1       > (x2 + w2) || 
            (x1 + w1) <  x2 || 
             y1       > (y2 + h2) ||
            (y1 + h1) <  y2
        );
      }
    
    _setLevelDataFromJson(data) {
        let boundW = (data.world.w < this.game.width) ? this.game.width : data.world.w;
        let boundH = (data.world.h < this.game.height) ? this.game.height : data.world.h;
        this.game.world.setBounds(0, 0, boundW, boundH);
    
        // spawn level landscape:
        data.landscape.forEach(function (land) {
            var rXTotal = (land.repeatX || 0);
            var rYTotal = (land.repeatY || 0);
            var landX = (land.x32>=0) ? land.x32*this.tileWidth : land.x;
            var landY = (land.y32>=0) ? land.y32*this.tileWidth : land.y;
            var landWidth = (land.w32>=0) ? land.w32*this.tileWidth : this.tileWidth;
            var landHeight = (land.h32>=0) ? land.h32*this.tileWidth : this.tileWidth;
    
            var landItemBound = this.game.add.sprite(landX, landY);
            landItemBound.width = landWidth + this.tileWidth*rXTotal;
            landItemBound.height = landHeight + this.tileWidth*rYTotal;
            this.game.physics.enable(landItemBound);
            landItemBound.body.allowGravity = false;
            landItemBound.body.immovable = true;
    
            // custom properties:
            landItemBound.grab = (land.grab) ? true : false;
            landItemBound.wallJump = (land.wallJump) ? true : false;
    
            // custom collisions:
            landItemBound.body.checkCollision.up = land.cU;
            landItemBound.body.checkCollision.down = land.cD;
            landItemBound.body.checkCollision.left = land.cL;
            landItemBound.body.checkCollision.right = land.cR;
    
            this.landscapeBounds.add(landItemBound);
    
            for (var rX = 0; rX <= rXTotal; rX++) {
                for (var rY = 0; rY <= rYTotal; rY++) {
                    let landFrame = 
                        (land.framesX) ? land.framesX[rX] : 
                        (land.framesY) ? land.framesY[rY] :
                        land.frame;
                    this.landscape.add(
                        this.game.add.image(landX + (rX*landWidth), landY + (rY*landHeight), 'landscape', landFrame)
                    );
                }
            }
    
        }, this);
    
        this._spawnKey(data.key.x, data.key.y);
        this._spawnDoor(data.door.x, data.door.y);
        
        // spawn important objects
        if (data.coins) {
            //data.coins.forEach(this._spawnCoin, this);
            data.coins.forEach(function (c) {
                this._spawnCoin(c.x, c.y);
            }, this);
        }

        // spawn hero
        let initialHeroX = (data.hero.x32 >= 0 ? data.hero.x32 * this.tileWidth : data.hero.x);
        let initialHeroY = (data.hero.y32 >= 0 ? data.hero.y32 * this.tileWidth : data.hero.y);
        this.hero = new Hero2(this.game, initialHeroX, initialHeroY);
        this.game.add.existing(this.hero);
    }
    
    _loadLevel(data) {
        addBackgroundToGame(this.game, 'background');
    
        // Create all the groups/layers that we need (in order, for layering):    
        this.platforms = this.game.add.group();
        this.coins = this.game.add.group();
        this.landscape = this.game.add.group();
        this.landscapeBounds = this.game.add.group();
        
        this.enemies = this.game.add.group();
        this.enemyWalls = this.game.add.group();
        //this.enemyWalls.visible = false;
    
        this.bgDecoration = this.game.add.group();
    
        // enable gravity, from either input JSON or constant:
        this.game.physics.arcade.gravity.y = (data.gravity !== 'undefined') ? data.gravity : 1200;

        graphicsDebug = this.game.add.graphics(0, 0);
        graphicsDebug.beginFill(0xFF00FF);
        graphicsDebug.lineStyle(4, 0xFF00FF, 1);
        
        //graphicsDebugEnemy = this.game.add.graphics(0, 0);
        //graphicsDebugEnemy.beginFill(0xFF00FF);
        //graphicsDebugEnemy.lineStyle(4, 0xFF00FF, 1);
        
        if (data.maze) {
            this._setMazeDataFromJson(data);
        }
        else {
            // spawn platforms
            data.platforms.forEach(this._spawnPlatform, this);
    
            // spawn level decoration
            data.decoration.forEach(function (deco) {
                this.bgDecoration.add(
                    this.game.add.image(deco.x, deco.y, 'decoration', deco.frame)
                );
            }, this);
    
            this._setLevelDataFromJson(data);
        }
    
        this.game.camera.follow(this.hero);
    }
    
    _spawnPlatform(platform) {
        let sprite = this.platforms.create(
            platform.x, platform.y, platform.image);
    
        // physics for platform sprites
        this.game.physics.enable(sprite);
        sprite.body.allowGravity = false;
        
        // TRY: Remove this for some select platforms in the future, 
        // where they sink when you stand on them.
        sprite.body.immovable = true;
    
        // spawn invisible walls at each side, only detectable by enemies
        this._spawnEnemyWall(platform.x, platform.y, 'left');
        this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
    }
    
    _spawnEnemyWall(x, y, side) {
        let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
        sprite.alpha = 0;
        // anchor and y displacement:
        sprite.anchor.set(side === 'left' ? 1 : 0, 1);

        // physics properties:
        this.game.physics.enable(sprite);
        sprite.body.immovable = true;
        sprite.body.allowGravity = false;
    }

    _spawnCoin(coinX, coinY) {
        let sprite = this.coins.create(coinX, coinY, 'coin');
        sprite.anchor.set(0.5, 0.5);
    
        // physics (so we can detect overlap with the hero)
        this.game.physics.enable(sprite);
        sprite.body.allowGravity = false;
    
        // animations
        sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
        sprite.animations.play('rotate');
    }
    
    _spawnKey(x, y) {
        this.key = this.bgDecoration.create(x, y, 'key');
        this.key.anchor.set(0.5, 0.5);
        // enable physics to detect collisions, so the hero can pick the key up
        this.game.physics.enable(this.key);
        this.key.body.allowGravity = false;
    
        // add a small 'up & down' animation via a tween
        this.key.y -= 3;
        this.game.add.tween(this.key)
            .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .loop()
            .start();
    }
    
    _spawnDoor(x, y, doorData) {
        this.door = this.bgDecoration.create(x, y, 'door');
        this.door.anchor.setTo(0.5, 1);
        this.game.physics.enable(this.door);
        this.door.body.allowGravity = false;
        if (typeof doorData !== 'undefined') {
            if (typeof doorData.nextLevelIncrement !== 'undefined') {
                this.door.nextLevelIncrement = doorData.nextLevelIncrement;
            }
        }
    }

    _createHud() {
        let hud = this.game.add.group();
        const controlsX = 10;
        let buttonUpX = controlsX + controlWidthLR - controlWidthLR/2 + controlsPad;
        let buttonUpY = this.game.height - screenPad - controlHeightUD*2 - controlsPad;

        const ALPHANUMERIC = 
            ' !"#$%&\'()*+,-.' + '/0123456789:;<=' + 
            '>?@ABCDEFGHIJKL' + 'MNOPQRSTUVWXYZ[' + 
            '\\]^_ abcdefghij' + 'klmnopqrstuvwxy' + 
            'Z{|}~ cueaaaace' + 'eeiiiaaeaaoooou';
        let player1Font = this.game.add.retroFont('fonts:x05mo', 20, 20, ALPHANUMERIC, 15);
        
        //#region Upper Left

        let iconRowHeight = 48;
        let initialHeight = 15;

        let faceHeight = (0 * iconRowHeight) + initialHeight;
        let faceIcon = this.game.make.image(3, faceHeight, 'icon:player1');
        faceIcon.anchor.set(0, 0.5);
        faceIcon.frame = 3;

        let player1NameImg = this.game.make.image(faceIcon.width + 10, faceHeight + 2, player1Font);
        player1NameImg.anchor.set(0, 0.5);
        player1Font.text = "PLAYER 1";

        this.coinFont = this.game.add.retroFont('fonts:x05mo', 20, 20, ALPHANUMERIC, 15);
        this._updateCoinText();

        let coinHeight = faceIcon.height + 25;
        let coinIcon = this.game.make.image(10, coinHeight, 'icon:coin');
        coinIcon.anchor.set(0, 0.5);
        coinIcon.scale.setTo(0.6, 0.6);
        let coinScoreImg = this.game.make.image(coinIcon.width + 20, coinHeight, this.coinFont);
        coinScoreImg.anchor.set(0, 0.5);

        let keyHeight = coinHeight + 41;
        this.keyIcon = this.game.make.image(2, keyHeight, 'icon:key');
        this.keyIcon.anchor.set(0, 0.5);

        //#endregion Upper Left

        if (this.isMobile === true) {
            //#region Bottom Left

            buttonUp = this.game.add.sprite(
                buttonUpX + directionButtonsSpacingX,
                buttonUpY + 1
                //, 'controlsUp'
            );

            buttonDown = this.game.add.sprite(
                buttonUpX + 1 + directionButtonsSpacingX,
                buttonUpY + controlHeightUD + 2
                //,'controlsDown'
            );
            buttonDown.scale.setTo(1.5, 1.5);
            buttonDown.events.onInputDown.add(this.touchButtonDownPress, this);
            buttonDown.events.onInputUp.add(this.touchButtonDownRelease, this);

            buttonLeft = this.game.add.sprite(
                controlsX,
                this.game.height - (60 + 60 * buttonScale),
                'controlsLeft'
            );
            buttonLeft.scale.setTo(buttonScale, buttonScale);
            buttonLeft.events.onInputDown.add(this.touchButtonLeftPress, this);
            buttonLeft.events.onInputOver.add(this.touchButtonLeftPress, this);
            buttonLeft.events.onInputUp.add(this.touchButtonLeftRelease, this);
            buttonLeft.events.onInputOut.add(this.touchButtonLeftRelease, this);

            buttonRight = this.game.add.sprite(
                buttonLeft.x + buttonLeft.width + 2 * buttonScale,//buttonLeft.x + controlWidthLR - 1 + 2*directionButtonsSpacingX, // -3 or -1
                buttonLeft.y,
                'controlsRight'
            );
            buttonRight.scale.setTo(buttonScale, buttonScale);
            buttonRight.events.onInputDown.add(this.touchButtonRightPress, this);
            buttonRight.events.onInputOver.add(this.touchButtonRightPress, this);
            buttonRight.events.onInputUp.add(this.touchButtonRightRelease, this);
            buttonRight.events.onInputOut.add(this.touchButtonRightRelease, this);

            //#endregion Bottom Left

            //#region Bottom Right

            touchButtonA = this.game.add.sprite(
                this.game.width - (60 + 60 * buttonScale), // x + 2y = 180; x + 1y = 120;     x + 2y = x + 1y + 60
                this.game.height - (60 + 60 * buttonScale),
                'touchButtonA'
            );
            touchButtonA.scale.setTo(buttonScale, buttonScale);
            touchButtonA.events.onInputDown.add(this.touchButtonAPress, this);
            touchButtonA.events.onInputOver.add(this.touchButtonAPress, this);
            touchButtonA.events.onInputUp.add(this.touchButtonARelease, this);
            touchButtonA.events.onInputOut.add(this.touchButtonARelease, this);

            touchButtonB = this.game.add.sprite(
                touchButtonA.x - touchButtonA.width - 2 * buttonScale,//this.game.width - (60 + 60 * buttonScale), // x + 2y = 180; x + 1y = 120;     x + 2y = x + 1y + 60
                touchButtonA.y,//this.game.height - (60 + 60 * buttonScale),
                'touchButtonB'
            );
            touchButtonB.scale.setTo(buttonScale, buttonScale);
            touchButtonB.events.onInputDown.add(this.touchButtonBPress, this);
            touchButtonB.events.onInputOver.add(this.touchButtonBPress, this);
            touchButtonB.events.onInputUp.add(this.touchButtonBRelease, this);
            touchButtonB.events.onInputOut.add(this.touchButtonBRelease, this);

            //#endregion Bottom Right

            //#region Top Right

            // let touchButtonFullScreen = this.game.add.sprite(
            //     this.game.width - 170,
            //     10,
            //     'controlsFullScreen'
            // );
            // touchButtonFullScreen.events.onInputUp.add(this.touchButtonFullScreenPress, this);
            //touchButtonFullScreen.events.onInputOver.add(this.touchButtonFullScreenPress, this);

            let touchButtonSettings = this.game.add.sprite(
                this.game.width - 70,
                10,
                'controlsSettings'
            );
            touchButtonSettings.events.onInputDown.add(this.touchButtonSettingsPress, this);

            //#endregion Top Right

            let controlButtons = [
                touchButtonA,
                touchButtonB,
                //touchButtonFullScreen,
                touchButtonSettings,
                buttonUp,
                buttonDown,
                buttonLeft,
                buttonRight
            ];
            controlButtons.forEach(function (controlButton) {
                controlButton.inputEnabled = true;
                controlButton.alpha = controlsAlpha;
                hud.add(controlButton);
            });
        }

        //#region Debugging

        debugLabel1 = this.game.add.text(this.tileWidth*6, this.tileWidth*0.2, debugText1, 
            { font: "18px Courier New", fill: "#FFFFFF", align: "center" });
        debugLabel2 = this.game.add.text(this.tileWidth*6, this.tileWidth*0.8, debugTextKeyD, 
            { font: "18px Courier New", fill: "#FFFFFF", align: "center" });
        debugLabelFps = this.game.add.text(this.tileWidth*1, this.tileWidth*1.5, debugTextFps, 
            { font: "18px Courier New", fill: "#FFFFFF", align: "center" });
    
        hud.add(debugLabel1);
        hud.add(debugLabel2);
        hud.add(debugLabelFps);
    
        //#endregion Debugging

        hud.add(faceIcon);
        hud.add(player1NameImg);
        hud.add(coinIcon);
        hud.add(coinScoreImg);
        hud.add(this.keyIcon);
    
        hud.fixedToCamera = true;
        hud.cameraOffset.setTo(8, 8);
        this.hud = hud;
    }
}
