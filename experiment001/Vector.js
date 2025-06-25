// Vector.js - A utility class for 2D vector operations
export class Vector {
  constructor(x = 0, y = 0) {
    if (Array.isArray(x)) {
      [this.x, this.y] = x;
    } else {
      this.x = x;
      this.y = y;
    }
  }
  copy()       { return new Vector(this.x, this.y); }
  add(v)       { this.x += v.x; this.y += v.y; return this; }
  sub(v)       { this.x -= v.x; this.y -= v.y; return this; }
  mult(n)      { this.x *= n; this.y *= n; return this; }
  div(n)       { this.x /= n; this.y /= n; return this; }
  mag()        { return Math.hypot(this.x, this.y); }
  normalize()  { let m = this.mag() || 1; return this.div(m); }
  setMag(n)    { return this.normalize().mult(n); }
  limit(max)   { if (this.mag() > max) this.setMag(max); return this; }
  static fromAngle(angle) { return new Vector(Math.cos(angle), Math.sin(angle)); }
  dot(v)                { return this.x * v.x + this.y * v.y; }
  cross(v)              { return this.x * v.y - this.y * v.x; }
  distance(v)           { return Math.hypot(this.x - v.x, this.y - v.y); }
  angleBetween(v)       { return Math.acos(this.dot(v) / (this.mag() * v.mag())); }
  heading()             { return Math.atan2(this.y, this.x); }
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x; this.y = y;
    return this;
  }
  lerp(target, t)       { this.x += (target.x - this.x) * t; this.y += (target.y - this.y) * t; return this; }
  zero()                { this.x = 0; this.y = 0; return this; }
  equals(v)             { return this.x === v.x && this.y === v.y; }
  toArray()             { return [this.x, this.y]; }

  // --- Static constants ---
  static get ZERO()  { return new Vector(0, 0); }
  static get ONE()   { return new Vector(1, 1); }
  static get UP()    { return new Vector(0, -1); }
  static get DOWN()  { return new Vector(0, 1); }
  static get LEFT()  { return new Vector(-1, 0); }
  static get RIGHT() { return new Vector(1, 0); }

  // --- Random generators ---
  static random()     { return new Vector(Math.random(), Math.random()); }
  static random2D()   { return Vector.fromAngle(Math.random() * Math.PI * 2); }
}
