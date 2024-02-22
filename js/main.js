// #region Imports & Classes

class animationData {
    constructor(name, frames, fps, looped) {
        this.name = name;
        this.frames = frames;
        this.fps = fps;
        this.looped = looped;
    }
}

// #endregion Imports & Classes

// #region Globals & Constants

let isMobileiOs = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
let isMobile = isMobileiOs;

var gameWidth = (isMobileiOs) ? screen.width*2 : window.innerWidth - 40; // window.visualViewport.width or window.innerWidth?
var gameHeight = (isMobileiOs) ? screen.height*2 : window.innerHeight - 40;
if (Math.abs(window.orientation) == 90) {
    let tempDim = gameWidth;
    gameWidth = gameHeight;
    gameHeight = tempDim;
}

let debugLabel1;
let debugText1 = "";

let debugLabel2;
let debugTextKeyD = "";//"Keys: Up=n; Down=n; Left=n; Right=n; D=n; Debug=" + (debugLevel>0 ? "y" : "n") + ";";

let debugLabelFps;
let debugTextFps;

// By default, we go to the next level.
var nextLevelIncrement = 1;

var abs=Math.abs;

function addBackgroundToGame(currentGame, backgroundImageName) {
    let img = currentGame.cache.getImage(backgroundImageName);
    let bg = currentGame.add.image(
        currentGame.world.centerX - img.width/2,
        currentGame.world.centerY - img.height/2,//(currentGame.world.height/-2) + backgroundImageName.height*2, 
        backgroundImageName
    );
    bg.fixedToCamera = true;
}

function padLeft(number, width, padInput) {
    let padChar = (padInput === null) ? ' ' : padInput;
    width -= number.toString().length;
    return (width > 0) ? 
        new Array(width + (/\./.test(number) ? 2 : 1)).join(padChar) + number : 
        number + ""; // always return a string
}

// #endregion Globals & Constants

// #region Loading State

let LoadingState = {};

LoadingState.init = function () {
    // keep crispy-looking pixels
    this.game.renderer.renderSession.roundPixels = true;
};

// Game State 2: Preload (load game assets here):
LoadingState.preload = function () {
  
    // Controls:
    this.game.load.image('controlsUp', 'images/controls/flatDark/flatDark02.png');
    this.game.load.image('controlsDown', 'images/controls/flatDark/flatDark09.png');
    this.game.load.image('controlsLeft', 'images/controls/flatDark/flatDark23.png');
    this.game.load.image('controlsRight', 'images/controls/flatDark/flatDark24.png');
    this.game.load.image('controlsPadCircle', 'images/controls/flatDark/flatDark06.png');
    this.game.load.image('controlsDPad', 'images/controls/flatDark/flatDark03.png');
    this.game.load.image('touchButtonA', 'images/controls/flatDark/flatDark35.png');
    this.game.load.image('touchButtonB', 'images/controls/flatDark/flatDark36.png');
    this.game.load.image('controlsFullScreen', 'images/controls/flatDark/flatDark29.png');
    this.game.load.image('controlsFullScreenExit', 'images/controls/flatDark/flatDark34.png');
    this.game.load.image('controlsSettings', 'images/controls/flatDark/flatDark13.png');
  
    // Level data:
    //this.game.load.json('level:0', 'data/level00.json');
    //this.game.load.json('level:1', 'data/level01.json');
    //this.game.load.json('level:2', 'data/level02.json');
    //this.game.load.json('level:3', 'data/maze002.json');

};

LoadingState.create = function () {
    this.game.state.start('play', true, false, {level: 3});
};

// #endregion Loading State

window.onload = function () {
    let game = new Phaser.Game(
        window.innerWidth - 40, 
        window.innerHeight - 40, 
        Phaser.AUTO, 
        'game'
    );
    let _playState = new PlayState(this.game, isMobile);
    game.state.add('play', _playState);
    game.state.add('loading', LoadingState);
    game.state.start('loading');
};
