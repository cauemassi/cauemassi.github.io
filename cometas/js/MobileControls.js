/**
 * MobileControls.js
 * Sistema de controles touch para dispositivos móveis
 * Implementa joystick virtual e botões de ação
 */

class MobileControls {
    constructor() {
        this.active = false;
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0,
            angle: 0,
            distance: 0,
            maxDistance: 60
        };
        
        this.buttons = {
            shoot: false,
            superShoot: false,
            shootJustPressed: false,
            superShootJustPressed: false
        };
        
        this.elements = {
            joystickBase: null,
            joystickStick: null,
            btnShoot: null,
            btnSuperShoot: null
        };
        
        this.setupElements();
        this.setupListeners();
        this.checkMobileDevice();
    }

    /**
     * Configura elementos do DOM
     */
    setupElements() {
        this.elements.joystickBase = document.getElementById('joystick-base');
        this.elements.joystickStick = document.getElementById('joystick-stick');
        this.elements.btnShoot = document.getElementById('btn-shoot');
        this.elements.btnSuperShoot = document.getElementById('btn-super-shoot');
    }

    /**
     * Verifica se é dispositivo móvel
     */
    checkMobileDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.active = isMobile || isTouchDevice;
        
        if (this.active) {
            document.querySelector('.mobile-controls').style.display = 'block';
        }
    }

    /**
     * Configura event listeners
     */
    setupListeners() {
        if (!this.elements.joystickBase) return;

        // Joystick events
        this.elements.joystickBase.addEventListener('touchstart', (e) => this.onJoystickStart(e), { passive: false });
        this.elements.joystickBase.addEventListener('touchmove', (e) => this.onJoystickMove(e), { passive: false });
        this.elements.joystickBase.addEventListener('touchend', (e) => this.onJoystickEnd(e), { passive: false });

        // Shoot button
        if (this.elements.btnShoot) {
            this.elements.btnShoot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.buttons.shoot) {
                    this.buttons.shoot = true;
                    this.buttons.shootJustPressed = true;
                }
            }, { passive: false });
            
            this.elements.btnShoot.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.buttons.shoot = false;
            }, { passive: false });
        }

        // Super shoot button
        if (this.elements.btnSuperShoot) {
            this.elements.btnSuperShoot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.buttons.superShoot) {
                    this.buttons.superShoot = true;
                    this.buttons.superShootJustPressed = true;
                }
            }, { passive: false });
            
            this.elements.btnSuperShoot.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.buttons.superShoot = false;
            }, { passive: false });
        }
    }

    /**
     * Joystick touch start
     */
    onJoystickStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.elements.joystickBase.getBoundingClientRect();
        
        this.joystick.active = true;
        this.joystick.startX = rect.left + rect.width / 2;
        this.joystick.startY = rect.top + rect.height / 2;
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
        
        this.updateJoystick();
    }

    /**
     * Joystick touch move
     */
    onJoystickMove(e) {
        e.preventDefault();
        if (!this.joystick.active) return;
        
        const touch = e.touches[0];
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
        
        this.updateJoystick();
    }

    /**
     * Joystick touch end
     */
    onJoystickEnd(e) {
        e.preventDefault();
        this.joystick.active = false;
        this.joystick.deltaX = 0;
        this.joystick.deltaY = 0;
        this.joystick.distance = 0;
        
        // Reset stick position
        this.elements.joystickStick.style.transform = 'translate(-50%, -50%)';
    }

    /**
     * Atualiza posição do joystick
     */
    updateJoystick() {
        // Calcula delta
        let deltaX = this.joystick.currentX - this.joystick.startX;
        let deltaY = this.joystick.currentY - this.joystick.startY;
        
        // Calcula distância
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Limita ao máximo
        if (distance > this.joystick.maxDistance) {
            const ratio = this.joystick.maxDistance / distance;
            deltaX *= ratio;
            deltaY *= ratio;
        }
        
        // Atualiza valores
        this.joystick.deltaX = deltaX;
        this.joystick.deltaY = deltaY;
        this.joystick.distance = Math.min(distance, this.joystick.maxDistance);
        this.joystick.angle = Math.atan2(deltaY, deltaX);
        
        // Atualiza visual
        this.elements.joystickStick.style.transform = 
            `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    }

    /**
     * Verifica se está movendo para frente
     */
    isMovingForward() {
        return this.joystick.active && this.joystick.distance > 10;
    }

    /**
     * Verifica se está movendo para trás
     */
    isMovingBackward() {
        return false; // Joystick não tem ré
    }

    /**
     * Verifica se está movendo para esquerda
     */
    isMovingLeft() {
        return false; // Rotação é feita pelo ângulo do joystick
    }

    /**
     * Verifica se está movendo para direita
     */
    isMovingRight() {
        return false; // Rotação é feita pelo ângulo do joystick
    }

    /**
     * Obtém ângulo de rotação desejado
     * Retorna null se joystick não está ativo
     */
    getRotationAngle() {
        if (!this.joystick.active || this.joystick.distance < 10) {
            return null;
        }
        return this.joystick.angle;
    }

    /**
     * Verifica se está atirando
     */
    isShooting() {
        const result = this.buttons.shootJustPressed;
        return result;
    }

    /**
     * Verifica se está usando super tiro
     */
    isUsingSuperShot() {
        const result = this.buttons.superShootJustPressed;
        return result;
    }
    
    /**
     * Reseta flags de botões (chamar após processar input)
     */
    resetButtons() {
        this.buttons.shootJustPressed = false;
        this.buttons.superShootJustPressed = false;
    }

    /**
     * Atualiza visibilidade do botão de super tiro
     */
    updateSuperShotButton(visible) {
        if (this.elements.btnSuperShoot) {
            this.elements.btnSuperShoot.style.display = visible ? 'flex' : 'none';
        }
    }

    /**
     * Verifica se está ativo
     */
    isActive() {
        return this.active;
    }
}
