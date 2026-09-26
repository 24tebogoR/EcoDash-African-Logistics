const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");

canvas.width = 900;

canvas.height = 500;

// Enviromental condtions 
let weatherCondition = "Rainy";

// Create Water Delivery Vehicle Class

class WaterVehicle {
  constructor(x, y, width, height, color) {
    this.x = x;

    this.y = y;

    this.width = width;

    this.height = height;

    this.color = color;

    // vehicle direction
    this.angle = 0;

    // vehicle velocity and acceleration
    this.velocityX = 0;

    this.velocityY = 0;

    this.acceleration = 0.3;

    this.maxSpeed = 6;

    // current battery
    this.Battery = 100;
  }

  // create battery getter
  get battery() {
    return this.Battery;
  }

  // create battery setter
  set battery(value) {
    if (value < 0) {
      this.Battery = 0;
    } else if (value > 100) {
      this.Battery = 100;
    } else {
      this.Battery = value;
    }
  }

  // draw the water vehicle
  draw() {
    ctx.fillStyle = this.color;

    ctx.fillRect(this.x, this.y, this.width, this.height);

    // draw water tank
    ctx.fillStyle = "blue";

    ctx.fillRect(this.x + 15, this.y - 12, 30, 12);

    // draw front of vehicle
    ctx.fillStyle = "gray";

    ctx.fillRect(this.x + this.width - 5, this.y + 5, 5, 15);
  }

  // draw battery
  drawBattery() {
    ctx.fillStyle = "black";

    ctx.font = "17px Calibri";

    ctx.fillText("Battery: " + Math.round(this.battery) + "%",20,30);

  }

  // create vehicle movement
  updateVehicle() {

    // chnage vehicle direction
    this.angle = 0;

    // trig movement
    this.velocityX += Math.cos(this.angle) * this.acceleration;

    this.velocityY += Math.sin(this.angle) * this.acceleration;

    //apply friction to vehiclee
    this.velocityX *= 0.98;
    this.velocityY *= 0.98;

    // limit the horizontal speed of the vehicle
    if (this.velocityX > this.maxSpeed) {
      this.velocityX = this.maxSpeed;
    }

    if (this.velocityX < -this.maxSpeed) {
      this.velocityX = -this.maxSpeed;
    }

    // limit the vertical speed of the vehicle
    if (this.velocityY > this.maxSpeed) {
      this.velocityY = this.maxSpeed;
    }

    if (this.velocityY < -this.maxSpeed) {
      this.velocityY = -this.maxSpeed;
    }


    //update vehicle position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // keep vehicle within canvas
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

    // reduce battery while vehicle is moving

    if (this.velocityX !== 0 || this.velocityY !== 0) {
      this.battery -= 0.03
    }
  }

  // create collisons detector
  checkCollission(obstacles) {
    if (
      this.x < obstacles.x + obstacles.width &&
      this.x + this.width > obstacles.x &&
      this.y < obstacles.y + obstacles.height &&
      this.y + this.height > obstacles.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  // create enviromental condition
  createWeatherCondition(weather) {
    if (weather == "Rainy") {
      this.velocityX *= 0.99;
      this.velocityY *= 0.99;

    }
  }

  // display collsions message
  displayCollisionMessage(message) {
    ctx.fillStyle = "red";

    ctx.font = "17px Calibri";

    ctx.fillText(message, 20, 80);
  }

  // display weeather message
  displayWeather() {
    ctx.fillStyle = "black";

    ctx.font = "17px Calibri";

    ctx.fillText(
      "Weather: " + weatherCondition,
      20,
      105
    );

  }


}

// Create Solar Energy Grid Class

class SolarEnergyGrid {
  constructor(x, y, width, height) {
    this.x = x;

    this.y = y;

    this.width = width;

    this.height = height;

    this.solarRechargeRate = 0.5;
  }

  // draw the solar energy grid area
  drawSolarArea() {
    ctx.fillStyle = "yellow";

    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "black";

    ctx.font = "16px Calibri";

    ctx.fillText("Solar Energy Grid", this.x + 15, this.y + 25);
  }

  // create "boundary" to check if vehicle is inside the solar area

  checkBatteryRecharge(vehicle) {
    if (
        vehicle.x < this.x + this.width &&
        vehicle.x + vehicle.width > this.x &&
        vehicle.y < this.y + this.height &&
        vehicle.y + vehicle.height > this.y
    ) {
        vehicle.battery += this.solarRechargeRate;
    }
  }

  // display battery recharge status 
  displayRechargeStatus(vehicle) {
    if(
      vehicle.x < this.x + this.width &&
      vehicle.x + vehicle.width > this.x &&
      vehicle.y < this.y + this.height &&
      vehicle.y + vehicle.height > this.y
    ) {
      ctx.fillStyle = "green";
      ctx.font = "17px Calibri";

      ctx.fillText(
        "Time to Recharge!",
        20,
        55
      );
    }   

  }
}

// Curate Obstacles Class

class Obstacles {
  constructor(x,y, width, height, type, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.color = color;
  }

  // develop the obtacle(draw)

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
}

// Create water delivery vehicle

const waterVehicle = new WaterVehicle(150, 250, 60, 35, "blue");

// Create solar energy grid

const solarArea = new SolarEnergyGrid(600, 220, 180, 100);

// Create Obstacles

// 1. undeveloped/damaged road
const pothole = new Obstacles(350,250,60,35,"Pothole","Brown");
// 2. Fallen tree
const fallenTree = new Obstacles(470,250,90,35,"Fallen Tree","Green");
// 3. river
const river = new Obstacles(650,350,150,50,"River","lightblue");


// Create animation function

function animate() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // update the delivery vehicle
  waterVehicle.updateVehicle();

  //apply weather condition
  waterVehicle.createWeatherCondition(weatherCondition);

  // check if vehicle hits pothole
  if (waterVehicle.checkCollission(pothole)) {
    waterVehicle.displayCollisionMessage("Pothole! Vehicle slowed down")
    waterVehicle.velocityX = 2;
    
  }

  // vehicle hits tree
  if (waterVehicle.checkCollission(fallenTree)) {
    waterVehicle.displayCollisionMessage("Fallen Tree! Route Blocked")
    waterVehicle.velocityX = 0;
    waterVehicle.velocityY = 0;
  }

  // vehicle enters river
  if (waterVehicle.checkCollission(river)) {
    waterVehicle.displayCollisionMessage("River! Vehicle speed reducing")
    waterVehicle.velocityX *= 0.5;
    waterVehicle.velocityY *= 0.5;
  }
  
  
  //check if the vehicle is in the dedicated solar area
  solarArea.checkBatteryRecharge(waterVehicle);

  // draw recharge status bar
  solarArea.displayRechargeStatus(waterVehicle);

  // draw the solar energy grid
  solarArea.drawSolarArea();

  // draw obstacles
  pothole.drawObstacle();
  fallenTree.drawObstacle();
  river.drawObstacle();

  // draw the water vehicle
  waterVehicle.draw();

  waterVehicle.drawBattery();

  //display weather
  waterVehicle.displayWeather();

  // repeat animation
  requestAnimationFrame(animate);
}

// Start animation

animate();
