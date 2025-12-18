// PipeFactory.js - Gera canos de forma pseudo-aleatória
export class PipeFactory {
    constructor() {
        this.types = ['straight', 'curve', 't', 'cross'];
        this.weights = {
            'straight': 3,
            'curve': 3,
            't': 2,
            'cross': 1
        };
        this.queue = [];
    }

    // Gera a fila inicial de 4 peças (1 atual + 3 próximas)
    generateInitialQueue() {
        this.queue = [];
        for (let i = 0; i < 4; i++) {
            this.queue.push(this.generatePipe());
        }
        return this.queue;
    }

    // Gera um novo cano baseado nos pesos
    generatePipe() {
        const totalWeight = Object.values(this.weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of this.types) {
            random -= this.weights[type];
            if (random <= 0) {
                return {
                    type,
                    rotation: this.getRandomRotation()
                };
            }
        }
        
        return { type: 'straight', rotation: 0 };
    }

    getRandomRotation() {
        const rotations = [0, 90, 180, 270];
        return rotations[Math.floor(Math.random() * rotations.length)];
    }

    // Pega o próximo cano e adiciona um novo na fila
    getNext() {
        const current = this.queue.shift();
        this.queue.push(this.generatePipe());
        return current;
    }

    // Retorna o cano atual sem removê-lo
    getCurrent() {
        return this.queue[0];
    }

    // Retorna os próximos 3 canos
    getUpcoming() {
        return this.queue.slice(1, 4);
    }
}
