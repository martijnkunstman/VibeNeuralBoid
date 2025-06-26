import { Vector } from './Vector.js';
import { NeuralNetwork } from './NeuralNetwork.js';

// --- Sensor Configuration Constants ---
// Total angular coverage of sensors (in radians)
const SENSOR_TOTAL_ANGLE = Math.PI / 2;  // 90° total coverage
// Angle between adjacent sensor rays (in radians)
const SENSOR_ANGLE_STEP = Math.PI / 16;  // ~11.25° between sensors
// Reach of each sensor ray (in pixels)
const SENSOR_LENGTH = 500;

// --- Boid Class ---
export class Boid {
    constructor(x, y, radius = 15) {
        // state
        this.position = new Vector(x, y);
        this.orientation = 0;    // radians
        this.speed = 0;          // px/sec
        this.radius = radius;
        this.lifespan = 5000;    // lifespan in seconds

        // configurable properties
        this.wheelBase = 40;        // distance between axles
        this.maxSteer = Math.PI / 4; // max wheel angle
        this.engineForce = 300;     // accel force
        this.brakeForce = 400;      // braking force
        this.drag = 0.02;           // linear drag coefficient
        this.maxSpeed = 500;        // max forward speed

        // steering state
        this.steer = 0;             // current steering angle
        this.steerDirection = 0;    // directional input accumulator

        this.brain = new NeuralNetwork(
            9, // 9 sensor inputs
            [8, 8], // hidden layers with 8 neurons each
            4 // 4 outputs: forward, brake, steer left, steer right
        );

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

    update(dt, food) {
        this.lifespan -= 1;
        if (this.lifespan <= 0) {
            this.dead = true;
            return;
        }

        const inputs = this.getSensorData(food);
        const outputs = this.brain.feedForward(inputs);
        // outputs is [a, b, c, d] in (0,1)
        this.keys.w = outputs[0] > 0.5;  // accelerate
        this.keys.s = outputs[1] > 0.5;  // brake
        this.keys.a = outputs[2] > 0.5;  // steer left
        this.keys.d = outputs[3] > 0.5;  // steer right

        // handle acceleration/braking
        if (this.keys['w']) {
            this.speed += this.engineForce * dt;
        }
        if (this.keys['s']) {
            this.speed -= this.brakeForce * dt;
        }

        // apply drag and clamp speed
        this.speed -= this.speed * this.drag;
        this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed));

        // steering input accumulation
        if (this.keys['a']) this.steerDirection -= this.maxSteer / 10;
        if (this.keys['d']) this.steerDirection += this.maxSteer / 10;
        this.steerDirection = Math.max(-this.maxSteer, Math.min(this.steerDirection, this.maxSteer));
        if (this.keys['a'] && this.keys['d']) this.steerDirection *= 0.8;
        this.steer += this.steerDirection;
        this.steer = Math.max(-this.maxSteer, Math.min(this.steer, this.maxSteer));
        this.steer *= 0.8;
        if (!this.keys['a'] && !this.keys['d']) this.steerDirection = 0;

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

    /**
     * Get sensor data as an array of distances to the nearest food item in each sensor direction
     * @param {Food[]} foods - array of food objects with position (Vector) and radius
     * @returns {number[]} array of distances normalized to [0, 1]
     * @description
     * This method computes the distance from the boid to the nearest food item in each sensor direction.
     * It considers the wrapping of the world by checking all 9 possible positions of each food item
     * (original position and 8 neighbors in a toroidal world).         
     * The distances are normalized to the range [0, 1] based on SENSOR_LENGTH.
     */

