const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let weatherCondition = "Rainy";

// game variables
// Game states
let gameStarted = false;
let gamePaused = false;
let gameOver = false;

// Game statistics
let distanceTravelled = 0;
let score = 0;
let highScore = 0;

// Battery tracking
let totalBatteryUsed = 0;

// Collision message
let collisionMessage = "";

// controls
let keys = {
  up: false,
  down: false,
  left: false,

  right: false

};

// keydwon event

document.addEventListener("keydown", function (event) {
  // Move up
  if (event.key === "ArrowUp") {

    keys.up = true;

    event.preventDefault();
  }

  // Move down
  if (event.key === "ArrowDown") {

    keys.down = true;

    event.preventDefault();
  }

  // Move left
  if (event.key === "ArrowLeft") {

    keys.left = true;

    event.preventDefault();
  }

  // Move right
  if (event.key === "ArrowRight") {

    keys.right = true;

    event.preventDefault();
  }

});

// key up even
document.addEventListener("keyup", function (event) {

  // Stop moving up
  if (event.key === "ArrowUp") {

    keys.up = false;
  }

  // Stop moving down
  if (event.key === "ArrowDown") {

    keys.down = false;
  }


  // Stop moving left
  if (event.key === "ArrowLeft") {

    keys.left = false;
  }


  // Stop moving right
  if (event.key === "ArrowRight") {

    keys.right = false;

  }

});

// create high score 
let savedHighScore =
  localStorage.getItem("aquaLinkHighScore");

if (savedHighScore !== null) {

  highScore = Number(savedHighScore);

}

// create WATER DELIVERY VEHICLE CLASS

class WaterVehicle {

  constructor(x, y, width, height, color) {

    this.x = x;

    this.y = y;

    this.width = width;

    this.height = height;

    this.color = color;

    // Vehicle direction
    this.angle = 0;

    // Vehicle velocity
    this.velocityX = 0;

    this.velocityY = 0;

    // Vehicle acceleration
    this.acceleration = 0.3;

    // Maximum speed
    this.maxSpeed = 4;

    // Battery
    this.Battery = 100;

    // Vehicle blocked state
    this.isBlocked = false;

  }

  // BATTERY GETTER
  get battery() {
    return this.Battery;
  }

  // BATTERY SETTER
  set battery(value) {

    if (value < 0) {

      this.Battery = 0;

    }

    else if (value > 100) {

      this.Battery = 100;

    }

    else {

      this.Battery = value;

    }

  }

