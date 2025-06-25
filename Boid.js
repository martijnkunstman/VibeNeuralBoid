import { Vector } from './Vector.js';
// --- Boid Class 
export class Boid {
    constructor(x, y, radius = 15) {
        // state
        this.position = new Vector(x, y);
        this.orientation = 0;    // radians
        this.speed = 0;          // px/sec'
        this.radius = radius;
        this.lifespan = 5000;     // lifespan in seconds

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

    eat(food) {
        this.lifespan += food.nutrition;
    }

    update(dt) {

        this.lifespan -= 1;

        if (this.lifespan <= 0) {
            this.dead = true;
            return;
        }
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

        // Draw boid as a circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#0f0';
        ctx.fill();
        ctx.strokeStyle = '#080';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw velocity as a line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.strokeStyle = '#00f';
        ctx.lineWidth = 2;
        ctx.lineTo(this.speed * 0.2, 0); // scale velocity for visibility
        ctx.stroke();

        // Draw steering direction as a line
        const steerLineLength = this.speed * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.strokeStyle = '#f0f';
        ctx.lineWidth = 2;
        ctx.lineTo(steerLineLength * Math.cos(this.steer), steerLineLength * Math.sin(this.steer));
        ctx.stroke();

        // Visualize input around boid
        // W (forward) - top
        if (this.keys['w']) {
            ctx.beginPath();
            ctx.arc(this.radius + 8, 0, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff0';
            ctx.fill();
        }
        // S (brake) - bottom
        if (this.keys['s']) {
            ctx.beginPath();
            ctx.arc(-this.radius - 8, 0, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#f00';
            ctx.fill();
        }
        // A (left) - left
        if (this.keys['a']) {
            ctx.beginPath();
            ctx.arc(0, -this.radius - 8, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#0ff';
            ctx.fill();
        }
        // D (right) - right
        if (this.keys['d']) {
            ctx.beginPath();
            ctx.arc(0, this.radius + 8, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#f0f';
            ctx.fill();
        }

        // Show lifespan as a number, horizontally centered above the circle, not rotated
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to avoid rotation/translation
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        const text = Math.round(this.lifespan).toString();
        const textWidth = ctx.measureText(text).width;
        // Calculate screen position of text
        const screenX = this.position.x - textWidth / 2;
        const screenY = this.position.y - this.radius - 14;
        ctx.fillText(text, screenX, screenY);
        ctx.restore();

        ctx.restore();
    }
}