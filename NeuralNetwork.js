// NeuralNetwork.js - Enhanced visualization with activations and weight colors

export class NeuralNetwork {
    constructor(inputSize, hiddenLayers, outputSize) {
        this.inputSize = inputSize;
        this.hiddenLayers = hiddenLayers; // Array of layer sizes
        this.outputSize = outputSize;
        this.layers = [];
        this.activations = [];
        this.initializeNetwork();
    }

    initializeNetwork() {
        let previousLayerSize = this.inputSize;
        // Create hidden layers
        for (let size of this.hiddenLayers) {
            this.layers.push(new Layer(previousLayerSize, size));
            previousLayerSize = size;
        }
        // Create output layer
        this.layers.push(new Layer(previousLayerSize, this.outputSize));
    }

    // Perform feedforward and store activations for visualization
    feedForward(inputs) {
        this.activations = [];
        let outputs = [...inputs];  // clone inputs
        this.activations.push(outputs);
        for (const layer of this.layers) {
            outputs = layer.activate(outputs);
            this.activations.push(outputs);
        }
        return outputs;
    }

    // Draw network: nodes colored by activation, connections colored by weight
    draw(ctx, x = 0, y = 0) {
        if (!this.activations.length) return; // nothing to draw
        ctx.clearRect(0, 0, 500, 500);
        
        ctx.save();
        ctx.translate(x, y);

        const layerCount = this.activations.length;
        const layerSpacingX = 120;
        const neuronSpacingY = 40;
        const neuronRadius = 12;

        // compute max neurons for vertical centering
        const maxNeurons = Math.max(...this.activations.map(a => a.length));

        // precompute neuron positions
        const positions = [];
        for (let l = 0; l < layerCount; l++) {
            const neurons = this.activations[l];
            const xPos = l * layerSpacingX;
            const offsetY = ((maxNeurons - neurons.length) * neuronSpacingY) / 2;
            positions[l] = neurons.map((_, i) => ({ x: xPos, y: offsetY + i * neuronSpacingY }));
        }

        // draw connections with weight-based coloring
        for (let l = 1; l < layerCount; l++) {
            const weights = this.layers[l - 1].weights; // [output][input]
            // compute max abs weight for normalization
            let maxW = 0;
            weights.forEach(row => row.forEach(w => { maxW = Math.max(maxW, Math.abs(w)); }));

            for (let i = 0; i < weights.length; i++) {
                for (let j = 0; j < weights[i].length; j++) {
                    const w = weights[i][j];
                    const p0 = positions[l - 1][j];
                    const p1 = positions[l][i];
                    const intensity = maxW > 0 ? Math.abs(w) / maxW : 0;
                    const color = w >= 0
                        ? `rgba(0,128,0,${intensity})`
                        : `rgba(255,0,0,${intensity})`;
                    ctx.strokeStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(p0.x, p0.y);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.stroke();
                }
            }
        }

        // draw neurons with activation value labels
        for (let l = 0; l < layerCount; l++) {
            const neurons = this.activations[l];
            for (let i = 0; i < neurons.length; i++) {
                const { x: nx, y: ny } = positions[l][i];
                const v = neurons[i];
                // fill color based on activation
                ctx.fillStyle = `rgba(0,0,255,${v})`;
                ctx.beginPath();
                ctx.arc(nx, ny, neuronRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
                // draw activation value text
                ctx.fillStyle = '#000';
                ctx.font = '10px Arial';
                const text = v.toFixed(2);
                ctx.fillText(text, nx + neuronRadius + 4, ny + 4);
            }
        }

        ctx.restore();
    }

    // Existing methods for weights, biases, serialization, etc.
    setWeights(layerIndex, weights) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        this.layers[layerIndex].weights = weights;
    }

    setBiases(layerIndex, biases) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        this.layers[layerIndex].biases = biases;
    }

    getWeights(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        return this.layers[layerIndex].weights;
    }

    getBiases(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        return this.layers[layerIndex].biases;
    }

    getOutputSize() { return this.outputSize; }
    getInputSize() { return this.inputSize; }
    getNumberOfLayers() { return this.layers.length; }

    getLayerSize(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) {
            throw new Error('Layer index out of bounds');
        }
        return this.layers[layerIndex].outputSize;
    }

    getLayerSizes() {
        return this.layers.map(layer => layer.outputSize);
    }

    reset() {
        for (const layer of this.layers) {
            layer.weights = layer.initializeWeights(layer.inputSize, layer.outputSize);
            layer.biases.fill(0);
        }
    }

    clone() {
        const clone = new NeuralNetwork(this.inputSize, this.hiddenLayers, this.outputSize);
        for (let i = 0; i < this.layers.length; i++) {
            clone.setWeights(i, JSON.parse(JSON.stringify(this.layers[i].weights)));
            clone.setBiases(i, JSON.parse(JSON.stringify(this.layers[i].biases)));
        }
        return clone;
    }

    mutate(mutationRate = 0.1, mutationAmount = 0.5) {
        for (const layer of this.layers) {
            for (let i = 0; i < layer.weights.length; i++) {
                for (let j = 0; j < layer.weights[i].length; j++) {
                    if (Math.random() < mutationRate) {
                        layer.weights[i][j] += (Math.random() * 2 - 1) * mutationAmount;
                    }
                }
            }
            for (let i = 0; i < layer.biases.length; i++) {
                if (Math.random() < mutationRate) {
                    layer.biases[i] += (Math.random() * 2 - 1) * mutationAmount;
                }
            }
        }
    }

    toJSON() {
        return {
            inputSize: this.inputSize,
            hiddenLayers: this.hiddenLayers,
            outputSize: this.outputSize,
            layers: this.layers.map(layer => ({ weights: layer.weights, biases: layer.biases }))
        };
    }

    static fromJSON(json) {
        const net = new NeuralNetwork(json.inputSize, json.hiddenLayers, json.outputSize);
        for (let i = 0; i < json.layers.length; i++) {
            net.setWeights(i, json.layers[i].weights);
            net.setBiases(i, json.layers[i].biases);
        }
        return net;
    }

    saveToFile(filename) {
        const json = JSON.stringify(this.toJSON());
        localStorage.setItem(filename, json);
    }

    static loadFromFile(filename) {
        const json = localStorage.getItem(filename);
        if (!json) throw new Error(`File ${filename} not found`);
        return NeuralNetwork.fromJSON(JSON.parse(json));
    }

    train() { throw new Error('Training not implemented'); }
    evaluate() { throw new Error('Evaluation not implemented'); }
    resetState() { this.layers.forEach(layer => layer.biases.fill(0)); }
}

// Internal Layer class
class Layer {
    constructor(inputSize, outputSize) {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        this.weights = this.initializeWeights(inputSize, outputSize);
        this.biases = new Array(outputSize).fill(0);
    }

    initializeWeights(inputSize, outputSize) {
        return Array.from({ length: outputSize }, () =>
            Array.from({ length: inputSize }, () => Math.random() * 2 - 1)
        );
    }

    activate(inputs) {
        const outputs = new Array(this.outputSize);
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.biases[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += inputs[j] * this.weights[i][j];
            }
            outputs[i] = 1 / (1 + Math.exp(-sum)); // sigmoid
        }
        return outputs;
    }
}
