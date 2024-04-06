import { postLevelsServer } from "./save.js";
document.getElementById("nextPlay").addEventListener("click", () => nextPlay());
import {
  playSound,
  startSound,
  pauseSound,
  brickSound,
  rocketSound,
  brickHitSound,
  levelUpSound,
  gameOverSound,
} from "./audio.js";

document
  .getElementById("controlGames")
  .addEventListener("click", () => controlGames());
document
  .getElementById("showRecords")
  .addEventListener("click", () => showRecords());

document
  .getElementById("toggleControlButton")
  .addEventListener("click", () => toggСontrolGame());
document
  .getElementById("toggleResultsButton")
  .addEventListener("click", () => toggleResultsTable());

// Объявление переменных
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = 2;
var dy = -2;
var paddleHeight = 11;
var paddleWidth = 185;
var paddleX = (canvas.width - paddleWidth) / 2;
var rightPressed = false;
var leftPressed = false;
var brickWidth = 65;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var score = 0;
var lives = 3;
var ballOnPaddle = true;
var gameLevel = 1;
let gameActive = false;
let levels = [];
var resultsTable = document.getElementById("resultsTable");
var isShown = false;
var bricksDestroyed = 0;
var totalBricks = 0;
let messageDisplayed = false;
let message = null;
let gameOverMessageDisplayed = false;
var isGamePaused = false;
var pausedBallSpeed = { dx: 0, dy: 0 };
var paddleMovementEnabled = true;

// мяч на панеле управления
function placeBallOnPaddle() {
    x = paddleX + paddleWidth / 2;
    y = canvas.height - paddleHeight - ballRadius;
}
// мяч
function drawBall() {
  if (ballOnPaddle) {
    placeBallOnPaddle();
  }
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FDE910";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.stroke();
  ctx.closePath();
}

