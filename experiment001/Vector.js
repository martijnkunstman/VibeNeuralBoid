// --- Vector utility class ---
export class Vector {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  copy() { return new Vector(this.x, this.y); }
  add(v) { this.x += v.x; this.y += v.y; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; return this; }
  mult(n) { this.x *= n; this.y *= n; return this; }
  div(n) { this.x /= n; this.y /= n; return this; }
  mag() { return Math.hypot(this.x, this.y); }
  normalize() { let m = this.mag() || 1; return this.div(m); }
  setMag(n) { return this.normalize().mult(n); }
  limit(max) {
    if (this.mag() > max) this.setMag(max);
    return this;
  }
  static fromAngle(angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }
}