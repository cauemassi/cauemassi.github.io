/**
 * ProceduralSprites.js
 * Sistema de geração procedural de sprites para o jogo
 * Todos os gráficos são gerados programaticamente sem uso de imagens externas
 */

const ProceduralSprites = {
    /**
     * Gera forma irregular de asteroide
     * Algoritmo: Cria pontos ao redor de um círculo com variações aleatórias no raio
     * @param {number} radius - Raio base do asteroide
     * @param {number} vertexCount - Número de vértices (quanto maior, mais suave)
     * @returns {Array} Array de pontos {x, y} relativos ao centro
     */
    generateAsteroidShape(radius, vertexCount = 8) {
        const shape = [];
        const angleStep = (Math.PI * 2) / vertexCount;
        
        for (let i = 0; i < vertexCount; i++) {
            const angle = angleStep * i;
            // Variação aleatória de 60% a 100% do raio para irregularidade
            const variation = Utils.random(0.6, 1.0);
            const r = radius * variation;
            
            shape.push({
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r
            });
        }
        
        return shape;
    },

    /**
     * Desenha asteroide no canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} rotation - Rotação em radianos
     * @param {Array} shape - Forma do asteroide (array de pontos)
     * @param {string} color - Cor do asteroide
     */
    drawAsteroid(ctx, x, y, rotation, shape, color = '#0f0') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        // Desenha o polígono irregular
        if (shape.length > 0) {
            ctx.moveTo(shape[0].x, shape[0].y);
            for (let i = 1; i < shape.length; i++) {
                ctx.lineTo(shape[i].x, shape[i].y);
            }
            ctx.closePath();
        }
        
        ctx.stroke();
        ctx.restore();
    },

    /**
     * Desenha nave do jogador
     * Formato triangular clássico do Asteroids
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} rotation - Rotação em radianos
     * @param {boolean} thrustActive - Se o propulsor está ativo
     */
    drawShip(ctx, x, y, rotation, thrustActive = false) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // Corpo da nave (triângulo)
        ctx.beginPath();
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.moveTo(15, 0);      // Ponta frontal
        ctx.lineTo(-10, -10);   // Asa esquerda
        ctx.lineTo(-5, 0);      // Centro traseiro
        ctx.lineTo(-10, 10);    // Asa direita
        ctx.closePath();
        ctx.stroke();
        
        // Chama do propulsor
        if (thrustActive) {
            ctx.beginPath();
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.moveTo(-5, -3);
            ctx.lineTo(-12, 0);
            ctx.lineTo(-5, 3);
            ctx.stroke();
            
            // Efeito de brilho
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 1;
            ctx.moveTo(-5, -2);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-5, 2);
            ctx.stroke();
        }
        
        ctx.restore();
    },

    /**
     * Desenha projétil
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     */
    drawProjectile(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    /**
     * Cria partículas de explosão
     * @param {number} x - Posição X da explosão
     * @param {number} y - Posição Y da explosão
     * @param {number} count - Número de partículas
     * @returns {Array} Array de partículas
     */
    createExplosion(x, y, count = 15) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(50, 150);
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,  // Vida de 0 a 1
                maxLife: Utils.random(0.3, 0.8),
                size: Utils.random(2, 4)
            });
        }
        
        return particles;
    },

    /**
     * Desenha partícula
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Object} particle - Objeto partícula
     */
    drawParticle(ctx, particle) {
        ctx.save();
        
        // Cor muda de branco/amarelo para vermelho conforme a vida diminui
        const intensity = particle.life;
        const r = 255;
        const g = Math.floor(255 * intensity);
        const b = 0;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.globalAlpha = intensity;
        ctx.shadowBlur = 5;
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * intensity, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    /**
     * Atualiza partícula
     * @param {Object} particle - Objeto partícula
     * @param {number} deltaTime - Tempo decorrido desde último frame
     * @returns {boolean} - true se a partícula ainda está viva
     */
    updateParticle(particle, deltaTime) {
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        particle.life -= deltaTime / particle.maxLife;
        
        // Aplicar resistência do ar
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        
        return particle.life > 0;
    }
};
