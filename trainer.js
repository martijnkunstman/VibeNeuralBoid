import { Boid } from './Boid.js';
import { World } from './World.js';
import { Vector } from './Vector.js';

//override Random by a seed random number generator



// Get canvases and contexts
const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const neuralCanvas = document.getElementById('neuralCanvas');
const neuralCtx = neuralCanvas.getContext('2d');

neuralCanvas.width = 400;
neuralCanvas.height = 240;

canvas.width = 1000;
canvas.height = 1000;

// GA parameters
const POP_SIZE = 50;
const GEN_TIME = 30; // seconds per generation

let generation = 0;
let boids = [];
let lastTime = performance.now();
let timer = 0;

// Main world for visualization only
const world = new World(1000, 1000, ctx, neuralCtx);

// Initialize population and visualization
function initPopulation() {
    boids = [];
    world.boids = [];
    world.foods = [];

    for (let i = 0; i < POP_SIZE; i++) {
        const b = new Boid(1000 / 2, 1000 / 2);
        boids.push(b);
        if (i == 0) {
            world.addBoid(b);
        }
    }

    world.spawnFood(30); // spawn for visualization
    timer = 0;
}

// Evaluate each boid individually in its own world
function evaluateFitness() {
    const results = [];
    boids.forEach(orig => {
        // Create a test world with no drawing contexts
        const testWorld = new World(1000, 1000, null, null);
        // Clone boid with its brain
        const testBoid = new Boid(1000 / 2, 1000 / 2);
        testBoid.brain = orig.brain.clone();
        testBoid.lifespan = orig.lifespan;
        testBoid.foodEaten = 0;
        testWorld.addBoid(testBoid);
        testWorld.spawnFood(30);

        let t = 0;
        const dt = 1 / 30;
        while (t < GEN_TIME && !testBoid.dead) {
            testWorld.update(dt);
            t += dt;
        }

        const fitness = testBoid.foodEaten * 100 + testBoid.lifespan;
        results.push({ boid: orig, fitness });
    });
    return results;
}

// Evolve population without inter-competition
function evolve() {
    const results = evaluateFitness();
    // Sort by fitness descending
    results.sort((a, b) => b.fitness - a.fitness);

    // Reorder boids by performance
    boids = results.map(r => r.boid);

    // Select elites
    const eliteCount = Math.floor(POP_SIZE * 0.1);
    const elites = boids.slice(0, eliteCount);

    // Produce next generation brains
    const newBrains = [];
    // Keep elites intact
    elites.forEach(e => newBrains.push(e.brain.clone()));
    // Fill rest by cloning+mutation
    while (newBrains.length < POP_SIZE) {
        const parent = elites[Math.floor(Math.random() * elites.length)].brain;
        const child = parent.clone();
        child.mutate(0.2, 0.5);
        newBrains.push(child);
    }

    // Assign new brains and reset individuals
    boids.forEach((b, i) => {
        b.brain = newBrains[i];
        b.position = new Vector(canvas.width / 2, canvas.height / 2);
        b.lifespan = 5000;
        b.speed = 0;
        b.dead = false;
        b.foodEaten = 0;
    });

    // Reset visualization world
    world.boids = [boids[0]]; // only visualize the first boid
    world.foods = [];
    world.spawnFood(30);
    timer = 0;
    // Log generation results
    document.getElementById('console').innerText = `Generation ${generation} — Best fitness: ${results[0].fitness}`;
    console.log(`Generation ${generation} — Best fitness: ${results[0].fitness}`);
}

// Main loop
function animate(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    timer += dt;

    world.update(dt);
    world.draw();

    document.getElementById('timer').innerText = `Time: ${Math.floor(30-timer)}s`;

    if (timer >= GEN_TIME || boids.every(b => b.dead)) {
        evolve();
        generation++;
    }

    requestAnimationFrame(animate);
}

// Start training
initPopulation();
requestAnimationFrame(animate);
