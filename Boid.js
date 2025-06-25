import { Vector } from './Vector.js';
// --- Boid Class 
export class Boid {
    constructor(x, y, radius = 10) {
        // state
        this.position = new Vector(x, y);
        this.orientation = 0;    // radians
        this.speed = 0;          // px/sec'
        this.radius = radius;

        // configurable properties
        this.wheelBase = 40;        // distance between axles
        this.maxSteer = Math.PI / 4;  // max wheel angle
        this.engineForce = 300;     // accel force
        this.brakeForce = 400;      // braking force
        this.drag = 0.02;           // linear drag coefficient
        this.maxSpeed = 500;        // max forward speed

        // steering state
        this.steer = 0;             // current steering angle
        this.steerDirection = 0;    // directional input accumulator

        // input state
        this.keys = { w: false, a: false, s: false, d: false };
        window.addEventListener('keydown', e => {
            const k = e.key.toLowerCase(); if (k in this.keys) this.keys[k] = true;
        });
        window.addEventListener('keyup', e => {
            const k = e.key.toLowerCase(); if (k in this.keys) this.keys[k] = false;
        });
    }

    update(dt) {
        // handle acceleration/braking
        if (this.keys['w']) {
            this.speed += this.engineForce * dt;
        }
        if (this.keys['s']) {
            this.speed -= this.brakeForce * dt;
        }

        // apply drag
        this.speed -= this.speed * this.drag;

        // clamp speed
        this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed));

        // steering input
        if (this.keys['a']) this.steerDirection -= this.maxSteer / 10;
        if (this.keys['d']) this.steerDirection += this.maxSteer / 10;

        // clamp input accumulator
        this.steerDirection = Math.max(-this.maxSteer, Math.min(this.steerDirection, this.maxSteer));

        // damp if both pressed
        if (this.keys['a'] && this.keys['d']) {
            this.steerDirection *= 0.8;
        }

        // update steering angle
        this.steer += this.steerDirection;
        this.steer = Math.max(-this.maxSteer, Math.min(this.steer, this.maxSteer));

        // gradual return to center when no input
        this.steer *= 0.8;
        if (!this.keys['a'] && !this.keys['d']) {
            this.steerDirection = 0;
        }

        // update orientation based on kinematic bicycle model
        if (this.speed > 0) {
            const turnRate = (this.speed / this.wheelBase) * Math.tan(this.steer);
            this.orientation += turnRate * dt;
        }

        // move boid
        const velocity = Vector.fromAngle(this.orientation).mult(this.speed * dt);
        this.position.add(velocity);
    }

    edges(world) {
        if (this.position.x < -this.radius) this.position.x = world.width + this.radius;
        if (this.position.x > world.width + this.radius) this.position.x = -this.radius;
        if (this.position.y < -this.radius) this.position.y = world.height + this.radius;
        if (this.position.y > world.height + this.radius) this.position.y = -this.radius;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.orientation);
        // body
        ctx.fillStyle = '#0f0';
        ctx.fillRect(-20, -10, 40, 20);
        // wheels
        ctx.fillStyle = '#555';
        ctx.fillRect(-15, -12, 8, 4);
        ctx.fillRect(-15, 8, 8, 4);
        ctx.fillRect(7, -12, 8, 4);
        ctx.fillRect(7, 8, 8, 4);
        ctx.restore();
    }
}