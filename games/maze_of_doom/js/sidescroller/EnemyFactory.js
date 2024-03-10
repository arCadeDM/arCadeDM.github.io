class EnemyFactory {
    constructor(game) {
        this.game = game;
    }
    createEnemySprite(badGuyJson, x, y) {
        let enemySprite = {};
        switch (badGuyJson.enemyType.toString().toUpperCase())
        {
            case "SENTRY":
                enemySprite = new EnemySentry(this.game, x, y, badGuyJson.initialSpritesheet);
                this.game.physics.enable(enemySprite);
                enemySprite.body.collideWorldBounds = true;
                enemySprite.body.allowGravity = false;
                enemySprite.attackRange = badGuyJson.attackRange;
                enemySprite.spriteSheetWalk = badGuyJson.spriteSheetWalk;
                enemySprite.spriteSheetAttack = badGuyJson.spriteSheetAttack;
                enemySprite.initialAnimation = badGuyJson.initialAnimation;
                break;
        }

        // AI:
        enemySprite.causedDamageThisCycle = false;
        enemySprite.aiViewX = this._isDefined(badGuyJson.aiViewX) ? badGuyJson.aiViewX : 0;
        enemySprite.aiViewY = this._isDefined(badGuyJson.aiViewY) ? badGuyJson.aiViewY : 0;
        enemySprite.damageBounds = this._isDefined(badGuyJson.damageBounds) ? badGuyJson.damageBounds : null;

        // Animations:
        enemySprite.addAnimations(badGuyJson);
        enemySprite.spriteScale = badGuyJson.scale;
        enemySprite.scale.setTo(enemySprite.spriteScale, enemySprite.spriteScale);
        enemySprite.playAnimation(badGuyJson.initialAnimation);

        // Velocity:
        enemySprite.body.velocity.x = badGuyJson.velocityX;
        enemySprite.body.y += badGuyJson.offsetY;
        enemySprite.velocityX = badGuyJson.velocityX;

        return enemySprite;
    }

    _isDefined(someJsonField) {
        return (typeof someJsonField !== 'undefined');
    }
}
