// AQUALINK - RURAL WATER DELIVERY SIMULATOR

// Canvas setup
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

// Game State Variables
let weatherCondition = "Rainy";
let gameStarted = false;
let gamePaused = false;
let gameOver = false;

let distanceTravelled = 0;
let score = 0;
let highScore = 0;
let totalBatteryUsed = 0;

let collisionMessage = "";
let collisionTimer = 0;
let housesDelivered = 0;

// Keyboard Controls State
let keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

// Event Listeners for Arrow Key Controls
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    keys.up = true;
    event.preventDefault();
  }
  if (event.key === "ArrowDown") {
    keys.down = true;
    event.preventDefault();
  }
  if (event.key === "ArrowLeft") {
    keys.left = true;
    event.preventDefault();
  }
  if (event.key === "ArrowRight") {
    keys.right = true;
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowUp") keys.up = false;
  if (event.key === "ArrowDown") keys.down = false;
  if (event.key === "ArrowLeft") keys.left = false;
  if (event.key === "ArrowRight") keys.right = false;
});

// Load Saved High Score from Local Storage
let savedHighScore = localStorage.getItem("aquaLinkHighScore");
if (savedHighScore !== null) {
  highScore = Number(savedHighScore);
}

// Water Delivery Vehicle Class
class WaterVehicle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = 0.25;
    this.maxSpeed = 4;
    this.Battery = 100;
    this.isBlocked = false;
  }

  // Encapsulation: Getter and Setter for Battery level to keep bounds between 0 and 100
  get battery() {
    return this.Battery;
  }

  set battery(value) {
    if (value < 0) {
      this.Battery = 0;
    } else if (value > 100) {
      this.Battery = 100;
    } else {
      this.Battery = value;
    }
  }

  // Render the vehicle, tank, cabin, and wheels onto the canvas
  draw() {
    // Main vehicle body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y + 5, this.width, this.height - 10);

    // Water tank
    ctx.fillStyle = "lightblue";
    ctx.fillRect(this.x + 5, this.y + 4, 35, 23);

    // Water tank outline
    ctx.strokeStyle = "darkblue";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 5, this.y + 4, 35, 23);

    // Driver cabin
    ctx.fillStyle = "steelblue";
    ctx.fillRect(this.x + 40, this.y + 7, 15, 20);

    // Window
    ctx.fillStyle = "aliceblue";
    ctx.fillRect(this.x + 43, this.y + 9, 9, 8);

    // Front bumper
    ctx.fillStyle = "dimgray";
    ctx.fillRect(this.x + this.width - 3, this.y + 22, 6, 5);

    // Wheels
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x + 15, this.y + this.height, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x + 48, this.y + this.height, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Update vehicle physics, velocity limits, friction, and boundaries
  updateVehicle() {
    let moving = false;

    // Apply acceleration based on key inputs
    if (keys.up) {
      this.velocityY -= this.acceleration;
      moving = true;
    }
    if (keys.down) {
      this.velocityY += this.acceleration;
      moving = true;
    }
    if (keys.left) {
      this.velocityX -= this.acceleration;
      moving = true;
    }
    if (keys.right) {
      this.velocityX += this.acceleration;
      moving = true;
    }

    // Limit horizontal speed
    if (this.velocityX > this.maxSpeed) this.velocityX = this.maxSpeed;
    if (this.velocityX < -this.maxSpeed) this.velocityX = -this.maxSpeed;

    // Limit vertical speed
    if (this.velocityY > this.maxSpeed) this.velocityY = this.maxSpeed;
    if (this.velocityY < -this.maxSpeed) this.velocityY = -this.maxSpeed;

    // Apply friction to slow down naturally
    this.velocityX *= 0.98;
    this.velocityY *= 0.98;

    // Save previous position before updating (used for collision rollback)
    let previousX = this.x;
    let previousY = this.y;

    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Enforce canvas boundaries
    if (this.x < 0) {
      this.x = 0;
      this.velocityX = 0;
    }
    if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
      this.velocityX = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.velocityY = 0;
    }
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.velocityY = 0;
    }

    // Consume battery if moving (slightly faster rate)
    if (moving && (this.velocityX !== 0 || this.velocityY !== 0)) {
      this.battery -= 0.06;
      totalBatteryUsed += 0.06;
    }

    // Trigger game over if battery is depleted
    if (this.battery <= 0) {
      endGame();
    }

    return { previousX: previousX, previousY: previousY };
  }

  // Axis-Aligned Bounding Box (AABB) Collision Detection
  checkCollission(object) {
    return (
      this.x < object.x + object.width &&
      this.x + this.width > object.x &&
      this.y < object.y + object.height &&
      this.y + this.height > object.y
    );
  }

  // Apply environmental weather physics (e.g., rain drag)
  createWeatherCondition(weather) {
    if (weather === "Rainy") {
      this.velocityX *= 0.99;
      this.velocityY *= 0.99;
    }
  }

  // Display temporary collision or event messages
  displayCollisionMessage(message) {
    collisionMessage = message;
    collisionTimer = 120;
  }
}