// панель управления
function drawPaddle() {
  var cornerRadius = 10;
  ctx.beginPath();
  ctx.moveTo(paddleX + cornerRadius, canvas.height - paddleHeight);
  ctx.arcTo(
    paddleX + paddleWidth,
    canvas.height - paddleHeight,
    paddleX + paddleWidth,
    canvas.height - paddleHeight + cornerRadius,
    cornerRadius
  );
  ctx.arcTo(
    paddleX + paddleWidth,
    canvas.height,
    paddleX + paddleWidth - cornerRadius,
    canvas.height,
    cornerRadius
  );
  ctx.arcTo(
    paddleX,
    canvas.height,
    paddleX,
    canvas.height - paddleHeight + cornerRadius,
    cornerRadius
  );
  ctx.arcTo(
    paddleX,
    canvas.height - paddleHeight,
    paddleX + cornerRadius,
    canvas.height - paddleHeight,
    cornerRadius
  );
  ctx.closePath();
  ctx.fillStyle = "#FF00FF";
  ctx.fill();
}
// отрисовка кирпичей + цвет
function drawBricks(bricks) {
    let y = brickOffsetTop;
  for (let r = 0; r < bricks[0].length; r++) {
    let x = brickOffsetLeft;
    for (let c = 0; c < bricks.length; c++) {
      let cell = bricks[c][r];
      if (cell !== 0) {
        var allZeros = false;
      }
      if (cell === 1) {
        ctx.fillStyle = "red";
      } else if (cell === 2) {
        ctx.fillStyle = "blue";
      } else if (cell === 3) {
        ctx.fillStyle = "green";
      } else {
        ctx.fillStyle = "#000";
      }
      if (cell !== 0) {
        var brickX = x;
        var brickY = y;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fill();
        ctx.closePath();
      }
      x += brickWidth + brickPadding;
    }
    y += brickHeight + brickPadding;
  }
}
// переход в игру + валидация имени
function nextPlay() {
  var playerName = String(
    document.getElementById("playerNameInput").value.trim()
  );
  var playerNameElement = document.getElementById("playerName");
  var regex = /^[a-zA-Z0-9_]{5,}$/;
  if (playerName === "") {
    document.getElementById("error-message").innerText =
      "Поле имени не должно быть пустым.";
    document.getElementById("error-message").style.display = "inline";
    document.getElementById("playerNameInput").classList.add("error");
    document.getElementById("playerNameInput").focus();
    return;
  }
  if (!regex.test(playerName)) {
    document.getElementById("error-message").innerText =
      "Имя может состоять из: латинских букв, цифр, знака подчёркивания и быть не менее 5 символов.";
    document.getElementById("error-message").style.display = "inline";
    document.getElementById("playerNameInput").classList.add("error");
    document.getElementById("playerNameInput").focus();
    return;
  }
  playerNameElement.innerText = playerName;
  document.getElementById("error-message").style.display = "none";
  document.getElementById("playerNameInput").classList.remove("error");
  localStorage.setItem("playerName", playerName);
  document.getElementById("welcomePage").style.display = "none";
  document.getElementById("gamePage").style.display = "block";
  window.location.hash = "gamePage";
}
//отображение счета, жизней, уровня игры
function drawScore() {
  var scoreElement = document.getElementById("score");
  var livesElement = document.getElementById("lives");
  var levelElement = document.getElementById("level");
  if (scoreElement && livesElement && levelElement) {
    scoreElement.innerText = "" + score;
    livesElement.innerText = "" + lives;
    levelElement.innerText = "" + gameLevel;
  }
}
function showCongratulationsMessage() {
  playSound(levelUpSound);
  var overlay = document.getElementById("overlay");
  overlay.style.display = "block";
}
function setupContinueButton() {
  var continueButton = document.getElementById("continueButton");
  if (!continueButton.hasEventListener) {
    continueButton.hasEventListener = true;
    continueButton.addEventListener("click", () => {
      gameLevel++;
      var overlay = document.getElementById("overlay");
      overlay.style.display = "none";
      ballOnPaddle = true;
      placeBallOnPaddle();
    });
  }
}
// коллизия мяч - кирпич
function collisionDetection(bricks) {
  for (var c = 0; c < bricks.length; c++) {
    for (var r = 0; r < bricks[c].length; r++) {
      var brick = bricks[c][r];
      if (brick !== 0) {
        var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        var ballTop = y - ballRadius;
        var ballBottom = y + ballRadius;
        var ballLeft = x - ballRadius;
        var ballRight = x + ballRadius;
        if (
          ballRight > brickX &&
          ballLeft < brickX + brickWidth &&
          ballTop < brickY + brickHeight &&
          ballBottom > brickY
        ) {
          var fromTop = ballBottom - brickY;
          var fromBottom = brickY + brickHeight - ballTop;
          var fromLeft = ballRight - brickX;
          var fromRight = brickX + brickWidth - ballLeft;
          var minDist = Math.min(fromTop, fromBottom, fromLeft, fromRight);
          if (minDist === fromTop) {
            dy = -dy;
          } else if (minDist === fromBottom) {
            dy = -dy;
          } else if (minDist === fromLeft) {
            dx = -dx;
          } else if (minDist === fromRight) {
            dx = -dx;
          }
          handleBrickCollision(bricks, c, r);
          return;
        }
      }
    }
  }
}
// кол-во ударов по кирпичам разного цвета + звук попадания и разрушения
function handleBrickCollision(bricks, c, r) {
  var brick = bricks[c][r];
  if (brick === 1) {
    bricks[c][r] = 0;
    playSound(brickSound);
    score++;
    localStorage.setItem("playerScore", score);
    bricksDestroyed++;
    if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
  } else if (brick === 2) {
    if (bricks[c][r] === 2) {
      bricks[c][r] = 1;
      playSound(brickHitSound);
    } else if (bricks[c][r] === 1) {
      bricks[c][r] = 0;
      playSound(brickSound);
      score++;
      localStorage.setItem("playerScore", score);
      bricksDestroyed++;
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  } else if (brick === 3) {
    if (bricks[c][r] === 3) {
      bricks[c][r] = 2;
      playSound(brickHitSound);
    } else if (bricks[c][r] === 2) {
      bricks[c][r] = 1;
      playSound(brickHitSound);
    } else if (bricks[c][r] === 1) {
      bricks[c][r] = 0;
      playSound(brickSound);
      score++;
      localStorage.setItem("playerScore", score);
      bricksDestroyed++;
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  }
  totalBricks = countTotalBricks(bricks);
  if (totalBricks === 0) {
    showCongratulationsMessage();
    setupContinueButton();
    pauseGame();
  }
}

function countTotalBricks(bricks) {
  var count = 0;
  for (var c = 0; c < bricks.length; c++) {
    count += bricks[c].filter((brick) => brick !== 0).length;
  }
  return count;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  if (Array.isArray(levels[gameLevel - 1])) {
        collisionDetection(levels[gameLevel - 1]);
        drawBricks(levels[gameLevel - 1]);
}
  if (y + ballRadius > canvas.height - paddleHeight) {
    if (x + ballRadius > paddleX && x - ballRadius < paddleX + paddleWidth) {
      var leftBoundary = paddleX + paddleWidth * 0.3;
      var rightBoundary = paddleX + paddleWidth * 0.7;
      if (x < leftBoundary) {
        dx = -Math.abs(dx);
      } else if (x > rightBoundary) {
        dx = Math.abs(dx);
      }
      dy = -dy;
      y = canvas.height - paddleHeight - ballRadius;
      playSound(rocketSound);
    }
  }
  if (y - ballRadius < 0) {
    dy = -dy;
  } else if (x - ballRadius < 0 || x + ballRadius > canvas.width) {
    dx = -dx;
  }
  if (y + ballRadius > canvas.height && !messageDisplayed) {
    lives--;
    dx = 0;
    dy = 0;
    x = Math.min(Math.max(x, ballRadius), canvas.width - ballRadius);
    y = canvas.height - ballRadius;
    paddleMovementEnabled = false;
    playSound(gameOverSound);
    message = document.createElement("div");
    message.textContent =
      "Вы потеряли одну игровую попытку. Нажмите на это сообщение, чтобы продолжить.";
    message.style.position = "absolute";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    message.style.padding = "2%";
    message.style.border = "1px solid black";
    message.style.width = "50%";
    message.style.maxWidth = "300px";
    message.style.zIndex = "1";
    message.style.textAlign = "center";
    document.body.appendChild(message);
    messageDisplayed = true;
    document.addEventListener(
      "click",
      () => {
        paddleMovementEnabled = true;
        dx = 2;
        dy = -2;
        x = canvas.width / 2;
        y = canvas.height - 30;
        paddleX = (canvas.width - paddleWidth) / 2;
        document.body.removeChild(message);
        messageDisplayed = false;
      },
      { once: true }
    );
  }
  if (lives === 0 && !gameOverMessageDisplayed) {
    if (messageDisplayed) {
      document.body.removeChild(message);
      messageDisplayed = false;
    }
    var gameOverMessage = document.createElement("div");
    gameOverMessage.textContent =
      "Игра окончена. Нажмите на это сообщение, чтобы выйти из игры.";
    gameOverMessage.style.position = "absolute";
    gameOverMessage.style.top = "50%";
    gameOverMessage.style.left = "50%";
    gameOverMessage.style.transform = "translate(-50%, -50%)";
    gameOverMessage.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    gameOverMessage.style.padding = "2%";
    gameOverMessage.style.border = "1px solid black";
    gameOverMessage.style.width = "50%";
    gameOverMessage.style.maxWidth = "300px";
    gameOverMessage.style.zIndex = "1";
    gameOverMessage.style.textAlign = "center";
    document.body.appendChild(gameOverMessage);
    gameOverMessageDisplayed = true;
    document.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
  if (paddleMovementEnabled) {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += 5;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 5;
    }
  }
  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

postLevelsServer("READ", "Maxim_1997", (e) => {
  if (e.error) {
    console.log(`Ошибка при загрузке уровней ${e.error}`);
  } else {
    const ready = JSON.parse(e.result);
    levels=ready;
    draw(levels);
    console.log("Уровни загружены, все хорошо");
  }
});
// управление стрелками
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

canvas.addEventListener("mousemove", (eo) => {
  var rect = canvas.getBoundingClientRect();
  var mouseX = eo.clientX - rect.left;
  if (paddleMovementEnabled) {
    if (mouseX < paddleWidth / 2) {
      paddleX = 0;
    } else if (mouseX > canvas.width - paddleWidth / 2) {
      paddleX = canvas.width - paddleWidth;
    } else {
      paddleX = mouseX - paddleWidth / 2;
    }
  }
});
// Касание кнопок моб\планш
var buttons = document.querySelectorAll("button");
buttons.forEach((button) => {
  button.addEventListener("touchstart", () => {
    if (button.onclick) {
      button.onclick();
    }
  });
});
// Управление тачем
canvas.addEventListener("touchmove", (eo) => {
    var touch = eo.touches[0];
    var touchX = touch.clientX - canvas.offsetLeft;
     paddleX = Math.max(Math.min(touchX, canvas.width - paddleWidth), 0);
});


// Кнопка старта игры \ снятия с паузы и начала нового раунда.
function startGame() {
  if (isGamePaused) {
    isGamePaused = false;
    dx = pausedBallSpeed.dx;
    dy = pausedBallSpeed.dy;
    ballOnPaddle = false;
    paddleMovementEnabled = true;
  } else if (!gameActive) {
    ballOnPaddle = false;
    gameActive = true;
  }
}
let pausedPaddleSpeedX = 0;
// Пауза, остановка мяча при totalBricks === 0
function pauseGame() {
  if (!isGamePaused) {
    isGamePaused = true;
    pausedBallSpeed.dx = dx;
    pausedBallSpeed.dy = dy;
    pausedPaddleSpeedX = paddleX;
    dx = 0;
    dy = 0;
    paddleMovementEnabled = false;
  }
}
function showRecords() {
  if (!isShown) {
    resultsTable.style.top = "50px";
    isShown = true;
  }
  var playerNameFromStorage = localStorage.getItem("playerName");
  if (playerNameFromStorage) {
    var score = localStorage.getItem("playerScore");
    document.getElementById("results").innerHTML =
      "<tr><td>Имя игрока:</td><td>Количество сбитых кирпичей:</td></tr>" +
      "<tr><td>" +
      playerNameFromStorage +
      "</td><td>" +
      score +
      "</td></tr>";
  }
}
// кнопка закрыть в таблице
function toggleResultsTable() {
  if (isShown) {
    resultsTable.style.top = "-300px";
    isShown = false;
  }
}

function controlGames() {
  document.getElementById("welcomePage").style.display = "none";
  document.getElementById("gamePage").style.display = "none";
  document.getElementById("controlGame").style.top = "400px";
  window.location.hash = "controlGame";
}

function toggСontrolGame() {
  var resultsTable = document.getElementById("controlGame");
  resultsTable.style.top = "-300px";
  window.location.hash = "welcomePage";
  if (isShown) {
    resultsTable.style.top = "-300px";
    isShown = false;
  }
}

var startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
  startGame();
  startSound.play();
});
startButton.addEventListener("touchstart", () => {
  startGame();
  startSound.play();
});

var pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", () => {
  pauseGame();
  pauseSound.play();
});
pauseButton.addEventListener("touchstart", () => {
  pauseGame();
  pauseSound.play();
});

