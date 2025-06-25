export class World {
  constructor(width, height, ctx) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.boids = [];
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
    this.boids.forEach(b => b.draw(this.ctx));
  }
}