    getSensorData(foods) {
        const data = [];
        const rayCount = Math.floor(SENSOR_TOTAL_ANGLE / SENSOR_ANGLE_STEP) + 1;
        const startAngle = -SENSOR_TOTAL_ANGLE / 2;
        for (let i = 0; i < rayCount; i++) {
            const angle = startAngle + i * SENSOR_ANGLE_STEP;
            let minDist = SENSOR_LENGTH;
            // same wrapping logic as drawSensors, but compute actual proj distance:
            for (let food of foods) {
                for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
                    const fx = food.position.x + dx * 1000;
                    const fy = food.position.y + dy * 1000;
                    const toF = new Vector(fx, fy).sub(this.position).rotate(-this.orientation);
                    const proj = toF.dot(Vector.fromAngle(angle));
                    if (proj > 0 && proj < minDist) {
                        const perp = Math.abs(toF.cross(Vector.fromAngle(angle)));
                        if (perp < food.radius) minDist = proj;
                    }
                }
            }
            data.push(minDist / SENSOR_LENGTH); // normalize [0,1]
        }
        return data;
    }


    /**
     * Draw sensor rays, highlighting those that intersect food items.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Food[]} foods - array of food objects with position (Vector) and radius
     */
    drawSensors(ctx, foods = []) {
        ctx.save();

        const rayCount = Math.floor(SENSOR_TOTAL_ANGLE / SENSOR_ANGLE_STEP) + 1;
        const startAngle = -SENSOR_TOTAL_ANGLE / 2;
        for (let i = 0; i < rayCount; i++) {
            const angle = startAngle + i * SENSOR_ANGLE_STEP;
            // direction vector in local space
            const dir = Vector.fromAngle(angle);

            // test intersection with each food in world coords, considering border wrapping
            let hit = false;
            for (let food of foods) {
                // Check all 9 possible wrapped positions (original + 8 neighbors)
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        // Compute wrapped food position
                        const fx = food.position.x + dx * ctx.canvas.width;
                        const fy = food.position.y + dy * ctx.canvas.height;
                        // vector from boid center to food in world coords
                        const toFoodWorld = new Vector(fx, fy).sub(this.position);
                        // rotate into boid-local coords
                        const toFoodLocal = toFoodWorld.copy().rotate(-this.orientation);
                        const proj = toFoodLocal.dot(dir);
                        if (proj > 0 && proj < SENSOR_LENGTH) {
                            const perpDist = Math.abs(toFoodLocal.cross(dir));
                            if (perpDist < food.radius) {
                                hit = true;
                                break;
                            }
                        }
                    }
                    if (hit) break;
                }
                if (hit) break;
            }

            // draw the ray
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                SENSOR_LENGTH * Math.cos(angle),
                SENSOR_LENGTH * Math.sin(angle)
            );
            if (hit) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.lineWidth = 1;
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw the boid, including sensors.
     * Make sure to pass in the world's foods array when calling this:
     *   boid.draw(ctx, world.foods);
     * @param {CanvasRenderingContext2D} ctx
     * @param {Food[]} foods
     */
    draw(ctx, foods = [], neuralCtx) {

        this.brain.draw(neuralCtx,20,20);

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.orientation);

        // Draw boid body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#0f0';
        ctx.fill();
        ctx.strokeStyle = '#080';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw velocity vector
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.strokeStyle = '#00f';
        ctx.lineWidth = 2;
        ctx.lineTo(this.speed * 0.2, 0);
        ctx.stroke();

        // Draw steering vector
        const steerLen = this.speed * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.strokeStyle = '#f0f';
        ctx.lineWidth = 2;
        ctx.lineTo(
            steerLen * Math.cos(this.steer),
            steerLen * Math.sin(this.steer)
        );
        ctx.stroke();

        // Draw input indicators
        if (this.keys['w']) { ctx.beginPath(); ctx.arc(this.radius + 8, 0, 4, 0, 2 * Math.PI); ctx.fillStyle = '#ff0'; ctx.fill(); }
        if (this.keys['s']) { ctx.beginPath(); ctx.arc(-this.radius - 8, 0, 4, 0, 2 * Math.PI); ctx.fillStyle = '#f00'; ctx.fill(); }
        if (this.keys['a']) { ctx.beginPath(); ctx.arc(0, -this.radius - 8, 4, 0, 2 * Math.PI); ctx.fillStyle = '#0ff'; ctx.fill(); }
        if (this.keys['d']) { ctx.beginPath(); ctx.arc(0, this.radius + 8, 4, 0, 2 * Math.PI); ctx.fillStyle = '#f0f'; ctx.fill(); }

        // Draw sensors on top, highlighting hits
        this.drawSensors(ctx, foods);

        // Draw lifespan text unrotated
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        const text = Math.round(this.lifespan).toString();
        const textWidth = ctx.measureText(text).width;
        const sx = this.position.x - textWidth / 2;
        const sy = this.position.y - this.radius - 14;
        ctx.fillText(text, sx, sy);
        ctx.restore();

        ctx.restore();
    }
}