// Solar Energy Grid Class (Recharge Station)
class SolarEnergyGrid {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.solarRechargeRate = 0.5;
  }

  // Draw the recharge station and solar panels
  drawSolarArea() {
    ctx.fillStyle = "khaki";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Solar panels
    ctx.fillStyle = "darkslategray";
    ctx.fillRect(this.x + 12, this.y + 20, 45, 30);
    ctx.fillRect(this.x + 72, this.y + 20, 45, 30);

    // Solar panel grid lines
    ctx.strokeStyle = "lightskyblue";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + 12, this.y + 35);
    ctx.lineTo(this.x + 57, this.y + 35);
    ctx.moveTo(this.x + 34, this.y + 20);
    ctx.lineTo(this.x + 34, this.y + 50);
    ctx.moveTo(this.x + 72, this.y + 35);
    ctx.lineTo(this.x + 117, this.y + 35);
    ctx.moveTo(this.x + 94, this.y + 20);
    ctx.lineTo(this.x + 94, this.y + 50);
    ctx.stroke();

    // Panel supports
    ctx.fillStyle = "gray";
    ctx.fillRect(this.x + 32, this.y + 50, 4, 15);
    ctx.fillRect(this.x + 92, this.y + 50, 4, 15);

    // Label
    ctx.fillStyle = "black";
    ctx.font = "13px Calibri";
    ctx.fillText("Solar Grid", this.x + 35, this.y + 70);
  }

  // Recharge vehicle battery if inside the solar zone
  checkBatteryRecharge(vehicle) {
    if (vehicle.checkCollission(this)) {
      vehicle.battery += this.solarRechargeRate;
    }
  }

  // Show active recharge text indicator
  displayRechargeStatus(vehicle) {
    if (vehicle.checkCollission(this)) {
      ctx.fillStyle = "green";
      ctx.font = "15px Calibri";
      ctx.fillText("Solar Recharge Active", this.x, this.y - 8);
    }
  }
}

// Obstacles Class (Potholes, Fallen Trees, Rivers)
class Obstacles {
  constructor(x, y, width, height, type, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.color = color;
  }

  // Draw standard obstacle
  drawObstacle() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "black";
    ctx.font = "14px Calibri";
    ctx.fillText(this.type, this.x + 5, this.y + 20);
  }

  // Draw specialized river obstacle with wave lines
  drawRiver() {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Water flow lines matching road width
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(this.x + 15, this.y + 15);
    ctx.lineTo(this.x + 45, this.y + 15);
    ctx.moveTo(this.x + 55, this.y + 25);
    ctx.lineTo(this.x + 85, this.y + 25);
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "14px Calibri";
    ctx.fillText("River Crossing", this.x + 10, this.y + 24);
  }
}

