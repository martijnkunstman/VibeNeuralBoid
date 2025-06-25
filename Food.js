export class Food {
  constructor(x, y, nutrition = 5) {
    this.position = new Vector(x, y);
    this.nutrition = nutrition;        // how much life it restores
    this.radius = 5;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#f80';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}