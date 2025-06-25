import { Food } from './Food.js';

export class World {
  constructor(width, height, ctx) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.boids = [];
    this.foods = [];
  }

  spawnFood(count = 10) {
    for (let i = 0; i < count; i++) {
      this.foods.push(new Food(
        Math.random() * this.width,
        Math.random() * this.height
      ));
    }
  }

  addBoid(boid) {
    this.boids.push(boid);
  }

  

  update(dt) {
    this.boids.forEach(b => {
      b.update(dt);
      b.edges(this);
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.foods.forEach(f => f.draw(ctx));
    this.boids.forEach(b => b.draw(this.ctx));
  }
}