// House Class (Delivery Destinations)
class House {
  constructor(x, y, width, height, name) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.name = name;
    this.delivered = false;
  }

  // Render house structure, roof, and delivery status
  drawHouse() {
    // House body
    ctx.fillStyle = "tan";
    ctx.fillRect(this.x, this.y + 15, this.width, this.height - 15);

    // Roof
    ctx.fillStyle = "saddlebrown";
    ctx.beginPath();
    ctx.moveTo(this.x - 5, this.y + 15);
    ctx.lineTo(this.x + this.width / 2, this.y - 12);
    ctx.lineTo(this.x + this.width + 5, this.y + 15);
    ctx.closePath();
    ctx.fill();

    // Door
    ctx.fillStyle = "sienna";
    ctx.fillRect(this.x + 22, this.y + 32, 14, 23);

    // Window
    ctx.fillStyle = "powderblue";
    ctx.fillRect(this.x + 42, this.y + 22, 14, 14);

    // House label
    ctx.fillStyle = "black";
    ctx.font = "13px Calibri";
    ctx.fillText(this.name, this.x, this.y + this.height + 15);

    // Delivery status indicator
    if (this.delivered) {
      ctx.fillStyle = "green";
      ctx.font = "bold 12px Calibri";
      ctx.fillText("Water Delivered", this.x - 5, this.y + this.height + 30);
    }
  }
}

// Instantiate Game Objects
const waterVehicle = new WaterVehicle(50, 250, 60, 35, "dodgerblue");
const solarArea = new SolarEnergyGrid(680, 230, 130, 80);

const pothole = new Obstacles(320, 100, 60, 35, "Pothole", "saddlebrown");
const fallenTree = new Obstacles(475, 390, 90, 35, "Fallen Tree", "forestgreen");
const river = new Obstacles(680, 410, 100, 40, "River", "lightblue");

// Houses placed securely away from the top-left HUD dashboard
const house1 = new House(100, 370, 60, 55, "House 1"); // Moved to bottom-left grass area
const house2 = new House(580, 110, 60, 55, "House 2"); // Above main road
const house3 = new House(800, 360, 60, 55, "House 3"); // Below main road near side road 3

let houses = [house1, house2, house3];

// Draw Environment Background, Roads, and Scenery
function drawEnviroment() {
  // Grass background
  ctx.fillStyle = "darkseagreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Main road
  ctx.fillStyle = "rosybrown";
  ctx.fillRect(0, 210, canvas.width, 120);

  ctx.fillStyle = "lightyellow";
  ctx.fillRect(0, 268, canvas.width, 5);

  // Side road 1
  ctx.fillStyle = "rosybrown";
  ctx.fillRect(300, 0, 100, 210);

  ctx.fillStyle = "lightyellow";
  ctx.fillRect(347, 0, 5, 210);

  // Side road 2
  ctx.fillStyle = "rosybrown";
  ctx.fillRect(470, 330, 100, 170);

  ctx.fillStyle = "lightyellow";
  ctx.fillRect(517, 330, 5, 170);

  // Side road 3
  ctx.fillStyle = "rosybrown";
  ctx.fillRect(680, 330, 100, 170);

  ctx.fillStyle = "lightyellow";
  ctx.fillRect(727, 330, 5, 170);

  // Rural trees (positioned in bottom-left and other scenic areas)
  drawTree(50, 360);
  drawTree(180, 430);
  drawTree(830, 100);
  drawTree(850, 300);
  drawTree(230, 360);
  drawTree(410, 150);
  drawTree(610, 80);
}

// Helper to draw trees
function drawTree(x, y) {
  ctx.fillStyle = "saddlebrown";
  ctx.fillRect(x, y, 20, 50);

  ctx.fillStyle = "forestgreen";
  ctx.beginPath();
  ctx.arc(x + 10, y, 30, 0, Math.PI * 2);
  ctx.fill();
}

// Handle Collisions with Blocked Routes / Obstacles
function checkObstacleCollisions(previousX, previousY) {
  if (waterVehicle.checkCollission(pothole)) {
    waterVehicle.x = previousX;
    waterVehicle.y = previousY;
    waterVehicle.velocityX = 0;
    waterVehicle.velocityY = 0;
    waterVehicle.displayCollisionMessage("Pothole! Route blocked - use another road.");
  }

  if (waterVehicle.checkCollission(fallenTree)) {
    waterVehicle.x = previousX;
    waterVehicle.y = previousY;
    waterVehicle.velocityX = 0;
    waterVehicle.velocityY = 0;
    waterVehicle.displayCollisionMessage("Fallen Tree! Route blocked - find another route.");
  }

  if (waterVehicle.checkCollission(river)) {
    waterVehicle.x = previousX;
    waterVehicle.y = previousY;
    waterVehicle.velocityX = 0;
    waterVehicle.velocityY = 0;
    waterVehicle.displayCollisionMessage("River Crossing! Route blocked - use an alternate road.");
  }
}