  // DRAW VEHICLE
  draw() {

    // Main vehicle body
    ctx.fillStyle = this.color;

    ctx.fillRect(
      this.x,
      this.y,
      this.width,
      this.height
    );

    // Water tank
    ctx.fillStyle = "#8ecae6";

    ctx.fillRect(
      this.x + 12,
      this.y - 12,
      36,
      12
    );

    // Water tank outline
    ctx.strokeStyle = "#023e8a";

    ctx.strokeRect(
      this.x + 12,
      this.y - 12,
      36,
      12
    );

    // Driver cabin
    ctx.fillStyle = "#1d3557";

    ctx.fillRect(
      this.x + 38,
      this.y + 5,
      18,
      20
    );

    // Driver window
    ctx.fillStyle = "#90e0ef";

    ctx.fillRect(
      this.x + 41,
      this.y + 8,
      12,
      9
    );

    // Front vehicle
    ctx.fillStyle = "#555555";

    ctx.fillRect(
      this.x + this.width,
      this.y + 10,
      5,
      15
    );

    // wheel vehicle
    ctx.fillStyle = "black";

    ctx.beginPath();

    ctx.arc(
      this.x + 15,
      this.y + this.height,
      8,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Front wheel
    ctx.beginPath();

    ctx.arc(
      this.x + 48,
      this.y + this.height,
      8,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }
  // create movement of vehicle
  updateVehicle() {
    // Do not move if game is not active
    if (!gameStarted || gamePaused || gameOver) {
      return;
    }

    // Do not move while blocked
    if (this.isBlocked) {
      return;
    }

// up key
    if (keys.up) {

      this.velocityY = -this.maxSpeed;

    }

    if (keys.down) {

      this.velocityY = this.maxSpeed;

    }
    // left keys

    if (keys.left) {

      this.velocityX = -this.maxSpeed;

    }
// rifht key
    if (keys.right) {

      this.velocityX = this.maxSpeed;
    }

    // slow down keys 
    if (!keys.left && !keys.right) {

      this.velocityX *= 0.85;

    }

    if (!keys.up && !keys.down) {

      this.velocityY *= 0.85;

    }
    //update pos
    this.x += this.velocityX;

    this.y += this.velocityY;

   // boundaries 
    if (this.x < 0) {

      this.x = 0;

      this.velocityX = 0;

    }

    if (this.x + this.width > canvas.width) {

      this.x =
        canvas.width - this.width;

      this.velocityX = 0;

    }

    if (this.y < 0) {

      this.y = 0;

      this.velocityY = 0;

    }

    if (this.y + this.height > canvas.height) {

      this.y =
        canvas.height - this.height;

      this.velocityY = 0;

    }

    if (
      this.velocityX !== 0 ||
      this.velocityY !== 0
    ) {

      this.battery -= 0.03;
      totalBatteryUsed += 0.03;

    }

    if (this.battery <= 0) {

      this.battery = 0;

      this.velocityX = 0;

      this.velocityY = 0;

      endGame();

    }

  }

  checkCollission(obstacle) {
    if (
      this.x <
      obstacle.x + obstacle.width &&

      this.x + this.width >
      obstacle.x &&

      this.y <
      obstacle.y + obstacle.height &&

      this.y + this.height >
      obstacle.y

    ) {
      return true;
    }

    else {
      return false;
    }
  }

  createWeatherCondition(weather) {
    if (weather == "Rainy") {

      this.velocityX *= 0.99;

      this.velocityY *= 0.99;

    }
  }

  displayCollisionMessage(message) {
    collisionMessage = message;
  }

}

//slar class
class SolarEnergyGrid {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Recharge rate
    this.solarRechargeRate = 0.5;
  }

  //solar area 
  drawSolarArea() {

    // Solar station background
    ctx.fillStyle = "#f4d35e";

    ctx.fillRect(
      this.x,
      this.y,
      this.width,
      this.height
    );

    // Solar panels
    ctx.fillStyle = "#264653";

    ctx.fillRect(
      this.x + 20,
      this.y + 35,
      55,
      35
    );

    ctx.fillRect(
      this.x + 90,
      this.y + 35,
      55,
      35
    );

    // Solar panel lines
    ctx.strokeStyle = "#90caf9";

    ctx.beginPath();

    // First panel horizontal line
    ctx.moveTo(
      this.x + 20,
      this.y + 52
    );

    ctx.lineTo(
      this.x + 75,
      this.y + 52
    );

    // First panel vertical line
    ctx.moveTo(
      this.x + 47,
      this.y + 35
    );

    ctx.lineTo(
      this.x + 47,
      this.y + 70
    );

    // Second panel horizontal line
    ctx.moveTo(
      this.x + 90,
      this.y + 52
    );

    ctx.lineTo(
      this.x + 145,
      this.y + 52
    );


    // Second panel vertical line
    ctx.moveTo(
      this.x + 117,
      this.y + 35
    );

    ctx.lineTo(
      this.x + 117,
      this.y + 70
    );

    ctx.stroke();

    // Solar supports
    ctx.fillStyle = "#555555";

    ctx.fillRect(
      this.x + 45,
      this.y + 70,
      5,
      20
    );

    ctx.fillRect(
      this.x + 115,
      this.y + 70,
      5,
      20
    );

    // Solar station label
    ctx.fillStyle = "black";

    ctx.font = "16px Calibri";

    ctx.fillText(
      "Solar Energy Grid",
      this.x + 25,
      this.y + 22
    );

  }

  checkBatteryRecharge(vehicle) {
    if (
      vehicle.x <
      this.x + this.width &&

      vehicle.x + vehicle.width >
      this.x &&

      vehicle.y <
      this.y + this.height &&

      vehicle.y + vehicle.height >
      this.y

    ) {

      vehicle.battery +=
        this.solarRechargeRate;

    }

  }

  displayRechargeStatus(vehicle) {

    if (
      vehicle.x <
      this.x + this.width &&

      vehicle.x + vehicle.width >
      this.x &&

      vehicle.y <
      this.y + this.height &&

      vehicle.y + vehicle.height >
      this.y

    ) {

      ctx.fillStyle = "#006400";

      ctx.font = "17px Calibri";

      ctx.fillText(
        "Solar Recharge Active",
        20,
        200
      );
    }
  }
}

class Obstacles {

