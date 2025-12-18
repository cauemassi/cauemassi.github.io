// ============================================
// BACKGROUND
// ============================================
class Background {
    constructor() {
        this.stars = [];
        this.clouds = [];
        this.scrollSpeed = 2;
        
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * CONFIG.width,
                y: Math.random() * CONFIG.height,
                speed: 0.5 + Math.random() * 1.5,
                size: 1 + Math.random() * 2
            });
        }

        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * CONFIG.width,
                y: Math.random() * CONFIG.height,
                width: 60 + Math.random() * 40,
                speed: 0.3 + Math.random() * 0.5
            });
        }
    }

    update() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > CONFIG.height) {
                star.y = 0;
                star.x = Math.random() * CONFIG.width;
            }
        });

        this.clouds.forEach(cloud => {
            cloud.y += cloud.speed;
            if (cloud.y > CONFIG.height) {
                cloud.y = -50;
                cloud.x = Math.random() * CONFIG.width;
            }
        });
    }

    draw(ctx) {
        // Gradiente de fundo
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(0.5, '#000066');
        gradient.addColorStop(1, '#003366');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        // Estrelas
        this.stars.forEach(star => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });

        // Nuvens
        ctx.fillStyle = 'rgba(100, 100, 150, 0.3)';
        this.clouds.forEach(cloud => {
            ctx.fillRect(cloud.x, cloud.y, cloud.width, 30);
        });
    }
}
