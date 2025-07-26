const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player1Up = false;
let player1Down = false;
let player2Up = false;
let player2Down = false;

let player1Score = 0;
let player2Score = 0;

let pause = false;
let waitingToContinue = false;
let gameStarted = false;
let gameMode = 1;
let playerControl = 'sx';
let showingIntro = true;
let gameFinished = false;

const paddleWidth = 10, paddleHeight = 100;
const ballRadius = 7;

let paddle1Y = canvas.height / 2 - paddleHeight / 2;
let paddle2Y = canvas.height / 2 - paddleHeight / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 6;
let ballSpeedY = 5;

// === AUDIO SETUP ===
const piano = new Audio("piano_loop.mp3");
piano.loop = true;

const scoreSound = new Audio("score.wav");
const winSound = new Audio("win.mp3");

// Browser autoplay fix
document.body.addEventListener("click", () => {
  piano.play().catch(() => {});
  piano.pause();
}, { once: true });

function drawPaddle(x, y) {
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawBall() {
  if (showingIntro || waitingToContinue || gameFinished) return;
  const gradient = ctx.createRadialGradient(ballX, ballY + 5, 2, ballX, ballY + 5, ballRadius);
  gradient.addColorStop(0, "green");
  gradient.addColorStop(1, "white");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "white";
  ctx.setLineDash([5, 15]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawScores() {
  ctx.font = "30px Courier New";
  ctx.fillStyle = "white";
  ctx.fillText(player1Score, canvas.width / 4, 40);
  ctx.fillText(player2Score, (canvas.width * 3) / 4, 40);
}

function drawMessage(message, yOffset = 0) {
  ctx.font = "20px Courier New";
  ctx.fillStyle = "white";
  ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2 + yOffset);
}

function resetBall(pauseForSpace = true) {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = (Math.random() > 0.5 ? 6 : -6);
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
  if (pauseForSpace) waitingToContinue = true;
}

function updateGame() {
  if (pause || !gameStarted || waitingToContinue || showingIntro || gameFinished) return;

  if (player1Up && paddle1Y > 0) paddle1Y -= 5;
  if (player1Down && paddle1Y < canvas.height - paddleHeight) paddle1Y += 5;

  if (gameMode === 2) {
    if (player2Up && paddle2Y > 0) paddle2Y -= 5;
    if (player2Down && paddle2Y < canvas.height - paddleHeight) paddle2Y += 5;
  } else {
    if (ballSpeedX > 0) {
      let paddleCenter = paddle2Y + paddleHeight / 2;
      if (ballY > paddleCenter + 10 && paddle2Y < canvas.height - paddleHeight) paddle2Y += 4.5;
      else if (ballY < paddleCenter - 10 && paddle2Y > 0) paddle2Y -= 4.5;
    }
  }

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) ballSpeedY = -ballSpeedY;

  if (ballX - ballRadius < paddleWidth) {
    if (ballY > paddle1Y && ballY < paddle1Y + paddleHeight) {
      ballSpeedX = -ballSpeedX;
    } else {
      player2Score++;
      scoreSound.play();
      if (player2Score === 9) endGame(2);
      else resetBall(true);
    }
  }

  if (ballX + ballRadius > canvas.width - paddleWidth) {
    if (ballY > paddle2Y && ballY < paddle2Y + paddleHeight) {
      ballSpeedX = -ballSpeedX;
    } else {
      player1Score++;
      scoreSound.play();
      if (player1Score === 9) endGame(1);
      else resetBall(true);
    }
  }
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawPaddle(0, paddle1Y);
  drawPaddle(canvas.width - paddleWidth, paddle2Y);
  drawBall();
  drawScores();

  if (showingIntro) {
    drawMessage("🎮 Controls: S = Up | X = Down" + (gameMode === 2 ? " | ↑/↓ = Player 2" : ""), -30);
    drawMessage("🎯 First to 9 🟢 wins!", 0);
    drawMessage("Press SPACE to start", 40);
  } else if (waitingToContinue) {
    drawMessage("Press SPACE to continue");
  } else if (pause && !gameFinished) {
    drawMessage("Game Paused", -10);
    drawMessage("Press R to Resume", 20);
  }
}

function gameLoop() {
  updateGame();
  drawGame();
  if (gameStarted) requestAnimationFrame(gameLoop);
}

function startGame(mode) {
  gameMode = mode;
  document.getElementById("menu").style.display = "none";
  playerControl = 'sx';
  canvas.style.display = "block";
  gameStarted = true;
  showingIntro = true;
  gameFinished = false;
  gameLoop();
}

function endGame(winner) {
  pause = false;
  gameFinished = true;
  gameStarted = false;
  piano.pause();
  winSound.play();
  document.getElementById("winner").style.display = "block";
  document.getElementById("winner").innerHTML = `
    🎉 Congratulations!<br/>Player ${winner} Wins!<br/>
    <button onclick="restartGame()">Play Again</button>
    <button onclick="goToMenu()">Main Menu</button>
  `;
}

function goToMenu() {
  player1Score = 0;
  player2Score = 0;
  pause = false;
  gameFinished = false;
  gameStarted = false;
  showingIntro = false;
  waitingToContinue = false;
  piano.pause();
  document.getElementById("winner").style.display = "none";
  canvas.style.display = "none";
  document.getElementById("menu").style.display = "block";
}

function restartGame() {
  player1Score = 0;
  player2Score = 0;
  paddle1Y = canvas.height / 2 - paddleHeight / 2;
  paddle2Y = canvas.height / 2 - paddleHeight / 2;
  document.getElementById("winner").style.display = "none";
  pause = false;
  gameFinished = false;
  gameStarted = true;
  piano.play();
  resetBall(true);
  gameLoop();
}

window.addEventListener("keydown", function (e) {
  if (e.key === "ArrowUp") player2Up = true;
  if (e.key === "ArrowDown") player2Down = true;
  if (e.key.toLowerCase() === "s") player1Up = true;
  if (e.key.toLowerCase() === "x") player1Down = true;

  if (e.code === "Space") {
    if (showingIntro) {
      showingIntro = false;
      piano.play();
    }
    if (waitingToContinue) waitingToContinue = false;
  }

  if (e.key.toLowerCase() === "p") pause = true;
  if (e.key.toLowerCase() === "r") pause = false;
});

window.addEventListener("keyup", function (e) {
  if (e.key === "ArrowUp") player2Up = false;
  if (e.key === "ArrowDown") player2Down = false;
  if (e.key.toLowerCase() === "s") player1Up = false;
  if (e.key.toLowerCase() === "x") player1Down = false;
});
