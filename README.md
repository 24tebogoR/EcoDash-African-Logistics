# AquaLink- an HTML5 Canvas simulation of rural water delivery challenges in South Africa
Firstly, AquaLink aims to provide water access and delivery to rural communities within South Africa. In many rural communities there is a lack of reliable water. In some areas the water may be far away to fetch or there may be unreliable water sources and inadequate infrastructure. In a study on water security in 14 rural villages in Vhmebe District, South Africa, 448 households participated in a study by Malima and Pindihama(2022). The study found that all rural villages utilized various water sources and that boreholes were used as a significant water source. Additionally, a large amount of time was also spent on water gathering by households. Only 28% of the 38 boreholes in the villages were in use. Water tankers were also used as an emergency water source, but reliability of this source was also an issue. Furthermore, Mpongwana, Shumba and Bracking (2022) also looked at water insecurity among rural households within Limpopo and the Eastern Cape in Goboti and Khubvi. They found water availability among rural households to be unequal and that water insecurity was a problem among households in resource-scarce rural areas. Moreover, Matimolane et al. (2023) have also found water scarcity, inadequate water distribution infrastructure and difficulties in meeting water provision in the rural areas of Limpopo. That said, data from 478 households were used in this study. Many households were found to be using rainwater harvesting as a complement to the available water supply. 

# AquaLink's Solution
AquaLink represents a simplified digital model of rural water delivery. The simulation uses an electric water-delivery vehicle that travels through a rural environment while managing its available battery. The vehicle must navigate environmental obstacles such as potholes, fallen trees and rivers while travelling to a Solar Energy Grid to recharge its battery.

The project therefore connects three real-world ideas: rural water delivery, transportation and infrastructure limitations and sustainable energy for electric transport. Also, the simulation does not attempt to reproduce the entire South African water system. Instead, it emphasizes how transportation, energy and environmental conditions can affect the delivery process. 

# Mathematical and Physics Model
Mathematics and Physics has been used to simulate how the AquaLink vehicle moves and responds to its enviroment.

1. # Vehicle Speed and Velocity - horizontal and vertical velocity
   this.velocityX = 0;
   this.velocityY = 0;
   Furthermore, its position is updated using its velocity, this allows the vehicle to move across the enviroment.
   this.x += this.velocityX;
   this.y += velocityY;

2. # Trigonometry and Direction
   Math.cos() - calculates the horizontal component of the vehicles movement
   Math.sin() - calculates the vertical component of the vehicles movement
   The vehicles direction is represented using an angle. This allows the simulation to connect the vehicles direction with its movement across the canvas.

3. # Friction
   The simulation applies frictio to the vehicle's velocity:
   this.velocityX *= 0.98;
   this.velocityY *= 0.98;
   This gradually reduces the vehicles velocity.

4. # Battery Consumption
    The electric vehicle consumes battery energy while moving: if ( this.velocityX !== 0 || this.velocityY !== 0) {
      this.battery -= 0.03; This creates an energy management element in the simulation.

5. # Solar Energy Recharge
   The vehicle can recharge when it enters the Solar Energy Grid/area. The simulation uses rectangle overlap calculations to determine whether
   the vehicle has entered the solar area. When the overlap is detected, the battery increases according to the solar recharge rate.
   This represents the use of renewable energy to support an electric water-delivery vehicle.

6. # Collisions Calculations
   AquaLink uses collision detection to detect when the vehicle interacts with the environmental obstacles.
   The vehicle and each obstacle have: An X position, A y position, a width and height.
   The simulation compares these values to determine whether the rectangle areas overlap.
   Different obstacles then affect the vehicle differently: a pothole reduces speed speed, a fallen tree can block the route and
   a river reduces vehicle movement.

