// Utility.js - Utility classes for common operations
export class Utility {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  static map(value, inMin, inMax, outMin, outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
  }

  static randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  static lerp(start, end, t) {
    return start + (end - start) * t;
  }

  static easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

export class RandomSeed {
  constructor(seed) {
    this.seed = seed;
    this.originalSeed = seed;
  }

  next() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  random() {
    return this.next();
  }

  randomRange(min, max) {
    return min + this.random() * (max - min);
  }

  reset() {
    this.seed = this.originalSeed;
  }
}