// Check House Deliveries
function checkHouseDelivery() {
  for (let i = 0; i < houses.length; i++) {
    let house = houses[i];

    if (!house.delivered && waterVehicle.checkCollission(house)) {
      house.delivered = true;
      housesDelivered++;
      score += 100;
      collisionMessage = "Water delivered to " + house.name + "!";
      collisionTimer = 120;
    }
  }
}

// Calculate Energy Efficiency Percentage
function calculateEnergyEfficiency() {
  if (distanceTravelled <= 0 || totalBatteryUsed <= 0) {
    return 100;
  }

  let efficiency = (distanceTravelled / (distanceTravelled + totalBatteryUsed)) * 100;

  if (efficiency > 100) efficiency = 100;
  if (efficiency < 0) efficiency = 0;

  return Math.round(efficiency);
}

// Calculate Final Score and Update High Score in Local Storage
function calculateScore() {
  let efficiency = calculateEnergyEfficiency();

  score = Math.round(distanceTravelled) + efficiency + (housesDelivered * 100);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("aquaLinkHighScore", highScore);
  }
}

// Draw Heads-Up Display (HUD)
function drawHUD() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.90)";
  ctx.fillRect(10, 10, 255, 190);

  ctx.fillStyle = "darkblue";
  ctx.font = "bold 18px Calibri";
  ctx.fillText("AquaLink", 20, 32);

  ctx.fillStyle = "black";
  ctx.font = "14px Calibri";
  ctx.fillText("Battery: " + Math.round(waterVehicle.battery) + "%", 20, 55);
  ctx.fillText("Distance: " + Math.round(distanceTravelled) + " km", 20, 77);
  ctx.fillText("Score: " + score, 20, 99);
  ctx.fillText("High Score: " + highScore, 20, 121);
  ctx.fillText("Efficiency: " + calculateEnergyEfficiency() + "%", 20, 143);
  ctx.fillText("Deliveries: " + housesDelivered + "/3", 20, 165);
  ctx.fillText("Weather: " + weatherCondition, 20, 187);

  if (collisionMessage !== "") {
    ctx.fillStyle = "firebrick";
    ctx.font = "bold 16px Calibri";
    ctx.fillText(collisionMessage, 285, 30);
  }
}

// Screen Overlays (Start, Pause, Game Over)
function displayStartScreen() {
  ctx.fillStyle = "darkgreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "bold 42px Arial";
  ctx.fillText("AquaLink", canvas.width / 2, 170);

  ctx.font = "22px Arial";
  ctx.fillText("Rural Water Delivery Simulator", canvas.width / 2, 215);

  ctx.font = "17px Arial";
  ctx.fillText("Deliver water to 3 rural households.", canvas.width / 2, 260);
  ctx.fillText("Use the arrow keys and avoid blocked routes.", canvas.width / 2, 290);

  ctx.font = "bold 18px Arial";
  ctx.fillText("Press START GAME to begin", canvas.width / 2, 345);

  ctx.textAlign = "left";
}

function displayPauseScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 40px Arial";
  ctx.fillText("GAME PAUSED", canvas.width / 2, 230);

  ctx.font = "18px Arial";
  ctx.fillText("Press PAUSE again to continue", canvas.width / 2, 270);

  ctx.textAlign = "left";
}

