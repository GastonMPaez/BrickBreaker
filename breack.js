//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

//player
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 20;

let player = {
    x : boardWidth/2 - playerWidth/2,
    y : boardHeight - playerHeight - 5,
    width : playerWidth,
    height : playerHeight,
    velocityX : playerVelocityX,
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3; //add more rows as game go
let blockMaxRows = 10; //limit rows
let blockCount = 0; // how many blocks remain

//starting block corner top left
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

const bounceSound = new Audio("sfx/bounce_sound.mp3")
const pointSound = new Audio("sfx/point_sound.mp3");
const NewLayerSound = new Audio("sfx/next_layer.mp3");
const gameOverSound = new Audio("sfx/game_over.mp3");


window.onload = function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //draw player
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);
    
    requestAnimationFrame(update);    
    document.addEventListener("keydown", movePlayer);

    //create blocks
    createBlocks();
}

function update(){
    requestAnimationFrame(update);    
    if (gameOver){
        return;
    }
    context.clearRect(0, 0, board.width, board.height);
     
    //player
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    //ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //bounce ball with wall
    if(ball.y <= 0) {
        //ball touches top of canvas
        ball.velocityY *= -1;
        bounceSound.play();
    }
    else if (ball.x <= 0 || (ball.x + ball.width) >= boardWidth) {
        //ball touches left or right of canvas
        ball.velocityX *= -1;
        bounceSound.play();
    }
    else if (ball.y + ball.height >= boardHeight) {
        //ball touch botom (game over)
        context.font = "20px sans-serif"
        context.fillText("GAME OVER: press 'SPACE' to restart", 80, 400);
        gameOver = true;
        gameOverSound.play();
    }

    //ball bounce of player
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;
        bounceSound.play();
    }
    else if (leftCollision(ball, player) || rigthCollision(ball, player)) {
        ball.velocityX *= -1;
        bounceSound.play();
    }

    //blocks
    context.fillStyle = "rgb(14, 11, 196)";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if(!block.break){
            if ( topCollision(ball, block) || bottomCollision(ball, block) ){
                block.break = true;
                ball.velocityY *= -1;
                blockCount -= 1;
                score += 100;
                pointSound.play();
            }
            else if ( leftCollision(ball, block) || rigthCollision(ball, block) ) {
                block.break = true;
                ball.velocityX *= -1;
                blockCount -= 1;
                score += 100;
                pointSound.play();
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //next level
    if (blockCount == 0) {
        score += 100 * blockRows * blockColumns; // bonus points
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
        NewLayerSound.play();
    }

    //score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition){
    return (xPosition < 0 || xPosition + playerWidth > boardWidth)
}

function movePlayer(e){
    if(gameOver) {
        if (e.code == "Space") {
            resetGame();
        }
    }

    if (e.code == "ArrowLeft") {
        //player.x -= player.velocityX;
        let nextPlayerX = player.x - player.velocityX;
        if(!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
    else if (e.code == "ArrowRight") {
        //player.x += playerVelocityX;
        let nextPlayerX = player.x + player.velocityX;
        if(!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
}

function detectCollision(a, b){
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rigthCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth + c*10, //c*10 = separar 10px columnas
                y : blockY + r*blockHeight + r*10, //r*10 = separar 10px filas
                width : blockWidth,
                height : blockHeight,
                break : false,
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 5,
        width : playerWidth,
        height : playerHeight,
        velocityX : playerVelocityX,
    }

    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}