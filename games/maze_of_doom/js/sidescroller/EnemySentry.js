
class EnemySentry extends Phaser.Sprite {
    constructor(game, x, y, spriteSheet, sheetFrame) {
        super(game, x, y, spriteSheet, sheetFrame);
        this.anchor.set(0.5, 0.5);
        this.isAttacking = false;
    }

    addAnimations(badGuyJson) {
        // ToDo: register this from playstate from JSON, not hardcoded.
        this.animations.add('idle', [0], 1, false); // 6fps, looped
        this.animations.add('attack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 8, false);
        this.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 8, true); // 6fps, looped
    }

    playAnimation(animationName) {
        this.animations.play(animationName);
    }

    handleAI(somePlayer) {
        let heroX = somePlayer.x;
        let heroY = somePlayer.y;
        let enemyViewX = this.x + this.aiViewX;
        let enemyViewY = this.y + this.aiViewY;

        // ToDo: need to handle the player jumping over the enemy
        // and the enemy turning to follow them in the new direction.
        // Without this, the enemy seemingly forgets the hero after
        // the hero runs past them...

        if (!this.isAttacking) {
            let currentDistance = Math.sqrt(
                ( heroX -= enemyViewX ) * heroX + 
                ( heroY -= enemyViewY ) * heroY 
            );
            if (currentDistance <= this.attackRange) {
                this.attackPlayer(somePlayer);
            }
        }
    }

    walk() {
        if (this.walking) {
            return;
        }
        this.isAttacking = false;
        this.walking = true;

        this.body.velocity.x = this.previousVelocityX;
        this.loadTexture(this.spriteSheetWalk, 0);
        
        let previousScaleX = this.scale.x;
        this.scale.setTo(this.spriteScale, this.spriteScale);
        this.scale.x *= (previousScaleX > 0) ? 1 : -1;
        
        this.animations.play('walk');
    }

    attackPlayer(somePlayer) {
        if (this.isAttacking) {
            return;
        }
        let previousScaleX = this.scale.x;

        this.walking = false;
        this.isAttacking = true;
        this.causedDamageThisCycle = false;

        this.previousVelocityX = this.body.velocity.x;
        this.body.velocity.x = 0;

        this.loadTexture(this.spriteSheetAttack, 0);
        this.animations.play('attack');

        this.scale.setTo(this.spriteScale * this.spriteScale, this.spriteScale * this.spriteScale);
        this.scale.x *= (previousScaleX > 0) ? 1 : -1;

        this.animations.currentAnim.onComplete.add(
            function () {
                this.causedDamageThisCycle = false;
                this[this.initialAnimation]();
            }, this
        );
    }
}