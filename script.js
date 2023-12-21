//basic canvas creation
const canvas                  = document.createElement("canvas");
canvas.style.backgroundImage  = "url('./assets/bg.png')";
canvas.style.backgroundRepeat = 'no-repeat';
canvas.style.backgroundSize   = 'cover';
canvas.style.display          = 'block';
canvas.style.margin           = `${(window.innerHeight - 420)*0.5}px auto 0 auto`;

canvas.setAttribute("width", "580");
canvas.setAttribute("height", "460");
document.body.appendChild(canvas);

//2d context
const ctx = canvas.getContext("2d");

//key press
let rightPressed = false;
let leftPressed  = false;

//flags and other attributes
let gameStart    = false;
let score        = 0;
let lives        = 5;

//paddle
const paddleWidth    = 75;
const paddleHeight   = 10;
let   paddleX        = Math.floor((canvas.width - paddleWidth) / 2); 
let   paddleY        = (canvas.height - paddleHeight);
let   paddleVelocity = 8;
let   paddleCenterX  = paddleX + Math.floor(paddleWidth/2);
let   ballPaddleDist = 0;

//ball
let ballRadius = 10;
let ballX      = Math.floor((canvas.width  - ballRadius) * 0.5);
let ballY      = (canvas.height - ballRadius - paddleHeight);
let dx         = 4 * [-1, 0, 1][Math.floor(Math.random() * 2)];
let dy         = -4

//brick
const brickRowCount    = 6;
const brickColumnCount = 9;
const brickWidth       = 50;
const brickHeight      = 20;
const brickPadding     = 10;
const brickOffsetTop   = 40;
const brickOffsetLeft  = 25;
const bricks           = createBricks();

//draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, 5);
    ctx.fillStyle = "darkcyan";
    ctx.fill();
    ctx.closePath();
}

//draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "tomato";
    ctx.fill();
    ctx.closePath();
}


function drawBricks() {
    let brickPosX,brickPosY;
    for (let r = 0; r < brickRowCount; r++) {
        for(let c = 0; c < brickColumnCount; c++) {
            if (bricks[r][c].visible === 1) {
                brickPosX      = c * (brickWidth + brickPadding) + brickOffsetLeft;
                brickPosY      = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[r][c].x = brickPosX;
                bricks[r][c].y = brickPosY;
                ctx.beginPath();
                ctx.roundRect(brickPosX, brickPosY, brickWidth, brickHeight, 5);
                ctx.fillStyle  = "lightyellow";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font      =  "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("S C O R E: " + score, 0, 20); 
}

function drawLives() {
    ctx.font      =  "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(
        "L I V E S: " + lives, 
        canvas.width - ctx.measureText("L I V E S: " + lives).width,
        20
    ); 
}


//main function to render drawing and behavior
function draw() {
    if (!gameStart) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall();
        drawPaddle();
        drawBricks();
        drawLives();
        drawScore();
        ctx.font = '30px Arial';
        ctx.fillStyle = "#000000";
        ctx.fillText('PRESS SPACE TO CONTINUE', 55, canvas.height/1.5);
        requestAnimationFrame(draw);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawBricks();
    brickBallCollision();
    drawScore();
    drawLives();

    ballX += dx;
    ballY += dy;

    if (ballX + ballRadius >= canvas.width || ballX <= 0)
        dx = dx * -1;
    if (ballY <= 0)
        dy = dy * -1;

    if (rightPressed && paddleX+paddleWidth <= canvas.width) 
        paddleX = Math.min(paddleX + paddleVelocity, canvas.width - paddleWidth);
    else if (leftPressed && paddleX >= 0)
        paddleX = Math.max(paddleX - paddleVelocity, 0);


    if (ballY > paddleY) {
        if (ballX+ballRadius >= paddleX && ballX <= paddleX+paddleWidth) {
            paddleCenterX = paddleX + Math.floor(paddleWidth / 2);
            dx = (paddleCenterX - ballX) * (-0.1);
            dy = dy *  -1;
        } else {
            lives--;
            paddleX = (canvas.width-paddleWidth)/2;
            ballX   = canvas.width/2 - ballRadius/2;
            ballY   = canvas.height  - ballRadius - paddleHeight; 
            dx      = 4 * [-1, 0, 1][Math.floor(Math.random() * 2)];
            dy      = -4
            gameStart = false;
        }

        if (lives == 0) {
            alert("game over");
            location.reload();
        }
    }  
    requestAnimationFrame(draw);  
}

function createBricks() {
    const bricks = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[r] = []
        for(let c = 0; c < brickColumnCount; c++) {
            bricks[r][c] = {x: 0, y: 0, visible: 1};
        }
    }   
    return bricks;
}

function brickBallCollision() {
    let brick, brickCenterX;
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            brick = bricks[r][c];
            if (
                brick.visible &&
                ballX < brick.x + brickWidth && ballX+ballRadius > brick.x &&
                ballY > brick.y && ballY-ballRadius < brick.y + brickHeight
               ) {
                brick.visible = 0;
                brickCenterX = brick.x + brickWidth / 2;
                dx = (brickCenterX - ballX) * (-0.1);
                dy = dy *  -1;
                score++;
                if (score == brickRowCount * brickColumnCount) {
                    alert("You win, CONGRATULATION!");
                    location.reload();
                }
            } 
        }
    }
}

function keyDownHandler(e) {

    if (e.key === "left" || e.key === "ArrowLeft")
        leftPressed  = true;
    else if (e.key === "right" || e.key === "ArrowRight")
        rightPressed = true; 
    if (!gameStart && e.code == "Space")
        gameStart = true;
}

function keyUpHandler(e) {
    if (e.key === "left" || e.key === "ArrowLeft")
        leftPressed  = false;
    else if (e.key === "right" || e.key === "ArrowRight")
        rightPressed = false; 
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

draw()