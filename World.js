import { Food } from './Food.js';

export class World {
  constructor(width, height, ctx, neuralCtx) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.neuralCtx = neuralCtx; // for neural network visualization
    this.boids = [];
    this.foods = [];
    this.spawnFood(10); // spawn initial food
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
    this.boids.forEach(boid => {
      this.foods = this.foods.filter(food => {
        if (boid.position.distance(food.position) < boid.radius + food.radius) {
          boid.eat(food);
          return false; // remove eaten food
        }
        return true;
      });
      boid.update(dt, this.foods);
      boid.edges(this);
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.foods.forEach(f => f.draw(this.ctx));
    this.boids.forEach(b => b.draw(this.ctx, this.foods, this.neuralCtx));
  }

}