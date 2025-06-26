import { Food } from './Food.js';

export class World {
  constructor(width, height, ctx, neuralCtx) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.neuralCtx = neuralCtx; // for neural network visualization
    this.boids = [];
    this.foods = [];
    this.spawnFood(15); // spawn initial food
  }

  spawnFood(count = 10, minDistance = 50) {
    let attempts = 0;
    for (let i = 0; i < count; ) {
      let x = Math.random() * this.width;
      let y = Math.random() * this.height;
      let tooClose = this.foods.some(
        food => Math.hypot(food.position.x - x, food.position.y - y) < minDistance
      );
      if (!tooClose) {
        this.foods.push(new Food(x, y));
        i++;
      }
      attempts++;
      if (attempts > count * 100) break; // avoid infinite loop
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