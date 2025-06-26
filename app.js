import { Boid } from './Boid.js';
import { World } from './World.js';

// --- Setup ---
const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
// function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
// window.addEventListener('resize', resize);
// resize();
canvas.width = 1000;
canvas.height = 1000;

// Create a neural canvas for the Boid's neural network visualization
const neuralCanvas = document.getElementById('neuralCanvas');
const neuralCtx = neuralCanvas.getContext('2d');
neuralCanvas.width = 500;
neuralCanvas.height = 500;

const world = new World(canvas.width, canvas.height, ctx, neuralCtx);
const boid = new Boid(canvas.width / 2, canvas.height / 2);
world.addBoid(boid);

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