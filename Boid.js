import { Vector } from './Vector.js';
// --- Boid class ---
export class Boid {
  constructor(x, y, radius = 10, mass = 1, friction = 0.08, maxSpeed = 1000) {
    this.position = new Vector(x, y);
    this.velocity = new Vector();
    this.acceleration = new Vector();
    this.radius = radius;
    this.mass = mass;
    this.friction = friction;
    this.maxSpeed = maxSpeed;  // increased top speed
    this.orientation = 0;
    this.engineForce = 1000;
    this.steerSpeed = 1;

    // input state
    this.keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase(); if (k in this.keys) this.keys[k] = true;
    });
    window.addEventListener('keyup', e => {
      const k = e.key.toLowerCase(); if (k in this.keys) this.keys[k] = false;
    });

    this.steerInput = 0;
  }

  applyForce(f) {
    this.acceleration.add(f.copy().div(this.mass));
  }

  update(dt) {
    // steering input smoothing
    const targetSteer = (this.keys['a'] ? -1 : 0) + (this.keys['d'] ? 1 : 0);
    this.steerInput += (targetSteer - this.steerInput) * Math.min(1, this.steerSpeed * dt);

    // orientation change: tighter turn radius
    const speed = this.velocity.mag();
    if (speed > 0.1) {
      const turnRadius = 30;
      this.orientation += (speed / turnRadius) * this.steerInput * dt;
    }

    // engine force
    if (this.keys['w']) {
      const f = Vector.fromAngle(this.orientation).mult(this.engineForce);
      this.applyForce(f);
    }
    if (this.keys['s']) {
      const f = Vector.fromAngle(this.orientation).mult(-this.engineForce * 0.5);
      this.applyForce(f);
    }

    // drag
    const drag = this.velocity.copy().mult(-1).setMag(this.friction * speed * speed);
    this.applyForce(drag);

    // integrate
    this.velocity.add(this.acceleration.mult(dt));
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity.copy().mult(dt));
    this.acceleration.mult(0);
  }

  edges(world) {
    if (this.position.x < -this.radius) this.position.x = world.width + this.radius;
    if (this.position.x > world.width + this.radius) this.position.x = -this.radius;
    if (this.position.y < -this.radius) this.position.y = world.height + this.radius;
    if (this.position.y > world.height + this.radius) this.position.y = -this.radius;
  }

  draw(ctx) {
    // car chassis
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.orientation);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-this.radius, -this.radius/2, this.radius * 2, this.radius);

    // wheels
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-this.radius, -this.radius/2 - 2, this.radius/3, 4);
    ctx.fillRect(-this.radius, this.radius/2 - 2, this.radius/3, 4);
    ctx.fillRect(this.radius - this.radius/3, -this.radius/2 - 2, this.radius/3, 4);
    ctx.fillRect(this.radius - this.radius/3, this.radius/2 - 2, this.radius/3, 4);
    ctx.restore();

    // draw vectors
    ctx.strokeStyle = '#27ae60';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x + this.velocity.x * 0.3, this.position.y + this.velocity.y * 0.3);
    ctx.stroke();

    ctx.strokeStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x + this.acceleration.x * 200, this.position.y + this.acceleration.y * 200);
    ctx.stroke();
  }
}