function displayGameOverScreen() {
  ctx.fillStyle = "darkolivegreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "bold 40px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2, 150);

  ctx.font = "20px Arial";
  ctx.fillText("Final Score: " + score, canvas.width / 2, 210);
  ctx.fillText("High Score: " + highScore, canvas.width / 2, 245);
  ctx.fillText("Water Deliveries: " + housesDelivered + "/3", canvas.width / 2, 280);
  ctx.fillText("Distance: " + Math.round(distanceTravelled) + " km", canvas.width / 2, 315);

  ctx.font = "bold 18px Arial";
  ctx.fillText("Press RESTART to try again", canvas.width / 2, 370);

  ctx.textAlign = "left";
}

// Game State Control Functions
function startGame() {
  gameStarted = true;
  gamePaused = false;
  gameOver = false;

  playMusic();

  document.getElementById("startButton").style.display = "none";
  document.getElementById("pauseButton").style.display = "inline-block";
}

function pauseGame() {
  if (!gameStarted || gameOver) return;

  gamePaused = !gamePaused;
  let pauseButton = document.getElementById("pauseButton");

  if (gamePaused) {
    pauseButton.textContent = "RESUME";
  } else {
    pauseButton.textContent = "PAUSE";
  }
}

function endGame() {
  gameOver = true;
  gamePaused = false;

  document.getElementById("pauseButton").style.display = "none";
  document.getElementById("restartButton").style.display = "inline-block";

  calculateScore();
}

function restartGame() {
  waterVehicle.x = 50;
  waterVehicle.y = 250;
  waterVehicle.velocityX = 0;
  waterVehicle.velocityY = 0;
  waterVehicle.battery = 100;

  distanceTravelled = 0;
  totalBatteryUsed = 0;
  score = 0;
  housesDelivered = 0;
  collisionMessage = "";
  collisionTimer = 0;

  gameStarted = true;
  gamePaused = false;
  gameOver = false;

  // Reset house states
  house1.delivered = false;
  house2.delivered = false;
  house3.delivered = false;

  document.getElementById("restartButton").style.display = "none";
  document.getElementById("pauseButton").style.display = "inline-block";
  document.getElementById("pauseButton").textContent = "PAUSE";
}

// Draw Entire Game World Elements
function drawGameWorld() {
  drawEnviroment();

  house1.drawHouse();
  house2.drawHouse();
  house3.drawHouse();

  solarArea.drawSolarArea();

  pothole.drawObstacle();
  fallenTree.drawObstacle();
  river.drawRiver();

  waterVehicle.draw();
  drawHUD();
}

// Main Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Handle Start Screen
  if (!gameStarted && !gameOver) {
    displayStartScreen();
    requestAnimationFrame(animate);
    return;
  }

  // Handle Game Over Screen
  if (gameOver) {
    displayGameOverScreen();
    requestAnimationFrame(animate);
    return;
  }

  // Handle Pause Screen
  if (gamePaused) {
    drawGameWorld();
    displayPauseScreen();
    requestAnimationFrame(animate);
    return;
  }

  // Update vehicle physics and fetch previous position
  let previousPosition = waterVehicle.updateVehicle();

  // Track distance travelled slower and more realistically
  distanceTravelled += (Math.abs(waterVehicle.velocityX) + Math.abs(waterVehicle.velocityY)) * 0.05;

  // Apply weather factors
  waterVehicle.createWeatherCondition(weatherCondition);

  // Check environment interactions
  checkObstacleCollisions(previousPosition.previousX, previousPosition.previousY);
  checkHouseDelivery();
  solarArea.checkBatteryRecharge(waterVehicle);
  calculateScore();

  // Countdown message timer
  if (collisionTimer > 0) {
    collisionTimer--;
  } else {
    collisionMessage = "";
  }

  // Draw world and active recharge indicators
  drawGameWorld();
  solarArea.displayRechargeStatus(waterVehicle);

  // Loop animation
  requestAnimationFrame(animate);
}

// Background Music 
function playMusic() {
  const backgroundMusic = document.getElementById("backgroundMusic");
  if (backgroundMusic) {
    backgroundMusic.volume = 0.5; // Set volume to 50%
    backgroundMusic.play().then(() => {
      console.log("Khusela is playing successfully!");
    }).catch(error => {
      console.log("Playback failed. Check if the audio file path is correct.", error);
    });
  }
}
// Initialize and Start Simulation Animation Loop
animate();
