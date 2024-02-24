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

var debugLabel1;
var debugText1 = "";

var debugLabel2;
var debugTextKeyD = "";//"Keys: Up=n; Down=n; Left=n; Right=n; D=n; Debug=" + (debugLevel>0 ? "y" : "n") + ";";

var debugLabelFps;
var debugTextFps;

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

    // Level data:
    // ToDo: pass in game path like "/games/chip_boy_ultra_boy/"
    this.game.load.json('level:0', '/games/chip_boy_ultra_boy/data/level00.json');
    //this.game.load.json('level:1', '/games/chip_boy_ultra_boy/data/level01.json');
    //this.game.load.json('level:2', '/games/chip_boy_ultra_boy/data/level02.json');
    //this.game.load.json('level:3', '/games/chip_boy_ultra_boy/data/maze002.json');
  
    // Controls:
    this.game.load.image('controlsUp', '/img/controls/flatDark/flatDark02.png');
    this.game.load.image('controlsDown', '/img/controls/flatDark/flatDark09.png');
    this.game.load.image('controlsLeft', '/img/controls/flatDark/flatDark23.png');
    this.game.load.image('controlsRight', '/img/controls/flatDark/flatDark24.png');
    this.game.load.image('controlsPadCircle', '/img/controls/flatDark/flatDark06.png');
    this.game.load.image('controlsDPad', '/img/controls/flatDark/flatDark03.png');
    this.game.load.image('touchButtonA', '/img/controls/flatDark/flatDark35.png');
    this.game.load.image('touchButtonB', '/img/controls/flatDark/flatDark36.png');
    this.game.load.image('controlsFullScreen', '/img/controls/flatDark/flatDark29.png');
    this.game.load.image('controlsFullScreenExit', '/img/controls/flatDark/flatDark34.png');
    this.game.load.image('controlsSettings', '/img/controls/flatDark/flatDark13.png');
};

LoadingState.create = function () {
    //let jsonData = this.game.cache.getJSON(`level:${this.level}`);
    let jsonData = this.game.cache.getJSON(`level:0`); // ToDo: get the level number from query string;
    this.game.state.start('play', true, false, jsonData);
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
