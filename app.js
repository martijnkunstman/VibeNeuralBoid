import { Boid } from './Boid.js';
import { World } from './World.js';

// --- Setup canvas and world ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const world = new World(canvas.width, canvas.height, ctx);
const boid = new Boid(canvas.width / 2, canvas.height / 2);
world.addBoid(boid);

// --- Input handling ---
const keys = {};
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// --- Animation loop ---
let lastTime = performance.now();
function animate(time) {
  const dt = (time - lastTime) / 1000; // in seconds
  lastTime = time;

  // controls: W/A/S/D
  if (keys['a']) boid.orientation -= boid.rotationSpeed * dt;
  if (keys['d']) boid.orientation += boid.rotationSpeed * dt;
  if (keys['w']) {
    const force = Vector.fromAngle(boid.orientation).mult(boid.thrustForce);
    boid.applyForce(force);
  }
  if (keys['s']) {
    const backForce = Vector.fromAngle(boid.orientation).mult(-boid.thrustForce);
    boid.applyForce(backForce);
  }

  world.update(dt);
  world.draw();

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);