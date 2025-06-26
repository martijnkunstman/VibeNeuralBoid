// This code defines a simple neural network with a customizable number of hidden layers and neurons.
// Each layer consists of weights and biases, and the network can perform feedforward operations to compute
// outputs based on given inputs. The weights are initialized randomly, and the activation function used is the sigmoid function.
// This structure allows for flexibility in designing neural networks with varying architectures.
// The `NeuralNetwork` class manages the layers and the feedforward process, while the `Layer` class handles
// the individual computations for each layer, including weight application and activation function.

export class NeuralNetwork {
    constructor(inputSize, hiddenLayers, outputSize) {
        this.inputSize = inputSize;
        this.hiddenLayers = hiddenLayers; // Array of layer sizes
        this.outputSize = outputSize;
        this.layers = [];
        this.initializeNetwork();
    }

    initializeNetwork() {
        let previousLayerSize = this.inputSize;
        // Create hidden layers
        for (let size of this.hiddenLayers) {
            const layer = new Layer(previousLayerSize, size);
            this.layers.push(layer);
            previousLayerSize = size;
        }
        // Create output layer
        const outputLayer = new Layer(previousLayerSize, this.outputSize);
        this.layers.push(outputLayer);
    }

    // Method to perform feedforward operation
    // This method takes inputs, processes them through the layers, and returns the final outputs
    feedForward(inputs) {
        let outputs = inputs;
        for (const layer of this.layers) {
            outputs = layer.activate(outputs);
        }
        return outputs;
    }