  constructor(
    x,
    y,
    width,
    height,
    type,
    color
  ) {

    this.x = x;

    this.y = y;

    this.width = width;

    this.height = height;

    this.type = type;

    this.color = color;

  }

  drawObstacle() {

    ctx.fillStyle = this.color;

    ctx.fillRect(
      this.x,
      this.y,
      this.width,
      this.height
    );

    ctx.fillStyle = "black";

    ctx.font = "14px Calibri";

    ctx.fillText(
      this.type,
      this.x + 5,
      this.y + 20
    );

  }

  drawRiver() {

    // River water
    ctx.fillStyle = "#8ecae6";

    ctx.fillRect(
      this.x,
      this.y,
      this.width,
      this.height
    );

    // Water lines
    ctx.strokeStyle = "white";

    ctx.beginPath();

    ctx.moveTo(
      this.x + 15,
      this.y + 15
    );

    ctx.lineTo(
      this.x + 55,
      this.y + 15
    );

    ctx.moveTo(
      this.x + 80,
      this.y + 30
    );

    ctx.lineTo(
      this.x + 125,
      this.y + 30
    );

    ctx.moveTo(
      this.x + 25,
      this.y + 42
    );

    ctx.lineTo(
      this.x + 70,
      this.y + 42
    );

    ctx.stroke();

    // River label
    ctx.fillStyle = "black";

    ctx.font = "14px Calibri";

    ctx.fillText(
      "River Crossing",
      this.x + 40,
      this.y + 25
    );
  }
}

const waterVehicle = new WaterVehicle(
  120,
  250,
  60,
  35,
  "#26619C"
);

const solarArea = new SolarEnergyGrid(
  650,
  210,
  180,
  100
);

// Side Road 1
// Pothole

const pothole = new Obstacles(
  320,
  100,
  60,
  35,
  "Pothole",
  "brown"
);

// Side Road 2
// Fallen Tree

const fallenTree = new Obstacles(
  475,
  390,
  90,
  35,
  "Fallen Tree",
  "green"
);

// Side Road 3
// River

const river = new Obstacles(
  655,
  420,
  150,
  50,
  "River",
  "lightblue"
);

function drawEnviroment() {

  ctx.fillStyle = "#87A96B";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#AE9882";

  ctx.fillRect(
    0,
    210,
    canvas.width,
    120
  );

  // Main road centre line
  ctx.fillStyle = "lightyellow";

  ctx.fillRect(
    0,
    268,
    canvas.width,
    5
  );

  ctx.fillStyle = "#AE9882";

  ctx.fillRect(
    300,
    0,
    100,
    210
  );

  // Side road line
  ctx.fillStyle = "lightyellow";

  ctx.fillRect(
    347,
    0,
    5,
    210
  );

  ctx.fillStyle = "#AE9882";

  ctx.fillRect(
    470,
    330,
    100,
    170
  );

  // Side road line
  ctx.fillStyle = "lightyellow";

  ctx.fillRect(
    517,
    330,
    5,
    170
  );

  ctx.fillStyle = "#AE9882";

  ctx.fillRect(
    680,
    330,
    100,
    170
  );

  // Side road line
  ctx.fillStyle = "lightyellow";

  ctx.fillRect(
    727,
    330,
    5,
    170
  );

  drawTree(80, 150);
  drawTree(200, 120);
  drawTree(830, 100);
  drawTree(850, 390);

}

function drawTree(x, y) {

  // Tree trunk
  ctx.fillStyle = "brown";

  ctx.fillRect(
    x,
    y,
    20,
    60
  );

  // Tree leaves
  ctx.fillStyle = "green";

  ctx.beginPath();

  ctx.arc(
    x + 10,
    y,
    35,
    0,
    Math.PI * 2
  );

  ctx.fill();

}