// SPA 
function showContent(id) {
  var pages = document.querySelectorAll(
    "#welcomePage, #gamePage, #controlGame"
  );
  for (var i = 0; i < pages.length; i++) {
    pages[i].style.display = "none";
  }
  var page = document.getElementById(id);
  if (page) {
    page.style.display = "flex";
    page.style.textAlign = "center";
    page.style.flexDirection = "column";
    page.style.alignItems = "center";
    page.style.flexWrap = "wrap";
    page.style.gap = "5px";
  }
}

function handleHashChange() {
  var hash = window.location.hash.substring(1);
  if (hash === "welcomePage" || hash === "gamePage" || hash === "controlGame") {
    showContent(hash);
  } else {
    showContent("welcomePage");
  }
}
window.addEventListener("hashchange", () => {
  handleHashChange();
  if (location.hash !== "#gamePage") {
    pauseGame();
  }
});

window.addEventListener("load", handleHashChange);

window.addEventListener("beforeunload", (e) => {
    if (window.location.hash !== "#gamePage") {
        return;
    }
    e.returnValue = showConfirmation();
    return e.returnValue;
});

window.addEventListener("popstate", (e) => {
    if (window.location.hash === "#gamePage") {
        pauseGame();
        return;
    }
    const confirmed = showConfirmation();
    if (!confirmed) {
        e.preventDefault();
        history.pushState(null, null, "#gamePage");
    }
});

function showConfirmation() {
    return confirm("Вы действительно хотите покинуть данную страницу? Вся информация будет сброшена!"); 
}

window.onload = () => {
  var playerNameFromStorage = localStorage.getItem("playerName");
  var scoreFromStorage = localStorage.getItem("playerScore") || 0;
  if (playerNameFromStorage) {
    document.getElementById("results").innerHTML =
      "<tr><td>Имя:</td><td>" +
      playerNameFromStorage +
      "</td></tr>" +
      "<tr><td>Количество сбитых кирпичей:</td><td>" +
      scoreFromStorage +
      "</td></tr>";
  }
};
