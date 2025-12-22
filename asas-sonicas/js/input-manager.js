// ============================================
// INPUT MANAGER v2.0 - Game Boy Controls
// ============================================
class InputManager {
    constructor() {
        this.keys = {};
        this.touches = new Map();
        this.joystickActive = false;
        this.joystickDirection = { x: 0, y: 0 };
        this.setupKeyboard();
        this.setupTouch();
        this.setupJoystick();
        
        console.log('InputManager v2.0 carregado com wasPressed()');
    }

    setupKeyboard() {
        const keyMap = {
            'ArrowUp': 'up', 'KeyW': 'up',
            'ArrowDown': 'down', 'KeyS': 'down',
            'ArrowLeft': 'left', 'KeyA': 'left',
            'ArrowRight': 'right', 'KeyD': 'right',
            'Space': 'shoot', 'KeyZ': 'shoot',
            'KeyX': 'back', 'Escape': 'back',
            'Enter': 'start',
            'ShiftLeft': 'select'
        };

        window.addEventListener('keydown', (e) => {
            const key = keyMap[e.code];
            if (key) {
                e.preventDefault();
                if (!this.keys[key]) {
                    this.keys[key] = true;
                    this.keys[key + '_pressed'] = true;
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = keyMap[e.code];
            if (key) {
                e.preventDefault();
                this.keys[key] = false;
            }
        });
    }

    setupTouch() {
        const btnA = document.getElementById('btnA');
        const btnB = document.getElementById('btnB');
        const btnStart = document.getElementById('btnStart');
        const btnSelect = document.getElementById('btnSelect');
        
        // Botão A (atirar)
        if (btnA) {
            btnA.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.shoot = true;
                this.keys.shoot_pressed = true;
            });

            btnA.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.shoot = false;
            });

            btnA.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys.shoot = false;
            });
        }

        // Botão B (voltar)
        if (btnB) {
            btnB.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.back = true;
                this.keys.back_pressed = true;
            });

            btnB.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.back = false;
            });

            btnB.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys.back = false;
            });
        }

        // Botão START (pausar)
        if (btnStart) {
            btnStart.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.start = true;
                this.keys.start_pressed = true;
            });

            btnStart.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.start = false;
            });

            btnStart.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys.start = false;
            });
        }

        // Botão SELECT
        if (btnSelect) {
            btnSelect.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.select = true;
                this.keys.select_pressed = true;
            });

            btnSelect.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.select = false;
            });

            btnSelect.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys.select = false;
            });
        }
    }

    setupJoystick() {
        const joystick = document.getElementById('joystick');
        const stick = document.getElementById('joystickStick');
        
        if (!joystick || !stick) return;

        const maxDistance = 40;
        let startX = 0;
        let startY = 0;

        const handleStart = (e) => {
            e.preventDefault();
            this.joystickActive = true;
            
            const rect = joystick.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        };

        const handleMove = (e) => {
            if (!this.joystickActive) return;
            e.preventDefault();

            const touch = e.touches ? e.touches[0] : e;
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let deltaX = touch.clientX - centerX;
            let deltaY = touch.clientY - centerY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > maxDistance) {
                deltaX = (deltaX / distance) * maxDistance;
                deltaY = (deltaY / distance) * maxDistance;
            }

            stick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

            // Normalizar direção
            this.joystickDirection.x = deltaX / maxDistance;
            this.joystickDirection.y = deltaY / maxDistance;

            // Atualizar keys baseado na direção
            const threshold = 0.3;
            this.keys.left = this.joystickDirection.x < -threshold;
            this.keys.right = this.joystickDirection.x > threshold;
            this.keys.up = this.joystickDirection.y < -threshold;
            this.keys.down = this.joystickDirection.y > threshold;
        };

        const handleEnd = (e) => {
            e.preventDefault();
            this.joystickActive = false;
            stick.style.transform = 'translate(-50%, -50%)';
            this.joystickDirection = { x: 0, y: 0 };
            this.keys.left = false;
            this.keys.right = false;
            this.keys.up = false;
            this.keys.down = false;
        };

        joystick.addEventListener('touchstart', handleStart);
        joystick.addEventListener('touchmove', handleMove);
        joystick.addEventListener('touchend', handleEnd);
        joystick.addEventListener('touchcancel', handleEnd);

        // Mouse support for testing
        joystick.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
    }

    isPressed(key) {
        return this.keys[key] || false;
    }

    wasPressed(key) {
        const pressed = this.keys[key + '_pressed'] || false;
        if (pressed) {
            this.keys[key + '_pressed'] = false;
        }
        return pressed;
    }

    reset() {
        this.keys = {};
        this.joystickDirection = { x: 0, y: 0 };
    }
}
