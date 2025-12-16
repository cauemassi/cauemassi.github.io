export class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.isRunning = false;
        this.animationId = null;
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }

        this.updateCallback(this.deltaTime);
        this.renderCallback();

        this.animationId = requestAnimationFrame((time) => this.loop(time));
    }
}