  // HUD background
function drawHUD() {

  ctx.fillStyle =
    "rgba(255, 255, 255, 0.88)";

  ctx.fillRect(
    10,
    10,
    255,
    190
  );

  // HUD title
  ctx.fillStyle = "#023e8a";

  ctx.font = "bold 20px Calibri";

  ctx.fillText(
    "AquaLink",
    20,
    35
  );

  // text
  ctx.fillStyle = "black";

  ctx.font = "16px Calibri";

  // Battery
  ctx.fillText(
    "Battery: " +
    Math.round(waterVehicle.battery) +
    "%",
    20,
    58
  );

  // Distance
  ctx.fillText(
    "Distance: " +
    Math.round(distanceTravelled) +
    " km",
    20,
    80
  );

  // Score
  ctx.fillText(
    "Score: " +
    score,
    20,
    102
  );

  // High score
  ctx.fillText(
    "High Score: " +
    highScore,
    20,
    124
  );

  // Energy efficiency
  ctx.fillText(
    "Efficiency: " +
    calculateEnergyEfficiency() +
    "%",
    20,
    146
  );

  // Weather
  ctx.fillText(
    "Weather: " +
    weatherCondition,
    20,
    168
  );

  // Vehicle status
  let vehicleStatus = "Ready";

  if (gameStarted) {

    vehicleStatus = "Moving";
  }

  if (gamePaused) {

    vehicleStatus = "Paused";
  }

  if (waterVehicle.isBlocked) {

    vehicleStatus = "Route Blocked";
  }

  if (gameOver) {

    vehicleStatus = "Game Over";
  }

  ctx.fillText(
    "Status: " +
    vehicleStatus,
    20,
    190
  );

  // Collision message
  if (collisionMessage !== "") {

    ctx.fillStyle = "red";

    ctx.font = "bold 16px Calibri";

    ctx.fillText(
      collisionMessage,
      20,
      220
    );

  }
}

function calculateEnergyEfficiency() {

  // No movement yet
  if (distanceTravelled <= 0) {
    return 100;
  }
  // Prevent division by zero
  if (totalBatteryUsed <= 0) {
    return 100;
  }

  /* This creates an efficiency percentage using distance travelled compared with battery consumed.
  */

  let efficiency =
    (
      distanceTravelled /
      (
        distanceTravelled +
        totalBatteryUsed
      )
    ) * 100;

  // Keep score between 0 and 100
  if (efficiency > 100) {
    efficiency = 100;
  }

  if (efficiency < 0) {
    efficiency = 0;
  }

  return Math.round(efficiency);

}

function calculateScore() {
  let efficiency =
    calculateEnergyEfficiency();

  score =
    Math.round(distanceTravelled) +
    efficiency;
}

function displayStartScreen() {

  // Background
  ctx.fillStyle = "#1f4d3a";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Title
  ctx.fillStyle = "white";

  ctx.font = "bold 42px Calibri";

  ctx.fillText(
    "AquaLink",
    350,
    175
  );

  // Subtitle
  ctx.font = "21px Calibri";

  ctx.fillText(
    "Rural Water Delivery Simulator",
    280,
    215
  );

  // Instructions
  ctx.font = "18px Calibri";

  ctx.fillText(
    "Use the arrow keys to drive the water vehicle.",
    260,
    265
  );

  ctx.fillText(
    "Avoid obstacles and manage your battery.",
    280,
    295
  );

  ctx.fillText(
    "Find the Solar Energy Grid to recharge.",
    285,
    325
  );

}

function displayPauseScreen() {

  // Transparent overlay
  ctx.fillStyle =
    "rgba(0, 0, 0, 0.65)";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Pause title
  ctx.fillStyle = "white";

  ctx.font = "bold 40px Calibri";

  ctx.fillText(
    "GAME PAUSED",
    335,
    220
  );

  // Message
  ctx.font = "18px Calibri";

  ctx.fillText(
    "Press RESUME to continue",
    325,
    260
  );

}

function displayGameOverScreen() {

  // Dark red overlay
  ctx.fillStyle =
    "rgba(80, 0, 0, 0.88)";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Game over
  ctx.fillStyle = "white";

  ctx.font = "bold 42px Calibri";

  ctx.fillText(
    "GAME OVER",
    345,
    155
  );

  // Reason
  ctx.font = "20px Calibri";

  ctx.fillText(
    "Battery depleted",
    360,
    195
  );

  // Distance
  ctx.fillText(
    "Distance: " +
    Math.round(distanceTravelled) +
    " km",
    355,
    235
  );

  // Efficiency
  ctx.fillText(
    "Energy Efficiency: " +
    calculateEnergyEfficiency() +
    "%",
    315,
    270
  );

  // Score
  ctx.fillText(
    "Score: " +
    score,
    395,
    305
  );

  // High score
  ctx.fillText(
    "High Score: " +
    highScore,
    370,
    340
  );

  // Restart message
  ctx.font = "18px Calibri";

  ctx.fillText(
    "Press RESTART to try again",
    325,
    390
  );

}

function startGame() {

  gameStarted = true;

  gamePaused = false;

  gameOver = false;

  // Reset statistics
  distanceTravelled = 0;

  score = 0;

  totalBatteryUsed = 0;

  // Reset vehicle
  waterVehicle.battery = 100;

  waterVehicle.x = 120;

  waterVehicle.y = 250;

  waterVehicle.velocityX = 0;

  waterVehicle.velocityY = 0;

  waterVehicle.isBlocked = false;

  // Reset keys
  keys.up = false;

  keys.down = false;

  keys.left = false;

  keys.right = false;

  // Clear collision message
  collisionMessage = "";

  // Show correct buttons
  document.getElementById(
    "startButton"
  ).style.display = "none";

  document.getElementById(
    "pauseButton"
  ).style.display = "inline-block";

  document.getElementById(
    "restartButton"
  ).style.display = "inline-block";

  document.getElementById(
    "pauseButton"
  ).textContent = "PAUSE";

}

function pauseGame() {

  // Do nothing if game is not running
  if (!gameStarted || gameOver) {
    return;
  }

  // If already paused
  if (gamePaused) {

    gamePaused = false;

    document.getElementById(
      "pauseButton"
    ).textContent = "PAUSE";
  }

  // If currently playing
  else {
    gamePaused = true;

    // Stop vehicle
    waterVehicle.velocityX = 0;

    waterVehicle.velocityY = 0;

    document.getElementById(
      "pauseButton"
    ).textContent = "RESUME";

  }

}

function endGame() {
  // Prevent ending the game twice
  if (gameOver) {

    return;

  }

  gameOver = true;
  gameStarted = false;
  gamePaused = false;

  // Stop vehicle
  waterVehicle.velocityX = 0;

  waterVehicle.velocityY = 0;

  // Calculate final score
  calculateScore();

  // Check high score
  if (score > highScore) {

    highScore = score;

    // Save high score
    localStorage.setItem(
      "aquaLinkHighScore",
      highScore
    );

  }

  // Reset keys
  keys.up = false;

  keys.down = false;

  keys.left = false;

  keys.right = false;

  // Hide pause button
  document.getElementById(
    "pauseButton"
  ).style.display = "none";

  // Keep restart button visible
  document.getElementById(
    "restartButton"
  ).style.display = "inline-block";

}

function restartGame() {

  gameStarted = true;
  gamePaused = false;
  gameOver = false;

  // Reset statistics
  distanceTravelled = 0;

  score = 0;

  totalBatteryUsed = 0;

  // Reset vehicle
  waterVehicle.battery = 100;

  waterVehicle.x = 120;

  waterVehicle.y = 250;

  waterVehicle.velocityX = 0;

  waterVehicle.velocityY = 0;

  waterVehicle.isBlocked = false;

  // Reset keys
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;

  // Clear collision message
  collisionMessage = "";

  // Buttons
  document.getElementById(
    "startButton"
  ).style.display = "none";

  document.getElementById(
    "pauseButton"
  ).style.display = "inline-block";

  document.getElementById(
    "restartButton"
  ).style.display = "inline-block";

  document.getElementById(
    "pauseButton"
  ).textContent = "PAUSE";

}

function checkObstacleCollisions() {
  if (
    waterVehicle.checkCollission(pothole)
  ) {

    waterVehicle.displayCollisionMessage(
      "Pothole! Vehicle slowed down"
    );

    waterVehicle.velocityX *= 0.5;
    waterVehicle.velocityY *= 0.5;

  }
  // fallen tree
  if (
    waterVehicle.checkCollission(fallenTree)
  ) {

    waterVehicle.displayCollisionMessage(
      "Fallen Tree! Route blocked"
    );

    // Stop vehicle
    waterVehicle.velocityX = 0;

    waterVehicle.velocityY = 0;

  }

  if (
    waterVehicle.checkCollission(river)
  ) {

    waterVehicle.displayCollisionMessage(
      "River! Vehicle speed reduced"
    );

    waterVehicle.velocityX *= 0.5;
    waterVehicle.velocityY *= 0.5;

  }

}

function drawGameWorld() {

  // Rural environment
  drawEnviroment();

  // Solar energy grid
  solarArea.drawSolarArea();

  // Obstacles
  pothole.drawObstacle();

  fallenTree.drawObstacle();

  river.drawRiver();

  // Vehicle
  waterVehicle.draw();

}

function animate() {

  // Clear canvas
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
  // start screen

  if (!gameStarted && !gameOver) {

    displayStartScreen();

    requestAnimationFrame(animate);

    return;

  }
  // game over

  if (gameOver) {

    drawGameWorld();

    drawHUD();

    displayGameOverScreen();

    requestAnimationFrame(animate);

    return;

  }
  // pause
  if (gamePaused) {

    drawGameWorld();

    drawHUD();

    displayPauseScreen();

    requestAnimationFrame(animate);

    return;
  }
  // UPDATE VEHICLE

  waterVehicle.updateVehicle();

  // DISTANCE TRAVELLED

  distanceTravelled +=
    Math.abs(waterVehicle.velocityX) +
    Math.abs(waterVehicle.velocityY);

  // WEATHER
  waterVehicle.createWeatherCondition(
    weatherCondition
  );

  // OBSTACLE COLLISIONS
  checkObstacleCollisions();

  // SOLAR RECHARGING
  solarArea.checkBatteryRecharge(
    waterVehicle
  );

  // CALCULATE SCORE
  calculateScore();
  // DRAW WORLD
  drawGameWorld();
  // DISPLAY RECHARGE STATUS

  solarArea.displayRechargeStatus(
    waterVehicle
  );

  // DRAW HUD
  drawHUD();

  // CLEAR COLLISION MESSAGE
  if (collisionMessage !== "") {
    setTimeout(function () {
      collisionMessage = "";

    }, 500);

  }
// NEXT FRAME
  requestAnimationFrame(animate);

}

// BACKGROUND MUSIC

function playMusic() {

  const backgroundMusic =
    document.getElementById(
      "backgroundMusic"
    );


  if (backgroundMusic) {

    backgroundMusic.play();

  }

}

// START ANIMATION
displayStartScreen();
animate();
