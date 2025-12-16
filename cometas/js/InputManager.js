/**
 * InputManager.js
 * Gerencia todas as entradas do usuário (teclado e mouse)
 * Padrão Singleton para acesso global
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            justPressed: false
        };
        
        // Mobile controls
        this.mobileControls = new MobileControls();
        
        this.setupListeners();
    }

    setupListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });

        // Mouse events
        window.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('game-canvas');
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mousedown', (e) => {
            this.mouse.pressed = true;
            this.mouse.justPressed = true;
        });

        window.addEventListener('mouseup', (e) => {
            this.mouse.pressed = false;
        });

        // Touch support para mobile
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const canvas = document.getElementById('game-canvas');
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        }, { passive: false });

        window.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mouse.pressed = true;
            this.mouse.justPressed = true;
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mouse.pressed = false;
        }, { passive: false });
    }

    /**
     * Verifica se tecla está pressionada
     */
    isKeyDown(key) {
        return this.keys[key.toLowerCase()] || this.keys[key] || false;
    }

    /**
     * Verifica movimento para frente (W ou ArrowUp ou Joystick)
     */
    isMovingForward() {
        return this.isKeyDown('w') || this.isKeyDown('ArrowUp') || this.mobileControls.isMovingForward();
    }

    /**
     * Verifica movimento para trás (S ou ArrowDown)
     */
    isMovingBackward() {
        return this.isKeyDown('s') || this.isKeyDown('ArrowDown') || this.mobileControls.isMovingBackward();
    }

    /**
     * Verifica movimento para esquerda (A ou ArrowLeft)
     */
    isMovingLeft() {
        return this.isKeyDown('a') || this.isKeyDown('ArrowLeft') || this.mobileControls.isMovingLeft();
    }

    /**
     * Verifica movimento para direita (D ou ArrowRight)
     */
    isMovingRight() {
        return this.isKeyDown('d') || this.isKeyDown('ArrowRight') || this.mobileControls.isMovingRight();
    }

    /**
     * Verifica se está atirando (Space ou Mouse ou Touch)
     */
    isShooting() {
        const spaceShooting = this.isKeyDown(' ') || this.isKeyDown('Space');
        const mouseShooting = this.mouse.justPressed;
        const touchShooting = this.mobileControls.isShooting();
        
        return spaceShooting || mouseShooting || touchShooting;
    }

    /**
     * Verifica se está usando super tiro (R ou Touch)
     */
    isUsingSuperShot() {
        return this.isKeyDown('r') || this.mobileControls.isUsingSuperShot();
    }

    /**
     * Verifica se está pausando (Escape)
     */
    isPausing() {
        return this.isKeyDown('Escape');
    }

    /**
     * Reseta flags de "just pressed" (chamar após processar input)
     */
    resetJustPressed() {
        this.mouse.justPressed = false;
    }

    /**
     * Obtém posição do mouse (ou centro do joystick para mobile)
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    /**
     * Obtém ângulo de rotação do joystick (mobile)
     * Retorna null se não estiver usando joystick
     */
    getJoystickRotation() {
        return this.mobileControls.getRotationAngle();
    }

    /**
     * Verifica se está usando controles mobile
     */
    isUsingMobile() {
        return this.mobileControls.isActive();
    }

    /**
     * Atualiza visibilidade do botão de super tiro (mobile)
     */
    updateMobileSuperShotButton(visible) {
        this.mobileControls.updateSuperShotButton(visible);
    }
}
