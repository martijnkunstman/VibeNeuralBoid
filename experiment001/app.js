import { Vehicle } from './Vehicle.js';
import { World } from './World.js';

// --- Setup ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

const world = new World(canvas.width, canvas.height, ctx);
const vehicle = new Vehicle(canvas.width / 2, canvas.height / 2);
world.addBoid(vehicle);

// --- Animation loop ---
let lastTime = performance.now();
function animate(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;
  world.update(dt);
  world.draw();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);