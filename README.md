# VibeNeuralBoid

I try to vibe code and learn more about the ins and outs of a simple neural network....

# 2D Boid Simulation with Neural Steering

A simple browser-based 2D boid (agent) simulation powered by a neural network “brain” and evolved via a genetic algorithm. Agents (“boids”) sense nearby food, steer and accelerate, and learn over generations to maximize food intake and lifespan.

## Features
- **Kinematic Boid Physics**  
  Implements a bicycle‐model kinematic update for smooth acceleration, braking, and steering.  
- **Sensor-Based Inputs**  
  Boids cast multiple ray‐sensors to detect nearby food within a configurable angular field.  
- **Neural Network “Brain”**  
  Feedforward network with customizable topology. Visualizes activations and connection weights in real time.  
- **Genetic Algorithm Training**  
  Populations evolve over fixed-generation lifespans, selecting top performers and mutating offspring.  
- **Toroidal World**  
  Agents and food wrap around canvas edges seamlessly.