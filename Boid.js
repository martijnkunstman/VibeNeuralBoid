import { Vector } from './Vector.js';
// --- Boid class ---
export class Boid {
  constructor(x, y, radius = 10, mass = 1, friction = 0.02, maxSpeed = 200) {
    this.position = new Vector(x, y);
    this.velocity = new Vector();
    this.acceleration = new Vector();
    this.radius = radius;
    this.mass = mass;
    this.friction = friction;
    this.maxSpeed = maxSpeed;
    this.orientation = 0; // radians
    this.thrustForce = 100; // magnitude of thrust
    this.rotationSpeed = Math.PI; // rad/s
  }

  applyForce(force) {
    // F = m * a => a = F / m
    this.acceleration.add(force.copy().div(this.mass));
  }

  update(dt) {
    // apply friction opposite to velocity
    let frictionForce = this.velocity.copy().mult(-1).setMag(this.friction * this.mass);
    this.applyForce(frictionForce);

    // update velocity & limit
    this.velocity.add(this.acceleration.mult(dt));
    this.velocity.limit(this.maxSpeed);

    // update position
    this.position.add(this.velocity.copy().mult(dt));
    
    // reset acceleration
    this.acceleration.mult(0);
  }

  edges(world) {
    if (this.position.x < -this.radius) this.position.x = world.width + this.radius;
    if (this.position.x > world.width + this.radius) this.position.x = -this.radius;
    if (this.position.y < -this.radius) this.position.y = world.height + this.radius;
    if (this.position.y > world.height + this.radius) this.position.y = -this.radius;
  }

  draw(ctx) {
    // draw boid as circle
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // velocity vector (green)
    ctx.strokeStyle = '#27ae60';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(
      this.position.x + this.velocity.x * 0.3,
      this.position.y + this.velocity.y * 0.3
    );
    ctx.stroke();

    // acceleration vector (red)
    ctx.strokeStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(
      this.position.x + this.acceleration.x * 200,
      this.position.y + this.acceleration.y * 200
    );
    ctx.stroke();
  }
}