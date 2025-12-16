/**
 * Utils.js
 * Funções utilitárias para matemática, física e helpers gerais
 */

const Utils = {
    /**
     * Converte graus para radianos
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * Converte radianos para graus
     */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * Calcula distância entre dois pontos
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calcula ângulo entre dois pontos (em radianos)
     */
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Normaliza um ângulo para o range [0, 2π]
     */
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },

    /**
     * Gera número aleatório entre min e max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Gera inteiro aleatório entre min e max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Retorna elemento aleatório de um array
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Limita valor entre min e max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Interpola linearmente entre a e b
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Wrap position no canvas (teletransporte de bordas)
     */
    wrapPosition(x, y, width, height) {
        let newX = x;
        let newY = y;

        if (x < 0) newX = width;
        if (x > width) newX = 0;
        if (y < 0) newY = height;
        if (y > height) newY = 0;

        return { x: newX, y: newY };
    },

    /**
     * Verifica se um ponto está dentro de um círculo
     */
    pointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) < radius;
    },

    /**
     * Detecta colisão entre dois círculos
     */
    circleCollision(x1, y1, r1, x2, y2, r2) {
        const distance = this.distance(x1, y1, x2, y2);
        return distance < (r1 + r2);
    }
};