    // Method to draw the neural network on a canvas
    // This method visualizes the network structure, including layers and connections
    draw(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Draw each layer
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const layerY = i * 50; // Vertical spacing between layers

            // Draw neurons in the layer
            for (let j = 0; j < layer.outputSize; j++) {
                ctx.beginPath();
                ctx.arc(0, layerY + j * 20, 10, 0, Math.PI * 2);
                ctx.fillStyle = '#00f';
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.stroke();
            }

            // Draw connections to the next layer
            if (i < this.layers.length - 1) {
                const nextLayer = this.layers[i + 1];
                for (let j = 0; j < layer.outputSize; j++) {
                    for (let k = 0; k < nextLayer.inputSize; k++) {
                        ctx.beginPath();
                        ctx.moveTo(0, layerY + j * 20);
                        ctx.lineTo(50, (i + 1) * 50 + k * 20);
                        ctx.strokeStyle = '#ccc';
                        ctx.stroke();
                    }
                }
            }
        }
        ctx.restore();
    }

    // Method to set weights for a specific layer
    setWeights(layerIndex, weights) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        this.layers[layerIndex].weights = weights;
    }

    // Method to set biases for a specific layer
    setBiases(layerIndex, biases) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        this.layers[layerIndex].biases = biases;
    }

    // Method to get weights for a specific layer
    getWeights(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        return this.layers[layerIndex].weights;
    }

    // Method to get biases for a specific layer
    getBiases(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        return this.layers[layerIndex].biases;
    }

    // Method to get the output size of the network
    getOutputSize() {
        return this.outputSize;
    }

    // Method to get the input size of the network
    getInputSize() {
        return this.inputSize;
    }

    // Method to get the number of layers in the network
    getNumberOfLayers() {
        return this.layers.length;
    }

    // Method to get the size of a specific layer
    getLayerSize(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        return this.layers[layerIndex].outputSize;
    }

    // Method to get the sizes of all layers
    getLayerSizes() {
        return this.layers.map(layer => layer.outputSize);
    }

    // Method to reset the network (e.g., for training)
    reset() {
        for (const layer of this.layers) {
            layer.weights = layer.initializeWeights(layer.inputSize, layer.outputSize);
            layer.biases.fill(0);
        }
    }

    // Method to clone the network
    clone() {
        const clonedNetwork = new NeuralNetwork(this.inputSize, this.hiddenLayers, this.outputSize);
        for (let i = 0; i < this.layers.length; i++) {
            clonedNetwork.setWeights(i, JSON.parse(JSON.stringify(this.layers[i].weights)));
            clonedNetwork.setBiases(i, JSON.parse(JSON.stringify(this.layers[i].biases)));
        }
        return clonedNetwork;
    }

    // Method to mutate the network's weights and biases
    mutate(mutationRate = 0.1, mutationAmount = 0.5) {
        for (const layer of this.layers) {
            for (let i = 0; i < layer.weights.length; i++) {
                for (let j = 0; j < layer.weights[i].length; j++) {
                    if (Math.random() < mutationRate) {
                        layer.weights[i][j] += (Math.random() * 2 - 1) * mutationAmount; // Random mutation
                    }
                }
            }
            for (let i = 0; i < layer.biases.length; i++) {
                if (Math.random() < mutationRate) {
                    layer.biases[i] += (Math.random() * 2 - 1) * mutationAmount; // Random mutation
                }
            }
        }
    }

    // Method to serialize the network to JSON
    toJSON() {
        return {
            inputSize: this.inputSize,
            hiddenLayers: this.hiddenLayers,
            outputSize: this.outputSize,
            layers: this.layers.map(layer => ({
                weights: layer.weights,
                biases: layer.biases
            }))
        };
    }

    // Method to deserialize the network from JSON
    static fromJSON(json) {
        const network = new NeuralNetwork(json.inputSize, json.hiddenLayers, json.outputSize);
        for (let i = 0; i < json.layers.length; i++) {
            network.setWeights(i, json.layers[i].weights);
            network.setBiases(i, json.layers[i].biases);
        }
        return network;
    }

    // Method to save the network to a file (using localStorage for simplicity)
    saveToFile(filename) {
        const json = JSON.stringify(this.toJSON());
        localStorage.setItem(filename, json);
    }

    // Method to load the network from a file (using localStorage for simplicity)
    static loadFromFile(filename) {
        const json = localStorage.getItem(filename);
        if (!json) {
            throw new Error(`File ${filename} not found`);
        }
        const data = JSON.parse(json);
        return NeuralNetwork.fromJSON(data);
    }

    // Method to train the network using backpropagation (not implemented in this example)
    train(inputs, targets, learningRate = 0.01) {
        // This method would implement backpropagation to adjust weights and biases based on inputs and targets
        // For simplicity, this is left unimplemented in this example
        throw new Error('Training method not implemented');
    }

    // Method to evaluate the network's performance (not implemented in this example)
    evaluate(testData) {
        // This method would evaluate the network's performance on a set of test data
        // For simplicity, this is left unimplemented in this example
        throw new Error('Evaluation method not implemented');
    }

    // Method to reset the network's state (e.g., for training)
    resetState() {
        for (const layer of this.layers) {
            layer.biases.fill(0); // Reset biases to zero
            // Weights are not reset here, as they are typically initialized once
        }
    }
}

// Layer class to represent a single layer in the neural network
class Layer {
    constructor(inputSize, outputSize) {
        this.inputSize = inputSize;
        this.outputSize = outputSize;

        // Initialize weights and biases
        this.weights = this.initializeWeights(inputSize, outputSize);
        this.biases = new Array(outputSize).fill(0);
    }

    initializeWeights(inputSize, outputSize) {
        const weights = [];
        for (let i = 0; i < outputSize; i++) {
            weights[i] = new Array(inputSize).fill(0).map(() => Math.random() * 2 - 1); // Random weights between -1 and 1
        }
        return weights;
    }

    activate(inputs) {
        const outputs = new Array(this.outputSize).fill(0);

        for (let i = 0; i < this.outputSize; i++) {
            for (let j = 0; j < this.inputSize; j++) {
                outputs[i] += inputs[j] * this.weights[i][j];
            }
            outputs[i] += this.biases[i];
            outputs[i] = this.sigmoid(outputs[i]); // Activation function
        }

        return outputs;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
}
